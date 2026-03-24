from datetime import date, timedelta
from typing import Optional
from jwt_auth.db.db import DBError, safe_query

#flashcard service skeleton
#implements flashcard flow for upcoming iterations

class FlashcardError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def get_flashcards_for_review(
    user_id: str,
    exam: str,
    category: Optional[str],
    deck_id: Optional[int],
    limit: int = 20,
):
    """selects flashcards for a user session. to be implemented..."""
    raise NotImplementedError("get_flashcards_for_review is not implemented yet")

def record_review(
    user_id: str,
    question_id: str,
    was_correct: bool,
    confidence: Optional[int] = None,
    time_taken_ms: Optional[int] = None,
    today: Optional[date] = None,
):
    """records a review result and updates spaced-repetition fields"""
    normalized_question_id = question_id.strip()

    if not normalized_question_id:
        raise FlashcardError("question_id is required", 400)

    if confidence is not None and (confidence < 1 or confidence > 5):
        raise FlashcardError("confidence must be between 1 and 5", 400)

    if time_taken_ms is not None and time_taken_ms < 0:
        raise FlashcardError("time_taken_ms must be >= 0", 400)

    review_day = today or date.today()

    try:
        existing = safe_query(
            """
            SELECT
                exam,
                category,
                ease_factor,
                interval_days,
                repetition_count,
                correct_count,
                incorrect_count
            FROM flashcard_progress
            WHERE user_id = %s AND question_id = %s
            """,
            (user_id, normalized_question_id),
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    quality = _calculate_quality_score(was_correct, confidence)

    if existing:
        current_exam = existing[0]
        current_category = existing[1] or ""
        ease_factor = float(existing[2] or 2.5)
        interval_days = int(existing[3] or 1)
        repetition_count = int(existing[4] or 0)
        correct_count = int(existing[5] or 0)
        incorrect_count = int(existing[6] or 0)
    else:
        current_exam, current_category = _resolve_exam_and_category_for_question(
            user_id=user_id,
            question_id=normalized_question_id,
        )
        ease_factor = 2.5
        interval_days = 1
        repetition_count = 0
        correct_count = 0
        incorrect_count = 0

    next_ease_factor = _next_ease_factor(ease_factor, quality)
    next_interval = _next_interval_days(repetition_count, interval_days, next_ease_factor, was_correct)
    next_repetition_count = repetition_count + 1
    next_correct_count = correct_count + (1 if was_correct else 0)
    next_incorrect_count = incorrect_count + (0 if was_correct else 1)
    next_review_date = review_day + timedelta(days=next_interval)

    if existing:
        query = """
            UPDATE flashcard_progress
            SET
                ease_factor = %s,
                interval_days = %s,
                repetition_count = %s,
                correct_count = %s,
                incorrect_count = %s,
                next_review_date = %s,
                last_reviewed_at = NOW()
            WHERE user_id = %s AND question_id = %s
        """
        params = (
            next_ease_factor,
            next_interval,
            next_repetition_count,
            next_correct_count,
            next_incorrect_count,
            next_review_date,
            user_id,
            normalized_question_id,
        )
    else:
        query = """
            INSERT INTO flashcard_progress (
                user_id,
                question_id,
                exam,
                category,
                ease_factor,
                interval_days,
                repetition_count,
                correct_count,
                incorrect_count,
                next_review_date,
                last_reviewed_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        params = (
            user_id,
            normalized_question_id,
            current_exam,
            current_category,
            next_ease_factor,
            next_interval,
            next_repetition_count,
            next_correct_count,
            next_incorrect_count,
            next_review_date,
        )

    try:
        safe_query(query, params, insert=True)
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    return {
        "status": "success",
        "question_id": normalized_question_id,
        "schedule": {
            "exam": current_exam,
            "category": current_category,
            "quality": quality,
            "ease_factor": round(next_ease_factor, 4),
            "interval_days": next_interval,
            "next_review_date": str(next_review_date),
        },
        "counts": {
            "repetition_count": next_repetition_count,
            "correct_count": next_correct_count,
            "incorrect_count": next_incorrect_count,
        },
    }

def create_deck(user_id: str, deck_name: str, exam: str, description: Optional[str] = None):
    """creates a custom deck for a user and returns the new deck id"""
    deck_name = deck_name.strip()
    exam = exam.strip().lower()

    if not deck_name:
        raise FlashcardError("deck_name is required", 400)

    if not exam:
        raise FlashcardError("exam is required", 400)

    try:
        existing = safe_query(
            """
            SELECT id
            FROM user_flashcard_decks
            WHERE user_id = %s AND lower(deck_name) = lower(%s)
            """,
            (user_id, deck_name),
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    if existing:
        raise FlashcardError("deck with this name already exists", 409)

    try:
        created = safe_query(
            """
            INSERT INTO user_flashcard_decks (user_id, deck_name, exam, description)
            VALUES (%s, %s, %s, %s)
            RETURNING id, deck_name, exam, description, created_at
            """,
            (user_id, deck_name, exam, description),
            insert=True,
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    if not created:
        raise FlashcardError("error creating deck", 500)

    return {
        "status": "success",
        "deck": {
            "id": created[0],
            "deck_name": created[1],
            "exam": created[2],
            "description": created[3],
            "created_at": str(created[4]),
        },
    }

def add_question_to_deck(user_id: str, deck_id: int, question_id: str):
    """adds a question id to a user owned deck"""
    question_id = question_id.strip()

    if not question_id:
        raise FlashcardError("question_id is required", 400)

    _ensure_deck_ownership(user_id, deck_id)

    try:
        exists = safe_query(
            """
            SELECT 1
            FROM flashcard_deck_questions
            WHERE deck_id = %s AND question_id = %s
            """,
            (deck_id, question_id),
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    if exists:
        return {
            "status": "success",
            "message": "question already exists in deck",
            "deck_id": deck_id,
            "question_id": question_id,
        }

    try:
        safe_query(
            """
            INSERT INTO flashcard_deck_questions (deck_id, question_id)
            VALUES (%s, %s)
            """,
            (deck_id, question_id),
            insert=True,
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    return {
        "status": "success",
        "deck_id": deck_id,
        "question_id": question_id,
    }

def get_user_decks(user_id: str):
    """returns all decks for a user including card counts"""
    try:
        rows = safe_query(
            """
            SELECT
                d.id,
                d.deck_name,
                d.exam,
                d.description,
                d.created_at,
                COUNT(q.question_id) AS card_count
            FROM user_flashcard_decks d
            LEFT JOIN flashcard_deck_questions q ON q.deck_id = d.id
            WHERE d.user_id = %s
            GROUP BY d.id, d.deck_name, d.exam, d.description, d.created_at
            ORDER BY d.created_at DESC
            """,
            (user_id,),
            fetch="all",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    decks = []
    for row in rows or []:
        decks.append(
            {
                "id": row[0],
                "deck_name": row[1],
                "exam": row[2],
                "description": row[3],
                "created_at": str(row[4]),
                "card_count": int(row[5]),
            }
        )

    return {"status": "success", "decks": decks}

def get_progress_stats(user_id: str, exam: str, category: Optional[str] = None):
    """Aggregates flashcard progress and session stats for dashboards."""
    normalized_exam = exam.strip().lower()
    normalized_category = (category or "").strip()

    if not normalized_exam:
        raise FlashcardError("exam is required", 400)

    progress_filter_sql, progress_params = _build_exam_category_filter(
        user_id=user_id,
        exam=normalized_exam,
        category=normalized_category,
    )

    try:
        progress_row = safe_query(
            f"""
            SELECT
                COUNT(*) AS tracked_cards,
                COALESCE(SUM(correct_count), 0) AS correct_reviews,
                COALESCE(SUM(incorrect_count), 0) AS incorrect_reviews,
                COALESCE(SUM(repetition_count), 0) AS total_reviews,
                COALESCE(SUM(CASE WHEN next_review_date <= CURRENT_DATE THEN 1 ELSE 0 END), 0) AS due_cards,
                COALESCE(AVG(ease_factor), 2.5) AS average_ease_factor,
                COALESCE(AVG(interval_days), 1) AS average_interval_days
            FROM flashcard_progress
            WHERE {progress_filter_sql}
            """,
            progress_params,
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    session_filter_sql = "user_id = %s AND exam = %s"
    session_params: tuple = (user_id, normalized_exam)

    if normalized_category:
        session_filter_sql += " AND category = %s"
        session_params = (user_id, normalized_exam, normalized_category)

    try:
        sessions_row = safe_query(
            f"""
            SELECT
                COUNT(*) AS session_count,
                COALESCE(SUM(cards_reviewed), 0) AS session_cards_reviewed,
                COALESCE(SUM(correct_answers), 0) AS session_correct_answers,
                MAX(ended_at) AS last_session_at
            FROM flashcard_study_sessions
            WHERE {session_filter_sql}
            """,
            session_params,
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    try:
        category_rows = safe_query(
            """
            SELECT
                category,
                COUNT(*) AS tracked_cards,
                COALESCE(SUM(correct_count), 0) AS correct_reviews,
                COALESCE(SUM(incorrect_count), 0) AS incorrect_reviews,
                COALESCE(SUM(CASE WHEN next_review_date <= CURRENT_DATE THEN 1 ELSE 0 END), 0) AS due_cards
            FROM flashcard_progress
            WHERE user_id = %s AND exam = %s
            GROUP BY category
            ORDER BY category ASC
            """,
            (user_id, normalized_exam),
            fetch="all",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    tracked_cards = int(progress_row[0] or 0)
    correct_reviews = int(progress_row[1] or 0)
    incorrect_reviews = int(progress_row[2] or 0)
    total_reviews = int(progress_row[3] or 0)
    due_cards = int(progress_row[4] or 0)
    average_ease_factor = round(float(progress_row[5] or 2.5), 2)
    average_interval_days = round(float(progress_row[6] or 1), 2)

    session_count = int(sessions_row[0] or 0)
    session_cards_reviewed = int(sessions_row[1] or 0)
    session_correct_answers = int(sessions_row[2] or 0)
    last_session_at = sessions_row[3]

    overall_accuracy = _safe_percentage(correct_reviews, correct_reviews + incorrect_reviews)
    session_accuracy = _safe_percentage(session_correct_answers, session_cards_reviewed)

    category_breakdown = []
    for row in category_rows or []:
        category_name = row[0] or ""
        category_correct = int(row[2] or 0)
        category_incorrect = int(row[3] or 0)
        category_breakdown.append(
            {
                "category": category_name,
                "tracked_cards": int(row[1] or 0),
                "due_cards": int(row[4] or 0),
                "accuracy_percent": _safe_percentage(
                    category_correct,
                    category_correct + category_incorrect,
                ),
            }
        )

    return {
        "status": "success",
        "exam": normalized_exam,
        "category_filter": normalized_category if normalized_category else None,
        "summary": {
            "tracked_cards": tracked_cards,
            "due_cards": due_cards,
            "total_reviews": total_reviews,
            "correct_reviews": correct_reviews,
            "incorrect_reviews": incorrect_reviews,
            "overall_accuracy_percent": overall_accuracy,
            "average_ease_factor": average_ease_factor,
            "average_interval_days": average_interval_days,
        },
        "sessions": {
            "session_count": session_count,
            "cards_reviewed": session_cards_reviewed,
            "correct_answers": session_correct_answers,
            "session_accuracy_percent": session_accuracy,
            "last_session_at": str(last_session_at) if last_session_at else None,
        },
        "category_breakdown": category_breakdown,
    }


def _ensure_deck_ownership(user_id: str, deck_id: int):
    try:
        deck = safe_query(
            """
            SELECT id
            FROM user_flashcard_decks
            WHERE id = %s AND user_id = %s
            """,
            (deck_id, user_id),
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    if not deck:
        raise FlashcardError("deck not found", 404)


def _build_exam_category_filter(user_id: str, exam: str, category: str):
    sql_filter = "user_id = %s AND exam = %s"
    params: tuple = (user_id, exam)

    if category:
        sql_filter += " AND category = %s"
        params = (user_id, exam, category)

    return sql_filter, params


def _safe_percentage(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 2)


def _calculate_quality_score(was_correct: bool, confidence: Optional[int]) -> int:
    if confidence is None:
        return 4 if was_correct else 2

    clamped = max(1, min(5, confidence))
    if was_correct:
        return clamped
    return min(2, clamped)


def _next_ease_factor(current_ease_factor: float, quality: int) -> float:
    adjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    return max(1.3, current_ease_factor + adjustment)


def _next_interval_days(repetition_count: int, current_interval_days: int, ease_factor: float, was_correct: bool) -> int:
    if not was_correct:
        return 1

    if repetition_count == 0:
        return 1
    if repetition_count == 1:
        return 6

    grown_interval = int(round(current_interval_days * ease_factor))
    return max(1, grown_interval)


def _resolve_exam_and_category_for_question(user_id: str, question_id: str):
    try:
        row = safe_query(
            """
            SELECT d.exam
            FROM flashcard_deck_questions q
            JOIN user_flashcard_decks d ON d.id = q.deck_id
            WHERE d.user_id = %s AND q.question_id = %s
            ORDER BY q.created_at ASC
            LIMIT 1
            """,
            (user_id, question_id),
            fetch="one",
        )
    except DBError as error:
        raise FlashcardError(status_code=error.status_code, message=error.message)

    if row:
        return row[0], ""

    return "unknown", ""
