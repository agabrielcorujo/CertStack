from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token

from controllers.practice_controller import (
    complete_session_controller,
    get_results_controller,
    get_session_controller,
    start_practice_controller,
    submit_answer_controller,
)
from schemas.schema import StartPracticeRequest, SubmitAnswerRequest

router = APIRouter(prefix="/practice", tags=["practice"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/start")
def start_practice(request: StartPracticeRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return start_practice_controller(user_id, request)


@router.get("/session/{session_id}")
def get_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_session_controller(user_id, session_id)


@router.post("/submit")
def submit_answer(request: SubmitAnswerRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return submit_answer_controller(user_id, request)


@router.post("/complete/{session_id}")
def complete_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return complete_session_controller(user_id, session_id)


@router.get("/results/{session_id}")
def get_results(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_results_controller(user_id, session_id)
