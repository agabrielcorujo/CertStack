from fastapi import HTTPException

from schemas.schema import (
    AddQuestionToDeckRequest,
    CreateDeckRequest,
    GetFlashcardsRequest,
    ReviewFlashcardRequest,
)

from services.flashcard_service import (
    FlashcardError,
    add_question_to_deck,
    create_deck,
    get_flashcards_for_review,
    get_progress_stats,
    get_user_decks,
    record_review,
)


def get_flashcards_controller(user_id: str, request: GetFlashcardsRequest):
    try:
        return get_flashcards_for_review(
            user_id=user_id,
            exam=request.exam,
            category=request.category,
            deck_id=request.deck_id,
            limit=request.limit,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

def review_flashcard_controller(user_id: str, request: ReviewFlashcardRequest):
    try:
        return record_review(
            user_id=user_id,
            question_id=request.question_id,
            was_correct=request.was_correct,
            confidence=request.confidence,
            time_taken_ms=request.time_taken_ms,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

def create_deck_controller(user_id: str, request: CreateDeckRequest):
    try:
        return create_deck(
            user_id=user_id,
            deck_name=request.deck_name,
            exam=request.exam,
            description=request.description,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

def add_question_to_deck_controller(user_id: str, request: AddQuestionToDeckRequest):
    try:
        return add_question_to_deck(
            user_id=user_id,
            deck_id=request.deck_id,
            question_id=request.question_id,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

def get_user_decks_controller(user_id: str):
    try:
        return get_user_decks(user_id=user_id)
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

def get_progress_controller(user_id: str, exam: str, category: str | None = None):
    try:
        return get_progress_stats(user_id=user_id, exam=exam, category=category)
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))
