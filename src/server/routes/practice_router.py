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
async def start_practice(request: StartPracticeRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await start_practice_controller(user_id, request)


@router.post("/start-section")
async def start_section_practice(request: StartSectionPracticeRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    # Convenience wrapper: a "section" is a single category/domain.
    return await start_practice_controller(
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
async def get_history(limit: int = 20, exam_name: Optional[str] = None, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await get_history_controller(user_id, limit=limit, exam_name=exam_name)


@router.get("/session/{session_id}")
async def get_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await get_session_controller(user_id, session_id)


@router.post("/submit")
async def submit_answer(request: SubmitAnswerRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await submit_answer_controller(user_id, request)


@router.post("/pause/{session_id}")
async def pause_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await pause_session_controller(user_id, session_id)


@router.post("/resume/{session_id}")
async def resume_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await resume_session_controller(user_id, session_id)


@router.post("/complete/{session_id}")
async def complete_session(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await complete_session_controller(user_id, session_id)


@router.get("/results/{session_id}")
async def get_results(session_id: int, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    return await get_results_controller(user_id, session_id)
