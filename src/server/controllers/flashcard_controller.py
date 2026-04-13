from fastapi import HTTPException

from schemas.schema import (
    AddQuestionToDeckRequest,
    CreateDeckRequest,
    EndStudySessionRequest,
    GetFlashcardsRequest,
    ReviewFlashcardRequest,
)

from services.flashcard_service import (
    FlashcardError,
    add_question_to_deck,
    create_deck,
    end_study_session,
    get_flashcards_for_review,
    get_progress_stats,
    get_study_session_history,
    get_user_decks,
    record_review,
    start_study_session,
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
            session_id=request.session_id,
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


def start_study_session_controller(
    user_id: str,
    exam: str,
    category: str | None = None,
    deck_id: int | None = None,
):
    try:
        return start_study_session(
            user_id=user_id,
            exam=exam,
            category=category,
            deck_id=deck_id,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))


def end_study_session_controller(
    user_id: str,
    request: EndStudySessionRequest,
):
    try:
        return end_study_session(
            user_id=user_id,
            session_id=request.session_id,
            cards_reviewed=request.cards_reviewed,
            correct_answers=request.correct_answers,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))


def get_study_session_history_controller(
    user_id: str,
    exam: str | None = None,
    category: str | None = None,
    deck_id: int | None = None,
    include_active: bool = False,
    limit: int = 20,
    offset: int = 0,
):
    try:
        return get_study_session_history(
            user_id=user_id,
            exam=exam,
            category=category,
            deck_id=deck_id,
            include_active=include_active,
            limit=limit,
            offset=offset,
        )
    except FlashcardError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))
