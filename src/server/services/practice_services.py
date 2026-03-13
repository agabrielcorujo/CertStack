import hashlib
import random
from pathlib import Path
import json
from typing import Any, Dict, List, Optional, Sequence, Set, Union

from services.services import get_exam


class PracticeError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _hash_question(question_text: str) -> str:
    return hashlib.md5(question_text.encode("utf-8")).hexdigest()


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


def create_practice_session(
    user_id: str,
    exam_name: str,
    categories: List[str],
    num_questions: int,
) -> Dict[str, Any]:
    pool = _fetch_question_pool(exam_name, categories)
    if not pool:
        raise PracticeError(message="No questions available for the selected categories", status_code=404)

    random.shuffle(pool)
    questions = pool[: max(1, num_questions)]

    DBError, safe_query = _db()
    try:
        res = safe_query(
            """
            INSERT INTO practice_sessions (user_id, exam_name, selected_categories, total_questions, status, start_time, question_set)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)
            RETURNING id
            """,
            (user_id, exam_name, categories, len(questions), "in_progress", questions),
            insert=True,
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


def get_session(session_id: int, user_id: str, include_answer_key: bool = False) -> Dict[str, Any]:
    session_keys = [
        "id",
        "exam_name",
        "selected_categories",
        "total_questions",
        "status",
        "start_time",
        "end_time",
        "question_set",
    ]

    DBError, safe_query = _db()
    try:
        session_row = safe_query(
            """
            SELECT id, exam_name, selected_categories, total_questions, status, start_time, end_time, question_set
            FROM practice_sessions
            WHERE id = %s AND user_id = %s
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

    # Do not leak answer keys via the session payload unless explicitly requested.
    if not include_answer_key:
        question_set = session.get("question_set", []) or []
        if isinstance(question_set, list):
            session["question_set"] = [_sanitize_question_for_client(q) for q in question_set]

    try:
        answers_rows = safe_query(
            """
            SELECT question_hash, question_text, selected_answer, correct_answer, is_correct, flagged, time_spent_seconds, answered_at, category
            FROM user_answers
            WHERE session_id = %s
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
            answers.append(
                _as_dict(
                    row,
                    [
                        "question_hash",
                        "question_text",
                        "selected_answer",
                        "correct_answer",
                        "is_correct",
                        "flagged",
                        "time_spent_seconds",
                        "answered_at",
                        "category",
                    ],
                )
            )

    return {
        "session": session,
        "answers": answers,
    }


def submit_answer(
    session_id: int,
    user_id: str,
    question_hash: str,
    selected_answer: Union[str, List[str]],
    time_spent_seconds: Union[int, None],
    flagged: bool,
) -> Dict[str, Any]:
    session_data = get_session(session_id, user_id, include_answer_key=True)
    session = session_data.get("session", {})

    if session.get("status") == "completed":
        raise PracticeError(message="Session already completed", status_code=400)

    question_set: List[Dict[str, Any]] = session.get("question_set", []) or []
    target_question = next((q for q in question_set if q.get("question_hash") == question_hash), None)
    if not target_question:
        raise PracticeError(message="Question not found in session", status_code=404)

    correct_answer = target_question.get("answer")
    is_correct = _compare_answers(selected_answer, correct_answer)

    normalized_selected = selected_answer

    DBError, safe_query = _db()
    try:
        existing = safe_query(
            "SELECT id FROM user_answers WHERE session_id = %s AND question_hash = %s",
            (session_id, question_hash),
            fetch="one",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    try:
        if existing:
            safe_query(
                """
                UPDATE user_answers
                SET selected_answer = %s, is_correct = %s, flagged = %s, time_spent_seconds = %s, answered_at = NOW()
                WHERE session_id = %s AND question_hash = %s
                RETURNING id
                """,
                (
                    normalized_selected,
                    is_correct,
                    flagged,
                    time_spent_seconds,
                    session_id,
                    question_hash,
                ),
                insert=True,
                fetch="one",
            )
        else:
            safe_query(
                """
                INSERT INTO user_answers (
                    session_id, question_hash, question_text, selected_answer, correct_answer, is_correct, flagged, time_spent_seconds, answered_at, category
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s)
                RETURNING id
                """,
                (
                    session_id,
                    question_hash,
                    target_question.get("question"),
                    normalized_selected,
                    correct_answer,
                    is_correct,
                    flagged,
                    time_spent_seconds,
                    target_question.get("category"),
                ),
                insert=True,
                fetch="one",
            )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)
    except Exception as exc:
        raise PracticeError(message=str(exc), status_code=500)

    return {
        "question_hash": question_hash,
        "is_correct": is_correct,
        "correct_answer": correct_answer,
    }


def complete_session(session_id: int, user_id: str) -> Dict[str, Any]:
    data = get_session(session_id, user_id)
    session = data.get("session", {})
    answers = data.get("answers", [])

    if session.get("status") == "completed":
        return get_session_results(session_id, user_id)

    total_questions = session.get("total_questions", len(session.get("question_set", [])))
    total_answered = len(answers)
    correct_count = len([a for a in answers if a.get("is_correct")])

    score_pct = 0.0
    if total_questions:
        score_pct = round((correct_count / total_questions) * 100, 2)

    DBError, safe_query = _db()
    try:
        safe_query(
            """
            UPDATE practice_sessions
            SET status = %s, end_time = NOW()
            WHERE id = %s AND user_id = %s
            RETURNING id
            """,
            ("completed", session_id, user_id),
            insert=True,
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


def get_session_results(session_id: int, user_id: str) -> Dict[str, Any]:
    data = get_session(session_id, user_id)
    session = data.get("session", {})
    answers = data.get("answers", [])

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


def get_practice_history(user_id: str, limit: int = 20, exam_name: Optional[str] = None) -> List[Dict[str, Any]]:
    limit = max(1, min(int(limit), 100))
    params: List[Any] = [user_id]
    exam_filter_sql = ""
    if exam_name:
        exam_filter_sql = " AND ps.exam_name = %s"
        params.append(exam_name)
    params.append(limit)

    DBError, safe_query = _db()
    try:
        rows = safe_query(
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
            WHERE ps.user_id = %s{exam_filter_sql}
            GROUP BY ps.id
            ORDER BY ps.start_time DESC
            LIMIT %s
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
