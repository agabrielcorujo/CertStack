from datetime import date
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
    """records a review outcome and updates scheduling. to be implemented..."""
    raise NotImplementedError("record_review is not implemented yet")

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
    """returns all decks for a user, including card counts"""
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
    """aggregates user progress for dashboards. to be implemented..."""
    raise NotImplementedError("get_progress_stats is not implemented yet")


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
