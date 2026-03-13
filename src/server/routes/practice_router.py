from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token
from typing import Optional

from controllers.practice_controller import (
    complete_session_controller,
    get_domains_controller,
    get_history_controller,
    get_results_controller,
    get_session_controller,
    pause_session_controller,
    resume_session_controller,
    start_practice_controller,
    submit_answer_controller,
)
from schemas.schema import StartPracticeRequest, StartSectionPracticeRequest, SubmitAnswerRequest

router = APIRouter(prefix="/practice", tags=["practice"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/start")
def start_practice(request: StartPracticeRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return start_practice_controller(user_id, request)


@router.post("/start-section")
def start_section_practice(request: StartSectionPracticeRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    # Convenience wrapper: a "section" is a single category/domain.
    return start_practice_controller(
        user_id,
        StartPracticeRequest(
            exam_name=request.exam_name,
            categories=[request.section],
            num_questions=request.num_questions,
            mode=request.mode,
            time_limit_seconds=request.time_limit_seconds,
            shuffle_seed=request.shuffle_seed,
        ),
    )


@router.get("/domains")
def list_domains(exam_name: str, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_domains_controller(user_id, exam_name)


@router.get("/history")
def get_history(limit: int = 20, exam_name: Optional[str] = None, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_history_controller(user_id, limit=limit, exam_name=exam_name)


@router.get("/session/{session_id}")
def get_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_session_controller(user_id, session_id)


@router.post("/submit")
def submit_answer(request: SubmitAnswerRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return submit_answer_controller(user_id, request)


@router.post("/pause/{session_id}")
def pause_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return pause_session_controller(user_id, session_id)


@router.post("/resume/{session_id}")
def resume_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return resume_session_controller(user_id, session_id)


@router.post("/complete/{session_id}")
def complete_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return complete_session_controller(user_id, session_id)


@router.get("/results/{session_id}")
def get_results(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return get_results_controller(user_id, session_id)
