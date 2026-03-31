import hashlib
import random
from pathlib import Path
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Sequence, Set, Union, Tuple

from services.services import get_exam


class PracticeError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _hash_question(question_text: str) -> str:
    return hashlib.md5(question_text.encode("utf-8")).hexdigest()


def _to_json_param(value: Any) -> Any:
    if value is None:
        return None
    return json.dumps(value)


def _from_json_value(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return value
    return value


def _db():
    """Import DB helpers lazily.

    The jwt_auth package validates DB env vars at import time. Lazy-loading lets
    non-DB helpers (like domain listing from local JSON) work without requiring
    DB configuration.
    """

    try:
        from jwt_auth.db.db import DBError, safe_query  # type: ignore

        return DBError, safe_query
    except Exception as exc:  # pragma: no cover
        raise PracticeError(message=f"Database not configured: {exc}", status_code=500)


def _sanitize_question_for_client(question: Dict[str, Any]) -> Dict[str, Any]:
    """Remove answer key material from question payloads returned to clients."""
    return {
        "question_hash": question.get("question_hash"),
        "question": question.get("question"),
        "choices": question.get("choices", []),
        "is_multiselect": question.get("is_multiselect", False),
        "category": question.get("category"),
        "difficulty": question.get("difficulty"),
    }


def _normalize_answer(value: Union[str, List[str]]) -> List[str]:
    if isinstance(value, list):
        return sorted(str(v).strip().upper() for v in value)
    return [str(value).strip().upper()]


def _compare_answers(selected: Union[str, List[str]], correct: Union[str, List[str]]) -> bool:
    return _normalize_answer(selected) == _normalize_answer(correct)


def _as_dict(row: Union[Dict[str, Any], Sequence[Any]], keys: List[str]) -> Dict[str, Any]:
    if isinstance(row, dict):
        return row
    return {keys[i]: row[i] for i in range(min(len(keys), len(row)))}


def _extract_id(row: Union[Dict[str, Any], Sequence[Any]]) -> Any:
    if isinstance(row, dict) and "id" in row:
        return row.get("id")
    if isinstance(row, (list, tuple)) and row:
        return row[0]
    return None


_DB_COLUMNS_CACHE: Dict[str, Set[str]] = {}


async def _get_table_columns(table: str) -> Set[str]:
    if table in _DB_COLUMNS_CACHE:
        return _DB_COLUMNS_CACHE[table]

    DBError, safe_query = _db()
    try:
        rows = await safe_query(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            """,
            (table,),
            fetch="all",
        )
    except Exception:
        _DB_COLUMNS_CACHE[table] = set()
        return _DB_COLUMNS_CACHE[table]

    cols: Set[str] = set()
    if rows:
        for row in rows:
            if isinstance(row, dict):
                name = row.get("column_name")
            else:
                name = row[0] if row else None
            if name:
                cols.add(str(name))

    _DB_COLUMNS_CACHE[table] = cols
    return cols


async def _has_column(table: str, column: str) -> bool:
    return column in (await _get_table_columns(table))


def _shuffle_questions(pool: List[Dict[str, Any]], shuffle_seed: Optional[int]) -> None:
    if shuffle_seed is None:
        random.shuffle(pool)
        return
    rnd = random.Random(int(shuffle_seed))
    rnd.shuffle(pool)


def _normalize_mode(mode: Optional[str]) -> str:
    value = (mode or "practice").strip().lower()
    if value not in {"practice", "exam"}:
        raise PracticeError(message="Invalid mode (expected 'practice' or 'exam')", status_code=400)
    return value


def _is_exam_mode(session: Dict[str, Any]) -> bool:
    return str(session.get("mode") or "practice").strip().lower() == "exam"


def _should_reveal_answer_key(session: Dict[str, Any]) -> bool:
    if not _is_exam_mode(session):
        return True
    return str(session.get("status") or "").strip().lower() == "completed"


def _current_session_status(session: Dict[str, Any]) -> str:
    return str(session.get("status") or "").strip().lower()


def _coerce_utc_datetime(value: Any) -> Optional[datetime]:
    if value is None:
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    if isinstance(value, str):
        candidate = value.strip()
        if not candidate:
            return None
        if candidate.endswith("Z"):
            candidate = candidate[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(candidate)
        except ValueError:
            return None
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)

    return None


def _is_exam_session_expired(session: Dict[str, Any]) -> bool:
    # Minimum viable rule: exam timer is absolute wall-clock from start_time.
    if not _is_exam_mode(session):
        return False

    status = _current_session_status(session)
    if status == "completed":
        return False

    raw_limit = session.get("time_limit_seconds")
    try:
        time_limit_seconds = int(raw_limit)
    except (TypeError, ValueError):
        return False

    if time_limit_seconds <= 0:
        return False

    start_time = _coerce_utc_datetime(session.get("start_time"))
    if start_time is None:
        return False

    expires_at = start_time + timedelta(seconds=time_limit_seconds)
    return datetime.now(timezone.utc) >= expires_at


async def _expire_exam_session_if_needed(session_id: int, user_id: str, session: Dict[str, Any]) -> None:
    if not _is_exam_session_expired(session):
        return

    DBError, safe_query = _db()
    try:
        session_cols = await _get_table_columns("practice_sessions")

        set_parts: List[str] = ["status = 'completed'", "end_time = COALESCE(end_time, NOW())"]
        if "paused_at" in session_cols:
            set_parts.append("paused_at = NULL")

        await safe_query(
            f"""
            UPDATE practice_sessions
            SET {', '.join(set_parts)}
            WHERE id = $1 AND user_id = $2 AND status != 'completed'
            """,
            (session_id, user_id),
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    session["status"] = "completed"
    if session.get("end_time") is None:
        session["end_time"] = datetime.now(timezone.utc)
    if "paused_at" in session:
        session["paused_at"] = None


def _assert_session_operation_allowed(operation: str, session: Dict[str, Any]) -> None:
    """Centralized state guard for session operations.
    """

    status = _current_session_status(session)

    if operation == "submit":
        if status == "completed":
            raise PracticeError(message="Session already completed", status_code=400)
        if status == "paused":
            raise PracticeError(message="Session is paused", status_code=400)
        if status != "in_progress":
            raise PracticeError(message="Session can only accept submissions while in_progress", status_code=400)
        return

    if operation == "pause":
        if status == "completed":
            raise PracticeError(message="Session already completed", status_code=400)
        if status != "in_progress":
            raise PracticeError(message="Session can only be paused from in_progress", status_code=400)
        return

    if operation == "resume":
        if status == "completed":
            raise PracticeError(message="Session already completed", status_code=400)
        if status != "paused":
            raise PracticeError(message="Session can only be resumed from paused", status_code=400)
        return

    if operation == "complete":
        if status == "completed":
            # Current behavior: completed sessions are terminal and completion is idempotent.
            return
        if status not in {"in_progress", "paused"}:
            raise PracticeError(
                message="Session can only be completed from in_progress or paused",
                status_code=400,
            )
        return

    raise PracticeError(message=f"Unsupported session operation: {operation}", status_code=500)


async def _ensure_practice_sessions_mode_column() -> None:
    """Best-effort schema shim until Alembic migrations land.

    Some dev DBs may not have newer columns yet. Add the minimum set needed for
    exam-mode secrecy and exam time-limit behavior.
    """

    needs_mode = not (await _has_column("practice_sessions", "mode"))
    needs_time_limit = not (await _has_column("practice_sessions", "time_limit_seconds"))

    if not needs_mode and not needs_time_limit:
        return

    DBError, safe_query = _db()
    try:
        if needs_mode:
            await safe_query(
                "ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'practice'",
                (),
            )
        if needs_time_limit:
            await safe_query(
                "ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER",
                (),
            )
    except DBError:
        return
    except Exception:
        return

    _DB_COLUMNS_CACHE.pop("practice_sessions", None)


_EXAM_DATA_SOURCES: Dict[str, Dict[str, str]] = {
    "cloud practitioner": {
        "folder": "cloudpractitioner",
        "questions_file": "cp_questions.json",
        "context_file": "cp_context.json",
    }
}


_QUESTIONS_CACHE: Dict[str, List[Dict[str, Any]]] = {}


def _normalize_exam_name(exam_name: str) -> str:
    return " ".join(str(exam_name).strip().lower().split())


def _get_exam_data_paths(exam_name: str) -> Optional[Dict[str, Path]]:
    key = _normalize_exam_name(exam_name)
    source = _EXAM_DATA_SOURCES.get(key)
    if not source:
        return None

    server_root = Path(__file__).resolve().parents[1]
    data_root = server_root / "data" / source["folder"]
    return {
        "questions": data_root / source["questions_file"],
        "context": data_root / source["context_file"],
    }


def _load_questions_from_json(exam_name: str) -> Optional[List[Dict[str, Any]]]:
    key = _normalize_exam_name(exam_name)
    if key in _QUESTIONS_CACHE:
        return _QUESTIONS_CACHE[key]

    paths = _get_exam_data_paths(exam_name)
    if not paths:
        return None

    questions_path = paths["questions"]
    if not questions_path.exists():
        return None

    try:
        with questions_path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
    except Exception as exc:  # pragma: no cover
        raise PracticeError(message=f"Failed to load questions for {exam_name}: {exc}", status_code=500)

    if not isinstance(data, list):
        raise PracticeError(message=f"Invalid question file format for {exam_name}", status_code=500)

    _QUESTIONS_CACHE[key] = data
    return data


def get_exam_domains(exam_name: str) -> List[Dict[str, Any]]:
    """Return available domains/categories for an exam.

    For Cloud Practitioner, prefers cp_context.json for canonical ordering/weights.
    Also includes per-domain question counts when possible.
    """
    normalized_exam = _normalize_exam_name(exam_name)
    questions = _load_questions_from_json(normalized_exam)

    counts: Dict[str, int] = {}
    if questions:
        for q in questions:
            if _normalize_exam_name(q.get("exam", "")) != normalized_exam:
                continue
            category = q.get("category") or "Uncategorized"
            counts[category] = counts.get(category, 0) + 1

    paths = _get_exam_data_paths(normalized_exam)
    if paths and paths["context"].exists():
        try:
            with paths["context"].open("r", encoding="utf-8") as fp:
                ctx = json.load(fp)
        except Exception:
            ctx = {}

        domain_weights = ctx.get("domain_weights") or []
        domains: List[Dict[str, Any]] = []
        for entry in domain_weights:
            name = entry.get("domain_name")
            if not name:
                continue
            domains.append(
                {
                    "domain_name": name,
                    "weight_percentage": entry.get("weight_percentage"),
                    "question_count": counts.get(name, 0),
                }
            )

        remaining = sorted([c for c in counts.keys() if c not in {d["domain_name"] for d in domains}])
        for name in remaining:
            domains.append({"domain_name": name, "weight_percentage": None, "question_count": counts.get(name, 0)})

        return domains

    return [
        {"domain_name": name, "weight_percentage": None, "question_count": counts.get(name, 0)}
        for name in sorted(counts.keys())
    ]


def _fetch_question_pool_from_local_data(exam_name: str, categories: List[str]) -> Optional[List[Dict[str, Any]]]:
    normalized_exam = _normalize_exam_name(exam_name)
    raw_questions = _load_questions_from_json(normalized_exam)
    if not raw_questions:
        return None

    target_categories: Optional[Set[str]] = None
    if categories:
        canon: Dict[str, str] = {}
        for domain in get_exam_domains(normalized_exam):
            name = domain.get("domain_name")
            if name:
                canon[str(name).strip().lower()] = name

        target_categories = {canon.get(str(c).strip().lower(), str(c).strip()) for c in categories}

    pool: Dict[str, Dict[str, Any]] = {}
    for q in raw_questions:
        if _normalize_exam_name(q.get("exam", "")) != normalized_exam:
            continue

        category = q.get("category") or "Uncategorized"
        if target_categories is not None and category not in target_categories:
            continue

        question_text = q.get("question")
        if not question_text:
            continue

        answer = q.get("answer")
        question_hash = _hash_question(question_text)
        pool[question_hash] = {
            "question_hash": question_hash,
            "question": question_text,
            "choices": q.get("choices", []),
            "answer": answer,
            "is_multiselect": bool(q.get("is_multiselect")) or isinstance(answer, list),
            "category": category,
            "difficulty": q.get("difficulty"),
        }

    return list(pool.values())


def _fetch_question_pool(exam_name: str, categories: List[str]) -> List[Dict[str, Any]]:
    local_pool = _fetch_question_pool_from_local_data(exam_name, categories)
    if local_pool is not None:
        return local_pool

    # Fallback: vector store retrieval (note: limited by k in get_exam())
    pool: Dict[str, Dict[str, Any]] = {}
    target_categories = categories if categories else [""]

    for category in target_categories:
        questions = get_exam(exam_name, category)
        for question in questions:
            question_text = question.get("question")
            if not question_text:
                continue
            question_hash = _hash_question(question_text)
            pool[question_hash] = {
                "question_hash": question_hash,
                "question": question_text,
                "choices": question.get("choices", []),
                "answer": question.get("answer"),
                "is_multiselect": isinstance(question.get("answer"), list),
                "category": question.get("category", category) or "Uncategorized",
                "difficulty": question.get("difficulty"),
            }
    return list(pool.values())


async def create_practice_session(
    user_id: str,
    exam_name: str,
    categories: List[str],
    num_questions: int,
    mode: Optional[str] = "practice",
    time_limit_seconds: Optional[int] = None,
    shuffle_seed: Optional[int] = None,
) -> Dict[str, Any]:
    pool = _fetch_question_pool(exam_name, categories)
    if not pool:
        raise PracticeError(message="No questions available for the selected categories", status_code=404)

    mode = _normalize_mode(mode)
    _shuffle_questions(pool, shuffle_seed)
    questions = pool[: max(1, num_questions)]

    await _ensure_practice_sessions_mode_column()

    DBError, safe_query = _db()

    session_cols = await _get_table_columns("practice_sessions")
    include_mode = "mode" in session_cols
    include_time_limit = "time_limit_seconds" in session_cols
    include_seed = "shuffle_seed" in session_cols
    include_last_activity = "last_activity_at" in session_cols

    columns: List[str] = []
    values_sql: List[str] = []
    params: List[Any] = []

    def add_value(column: str, value: Any = None, *, literal_sql: Optional[str] = None) -> None:
        columns.append(column)
        if literal_sql is not None:
            values_sql.append(literal_sql)
            return
        params.append(value)
        values_sql.append(f"${len(params)}")

    add_value("user_id", user_id)
    add_value("exam_name", exam_name)
    add_value("selected_categories", categories)
    add_value("total_questions", len(questions))
    add_value("status", "in_progress")
    add_value("start_time", literal_sql="NOW()")
    add_value("question_set", _to_json_param(questions))
    values_sql[-1] = f"{values_sql[-1]}::jsonb"

    if include_mode:
        add_value("mode", mode)

    if include_time_limit:
        add_value("time_limit_seconds", time_limit_seconds)

    if include_seed:
        add_value("shuffle_seed", shuffle_seed)

    if include_last_activity:
        add_value("last_activity_at", literal_sql="NOW()")

    try:
        res = await safe_query(
            f"""
            INSERT INTO practice_sessions ({', '.join(columns)})
            VALUES ({', '.join(values_sql)})
            RETURNING id
            """,
            tuple(params),
            fetch="one",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    session_id = _extract_id(res)
    if session_id is None:
        raise PracticeError(message="Failed to create practice session", status_code=500)

    return {"session_id": session_id, "questions": [_sanitize_question_for_client(q) for q in questions]}


async def get_session(
    session_id: int,
    user_id: str,
    include_answer_key: bool = False,
    *,
    sanitize_answers: bool = True,
) -> Dict[str, Any]:
    await _ensure_practice_sessions_mode_column()

    session_cols = await _get_table_columns("practice_sessions")
    optional_cols = [
        c
        for c in [
            "mode",
            "time_limit_seconds",
            "shuffle_seed",
            "last_activity_at",
            "paused_at",
            "correct_count",
            "answered_count",
        ]
        if c in session_cols
    ]

    base_cols = [
        "id",
        "exam_name",
        "selected_categories",
        "total_questions",
        "status",
        "start_time",
        "end_time",
        "question_set",
    ]
    session_keys = base_cols + optional_cols

    DBError, safe_query = _db()
    try:
        session_row = await safe_query(
            f"""
            SELECT {', '.join(session_keys)}
            FROM practice_sessions
            WHERE id = $1 AND user_id = $2
            """,
            (session_id, user_id),
            fetch="one",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    if not session_row:
        raise PracticeError(message="Session not found", status_code=404)

    session = _as_dict(session_row, session_keys)

    session["question_set"] = _from_json_value(session.get("question_set"))

    await _expire_exam_session_if_needed(session_id, user_id, session)

    # Normalize paused state for clients.
    if session.get("status") == "paused" and "paused_at" not in session:
        session["paused_at"] = None

    # Do not leak answer keys via the session payload unless explicitly requested.
    if not include_answer_key:
        question_set = session.get("question_set", []) or []
        if isinstance(question_set, list):
            session["question_set"] = [_sanitize_question_for_client(q) for q in question_set]

    try:
        answer_cols = await _get_table_columns("user_answers")
        extra_answer_cols = [c for c in ["difficulty", "is_multiselect", "is_skipped"] if c in answer_cols]
        answer_select = [
            "question_hash",
            "question_text",
            "selected_answer",
            "correct_answer",
            "is_correct",
            "flagged",
            "time_spent_seconds",
            "answered_at",
            "category",
        ] + extra_answer_cols

        answers_rows = await safe_query(
            f"""
            SELECT {', '.join(answer_select)}
            FROM user_answers
            WHERE session_id = $1
            ORDER BY answered_at
            """,
            (session_id,),
            fetch="all",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    answers: List[Dict[str, Any]] = []
    if answers_rows:
        for row in answers_rows:
            keys = [
                "question_hash",
                "question_text",
                "selected_answer",
                "correct_answer",
                "is_correct",
                "flagged",
                "time_spent_seconds",
                "answered_at",
                "category",
            ] + extra_answer_cols
            answers.append(
                _as_dict(row, keys)
            )

    for ans in answers:
        ans["selected_answer"] = _from_json_value(ans.get("selected_answer"))
        ans["correct_answer"] = _from_json_value(ans.get("correct_answer"))

    if sanitize_answers and (not _should_reveal_answer_key(session)):
        for ans in answers:
            ans.pop("correct_answer", None)
            ans.pop("is_correct", None)

    return {
        "session": session,
        "answers": answers,
    }


async def submit_answer(
    session_id: int,
    user_id: str,
    question_hash: str,
    selected_answer: Optional[Union[str, List[str]]],
    time_spent_seconds: Union[int, None],
    flagged: bool,
    is_skipped: bool = False,
) -> Dict[str, Any]:
    session_data = await get_session(session_id, user_id, include_answer_key=True, sanitize_answers=False)
    session = session_data.get("session", {})
    _assert_session_operation_allowed("submit", session)

    question_set: List[Dict[str, Any]] = session.get("question_set", []) or []
    target_question = next((q for q in question_set if q.get("question_hash") == question_hash), None)
    if not target_question:
        raise PracticeError(message="Question not found in session", status_code=404)

    correct_answer = target_question.get("answer")
    if is_skipped:
        is_correct = False
        normalized_selected = None
    else:
        if selected_answer is None:
            raise PracticeError(message="selected_answer is required unless is_skipped=true", status_code=400)
        is_correct = _compare_answers(selected_answer, correct_answer)
        normalized_selected = selected_answer

    DBError, safe_query = _db()
    try:
        existing = await safe_query(
            "SELECT id FROM user_answers WHERE session_id = $1 AND question_hash = $2",
            (session_id, question_hash),
            fetch="one",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    try:
        answer_cols = await _get_table_columns("user_answers")

        if existing:
            set_parts: List[str] = []
            update_params: List[Any] = []

            def add_set(column: str, value: Any, *, cast_jsonb: bool = False) -> None:
                update_params.append(value)
                placeholder = f"${len(update_params)}"
                if cast_jsonb:
                    placeholder = f"{placeholder}::jsonb"
                set_parts.append(f"{column} = {placeholder}")

            add_set("selected_answer", _to_json_param(normalized_selected), cast_jsonb=True)
            add_set("is_correct", is_correct)
            add_set("flagged", flagged)
            add_set("time_spent_seconds", time_spent_seconds)

            if "difficulty" in answer_cols:
                add_set("difficulty", target_question.get("difficulty"))

            if "is_multiselect" in answer_cols:
                add_set("is_multiselect", bool(target_question.get("is_multiselect")))

            if "is_skipped" in answer_cols:
                add_set("is_skipped", bool(is_skipped))

            set_parts.append("answered_at = NOW()")

            update_params.extend([session_id, question_hash])
            where_session = f"${len(update_params) - 1}"
            where_hash = f"${len(update_params)}"

            await safe_query(
                f"""
                UPDATE user_answers
                SET {', '.join(set_parts)}
                WHERE session_id = {where_session} AND question_hash = {where_hash}
                RETURNING id
                """,
                tuple(update_params),
                fetch="one",
            )
        else:
            insert_cols: List[str] = []
            insert_vals: List[str] = []
            insert_params: List[Any] = []

            def add_insert(
                column: str, value: Any = None, *, literal_sql: Optional[str] = None, cast_jsonb: bool = False
            ) -> None:
                insert_cols.append(column)
                if literal_sql is not None:
                    insert_vals.append(literal_sql)
                    return
                insert_params.append(value)
                placeholder = f"${len(insert_params)}"
                if cast_jsonb:
                    placeholder = f"{placeholder}::jsonb"
                insert_vals.append(placeholder)

            add_insert("session_id", session_id)
            add_insert("question_hash", question_hash)
            add_insert("question_text", target_question.get("question"))
            add_insert("selected_answer", _to_json_param(normalized_selected), cast_jsonb=True)
            add_insert("correct_answer", _to_json_param(correct_answer), cast_jsonb=True)
            add_insert("is_correct", is_correct)
            add_insert("flagged", flagged)
            add_insert("time_spent_seconds", time_spent_seconds)
            add_insert("answered_at", literal_sql="NOW()")
            add_insert("category", target_question.get("category"))

            if "difficulty" in answer_cols:
                add_insert("difficulty", target_question.get("difficulty"))

            if "is_multiselect" in answer_cols:
                add_insert("is_multiselect", bool(target_question.get("is_multiselect")))

            if "is_skipped" in answer_cols:
                add_insert("is_skipped", bool(is_skipped))

            await safe_query(
                f"""
                INSERT INTO user_answers ({', '.join(insert_cols)})
                VALUES ({', '.join(insert_vals)})
                RETURNING id
                """,
                tuple(insert_params),
                fetch="one",
            )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    # Best-effort update session activity timestamp if supported.
    try:
        if await _has_column("practice_sessions", "last_activity_at"):
            await safe_query(
                "UPDATE practice_sessions SET last_activity_at = NOW() WHERE id = $1 AND user_id = $2",
                (session_id, user_id),
            )
    except Exception:
        pass

    if not _should_reveal_answer_key(session):
        return {"question_hash": question_hash}

    return {"question_hash": question_hash, "is_correct": is_correct, "correct_answer": correct_answer}


async def pause_session(session_id: int, user_id: str) -> Dict[str, Any]:
    session_data = await get_session(session_id, user_id, sanitize_answers=False)
    session = session_data.get("session", {})
    _assert_session_operation_allowed("pause", session)

    DBError, safe_query = _db()
    try:
        has_paused_at = await _has_column("practice_sessions", "paused_at")
        has_last_activity = await _has_column("practice_sessions", "last_activity_at")

        if has_paused_at:
            set_parts: List[str] = []
            params: List[Any] = []

            params.append("paused")
            set_parts.append(f"status = ${len(params)}")
            set_parts.append("paused_at = NOW()")
            if has_last_activity:
                set_parts.append("last_activity_at = NOW()")

            params.extend([session_id, user_id, "completed"])
            where_id = f"${len(params) - 2}"
            where_user = f"${len(params) - 1}"
            where_completed = f"${len(params)}"

            await safe_query(
                f"""
                UPDATE practice_sessions
                SET {', '.join(set_parts)}
                WHERE id = {where_id} AND user_id = {where_user} AND status != {where_completed}
                RETURNING id
                """,
                tuple(params),
                fetch="one",
            )
        else:
            await safe_query(
                """
                UPDATE practice_sessions
                SET status = $1
                WHERE id = $2 AND user_id = $3 AND status != $4
                RETURNING id
                """,
                ("paused", session_id, user_id, "completed"),
                fetch="one",
            )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    return {"session_id": session_id, "status": "paused"}


async def resume_session(session_id: int, user_id: str) -> Dict[str, Any]:
    session_data = await get_session(session_id, user_id, sanitize_answers=False)
    session = session_data.get("session", {})
    _assert_session_operation_allowed("resume", session)

    DBError, safe_query = _db()
    try:
        has_paused_at = await _has_column("practice_sessions", "paused_at")
        has_last_activity = await _has_column("practice_sessions", "last_activity_at")

        if has_paused_at:
            set_parts: List[str] = []
            params: List[Any] = []

            params.append("in_progress")
            set_parts.append(f"status = ${len(params)}")
            set_parts.append("paused_at = NULL")
            if has_last_activity:
                set_parts.append("last_activity_at = NOW()")

            params.extend([session_id, user_id, "completed"])
            where_id = f"${len(params) - 2}"
            where_user = f"${len(params) - 1}"
            where_completed = f"${len(params)}"

            await safe_query(
                f"""
                UPDATE practice_sessions
                SET {', '.join(set_parts)}
                WHERE id = {where_id} AND user_id = {where_user} AND status != {where_completed}
                RETURNING id
                """,
                tuple(params),
                fetch="one",
            )
        else:
            await safe_query(
                """
                UPDATE practice_sessions
                SET status = $1
                WHERE id = $2 AND user_id = $3 AND status != $4
                RETURNING id
                """,
                ("in_progress", session_id, user_id, "completed"),
                fetch="one",
            )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    return {"session_id": session_id, "status": "in_progress"}


async def complete_session(session_id: int, user_id: str) -> Dict[str, Any]:
    data = await get_session(session_id, user_id, sanitize_answers=False)
    session = data.get("session", {})
    answers = data.get("answers", [])

    _assert_session_operation_allowed("complete", session)

    if _current_session_status(session) == "completed":
        return await get_session_results(session_id, user_id)

    total_questions = session.get("total_questions", len(session.get("question_set", [])))
    total_answered = len(answers)
    correct_count = len([a for a in answers if a.get("is_correct")])

    score_pct = 0.0
    if total_questions:
        score_pct = round((correct_count / total_questions) * 100, 2)

    DBError, safe_query = _db()
    try:
        session_cols = await _get_table_columns("practice_sessions")
        if "correct_count" in session_cols or "answered_count" in session_cols:
            await safe_query(
                """
                UPDATE practice_sessions
                SET status = $1, end_time = NOW(), correct_count = $2, answered_count = $3
                WHERE id = $4 AND user_id = $5
                RETURNING id
                """,
                ("completed", correct_count, total_answered, session_id, user_id),
                fetch="one",
            )
        else:
            await safe_query(
                """
                UPDATE practice_sessions
                SET status = $1, end_time = NOW()
                WHERE id = $2 AND user_id = $3
                RETURNING id
                """,
                ("completed", session_id, user_id),
                fetch="one",
            )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    return {
        "session_id": session_id,
        "total_questions": total_questions,
        "answered": total_answered,
        "correct": correct_count,
        "score_percent": score_pct,
    }


async def get_session_results(session_id: int, user_id: str) -> Dict[str, Any]:
    data = await get_session(session_id, user_id, sanitize_answers=False)
    session = data.get("session", {})
    answers = data.get("answers", [])

    if _is_exam_mode(session) and str(session.get("status") or "").strip().lower() != "completed":
        raise PracticeError(message="Results are only available after exam completion", status_code=400)

    total_questions = session.get("total_questions", len(session.get("question_set", [])))
    correct_count = len([a for a in answers if a.get("is_correct")])
    score_pct = 0.0
    if total_questions:
        score_pct = round((correct_count / total_questions) * 100, 2)

    category_breakdown: Dict[str, Dict[str, int]] = {}
    for ans in answers:
        category = ans.get("category") or "Uncategorized"
        bucket = category_breakdown.setdefault(category, {"correct": 0, "total": 0})
        bucket["total"] += 1
        if ans.get("is_correct"):
            bucket["correct"] += 1

    # Ensure we never return answer keys inside the question_set.
    question_set = session.get("question_set", []) or []
    if isinstance(question_set, list):
        session["question_set"] = [_sanitize_question_for_client(q) for q in question_set]

    return {
        "session": session,
        "answers": answers,
        "score_percent": score_pct,
        "category_breakdown": category_breakdown,
    }


async def get_practice_history(user_id: str, limit: int = 20, exam_name: Optional[str] = None) -> List[Dict[str, Any]]:
    limit = max(1, min(int(limit), 100))
    params: List[Any] = []
    exam_filter_sql = ""

    params.append(user_id)
    if exam_name:
        params.append(exam_name)
        exam_filter_sql = f" AND ps.exam_name = ${len(params)}"

    params.append(limit)
    limit_placeholder = f"${len(params)}"

    DBError, safe_query = _db()
    try:
        rows = await safe_query(
            f"""
            SELECT
                ps.id,
                ps.exam_name,
                ps.selected_categories,
                ps.total_questions,
                ps.status,
                ps.start_time,
                ps.end_time,
                COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) AS correct,
                COALESCE(COUNT(ua.question_hash), 0) AS answered
            FROM practice_sessions ps
            LEFT JOIN user_answers ua ON ua.session_id = ps.id
            WHERE ps.user_id = $1{exam_filter_sql}
            GROUP BY ps.id
            ORDER BY ps.start_time DESC
            LIMIT {limit_placeholder}
            """,
            tuple(params),
            fetch="all",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    history: List[Dict[str, Any]] = []
    if rows:
        for row in rows:
            item = _as_dict(
                row,
                [
                    "session_id",
                    "exam_name",
                    "selected_categories",
                    "total_questions",
                    "status",
                    "start_time",
                    "end_time",
                    "correct",
                    "answered",
                ],
            )
            total_questions = item.get("total_questions") or 0
            correct = item.get("correct") or 0
            item["score_percent"] = round((correct / total_questions) * 100, 2) if total_questions else 0.0
            history.append(item)
    return history
