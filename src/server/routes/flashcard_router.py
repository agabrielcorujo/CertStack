from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token

from controllers.flashcard_controller import (
    add_question_to_deck_controller,
    create_deck_controller,
    end_study_session_controller,
    get_flashcards_controller,
    get_progress_controller,
    get_user_decks_controller,
    review_flashcard_controller,
    start_study_session_controller,
)

from schemas.schema import (
    AddQuestionToDeckRequest,
    CreateDeckRequest,
    EndStudySessionRequest,
    GetFlashcardsRequest,
    ReviewFlashcardRequest,
    StartStudySessionRequest,
)

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/review")
def get_flashcards(request: GetFlashcardsRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_flashcards_controller(user_id, request)

@router.post("/record")
def record_flashcard_review(
    request: ReviewFlashcardRequest,
    token: str = Depends(oauth2_scheme),
):
    user_id = decode_access_token(token)
    return review_flashcard_controller(user_id, request)

@router.post("/decks")
def create_user_deck(request: CreateDeckRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return create_deck_controller(user_id, request)

@router.get("/decks")
def get_user_flashcard_decks(token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_user_decks_controller(user_id)

@router.post("/decks/add-question")
def add_question(request: AddQuestionToDeckRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return add_question_to_deck_controller(user_id, request)

@router.get("/progress")
def get_flashcard_progress(
    exam: str,
    category: str | None = None,
    token: str = Depends(oauth2_scheme),
):
    user_id = decode_access_token(token)
    return get_progress_controller(user_id, exam, category)


@router.post("/sessions/start")
def start_review_session(
    request: StartStudySessionRequest,
    token: str = Depends(oauth2_scheme),
):
    user_id = decode_access_token(token)
    return start_study_session_controller(
        user_id=user_id,
        exam=request.exam,
        category=request.category,
        deck_id=request.deck_id,
    )


@router.post("/sessions/end")
def end_review_session(
    request: EndStudySessionRequest,
    token: str = Depends(oauth2_scheme),
):
    user_id = decode_access_token(token)
    return end_study_session_controller(user_id=user_id, request=request)
