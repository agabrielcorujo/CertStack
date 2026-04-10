from fastapi import HTTPException

from services.exam_services import ExamError, get_exam_questions


async def get_exam_questions_controller(exam_id: str):
    try:
        return await get_exam_questions(exam_id)

    except ExamError as error:
        raise HTTPException(detail=error.message, status_code=error.status_code)
