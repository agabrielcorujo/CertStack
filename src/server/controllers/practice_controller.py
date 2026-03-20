from fastapi import HTTPException
from typing import Optional

from schemas.schema import StartPracticeRequest, SubmitAnswerRequest
from services.practice_services import (
    PracticeError,
    complete_session,
    create_practice_session,
    get_exam_domains,
    get_practice_history,
    get_session,
    get_session_results,
    pause_session,
    resume_session,
    submit_answer,
)


async def start_practice_controller(user_id: str, request: StartPracticeRequest):
    try:
        return await create_practice_session(
            user_id=user_id,
            exam_name=request.exam_name,
            categories=request.categories,
            num_questions=request.num_questions,
            mode=request.mode,
            time_limit_seconds=request.time_limit_seconds,
            shuffle_seed=request.shuffle_seed,
        )
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def get_session_controller(user_id: str, session_id: int):
    try:
        return await get_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def submit_answer_controller(user_id: str, request: SubmitAnswerRequest):
    try:
        return await submit_answer(
            session_id=request.session_id,
            user_id=user_id,
            question_hash=request.question_hash,
            selected_answer=request.selected_answer,
            time_spent_seconds=request.time_spent_seconds,
            flagged=request.flagged,
            is_skipped=request.is_skipped,
        )
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def pause_session_controller(user_id: str, session_id: int):
    try:
        return await pause_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def resume_session_controller(user_id: str, session_id: int):
    try:
        return await resume_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def complete_session_controller(user_id: str, session_id: int):
    try:
        return await complete_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def get_results_controller(user_id: str, session_id: int):
    try:
        return await get_session_results(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


def get_domains_controller(user_id: str, exam_name: str):
    # user_id is currently unused but kept for auth parity.
    try:
        return {"exam_name": exam_name, "domains": get_exam_domains(exam_name)}
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


async def get_history_controller(user_id: str, limit: int = 20, exam_name: Optional[str] = None):
    try:
        return {"history": await get_practice_history(user_id=user_id, limit=limit, exam_name=exam_name)}
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
