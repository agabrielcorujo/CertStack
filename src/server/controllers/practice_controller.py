from fastapi import HTTPException

from schemas.schema import StartPracticeRequest, SubmitAnswerRequest
from services.practice_services import (
    PracticeError,
    complete_session,
    create_practice_session,
    get_session,
    get_session_results,
    submit_answer,
)


def start_practice_controller(user_id: str, request: StartPracticeRequest):
    try:
        return create_practice_session(
            user_id=user_id,
            exam_name=request.exam_name,
            categories=request.categories,
            num_questions=request.num_questions,
        )
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


def get_session_controller(user_id: str, session_id: int):
    try:
        return get_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


def submit_answer_controller(user_id: str, request: SubmitAnswerRequest):
    try:
        return submit_answer(
            session_id=request.session_id,
            user_id=user_id,
            question_hash=request.question_hash,
            selected_answer=request.selected_answer,
            time_spent_seconds=request.time_spent_seconds,
            flagged=request.flagged,
        )
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


def complete_session_controller(user_id: str, session_id: int):
    try:
        return complete_session(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


def get_results_controller(user_id: str, session_id: int):
    try:
        return get_session_results(session_id=session_id, user_id=user_id)
    except PracticeError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
