from datetime import date
from typing import Optional

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
    """creates a custom deck for a user. to be implemented..."""
    raise NotImplementedError("create_deck is not implemented yet")

def add_question_to_deck(user_id: str, deck_id: int, question_id: str):
    """adds a question to a user owned deck. to be implemented..."""
    raise NotImplementedError("add_question_to_deck is not implemented yet")

def get_user_decks(user_id: str):
    """returns decks owned by the user. to be implemented..."""
    raise NotImplementedError("get_user_decks is not implemented yet")

def get_progress_stats(user_id: str, exam: str, category: Optional[str] = None):
    """aggregates user progress for dashboards. to be implemented..."""
    raise NotImplementedError("get_progress_stats is not implemented yet")
