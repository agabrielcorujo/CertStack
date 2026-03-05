from datetime import datetime
import hashlib
import random
from typing import Any, Dict, List, Sequence, Tuple, Union

from jwt_auth.db.db import DBError, safe_query
from services.services import get_exam


class PracticeError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _hash_question(question_text: str) -> str:
    return hashlib.md5(question_text.encode("utf-8")).hexdigest()


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


def _fetch_question_pool(exam_name: str, categories: List[str]) -> List[Dict[str, Any]]:
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
                "category": question.get("category", category),
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

    session_id = _extract_id(res)
    if session_id is None:
        raise PracticeError(message="Failed to create practice session", status_code=500)

    return {"session_id": session_id, "questions": questions}


def get_session(session_id: int, user_id: str) -> Dict[str, Any]:
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

    if not session_row:
        raise PracticeError(message="Session not found", status_code=404)

    session = _as_dict(session_row, session_keys)

    try:
        answers_rows = safe_query(
            """
            SELECT question_hash, selected_answer, is_correct, flagged, time_spent_seconds, answered_at
            FROM user_answers
            WHERE session_id = %s
            ORDER BY answered_at
            """,
            (session_id,),
            fetch="all",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)

    answers: List[Dict[str, Any]] = []
    if answers_rows:
        for row in answers_rows:
            answers.append(
                _as_dict(
                    row,
                    [
                        "question_hash",
                        "selected_answer",
                        "is_correct",
                        "flagged",
                        "time_spent_seconds",
                        "answered_at",
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
    session_data = get_session(session_id, user_id)
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

    try:
        existing = safe_query(
            "SELECT id FROM user_answers WHERE session_id = %s AND question_hash = %s",
            (session_id, question_hash),
            fetch="one",
        )
    except DBError as error:
        raise PracticeError(status_code=error.status_code, message=error.message)

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

    return {
        "session": session,
        "answers": answers,
        "score_percent": score_pct,
        "category_breakdown": category_breakdown,
    }
