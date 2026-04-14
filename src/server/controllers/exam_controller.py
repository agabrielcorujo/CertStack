from fastapi import HTTPException

from services.exam_services import ExamError, get_exam_questions, list_exams


async def get_exam_questions_controller(exam_name: str, limit_per_domain: int = 17):
    try:
        return await get_exam_questions(exam_name, limit_per_domain)

    except ExamError as error:
        raise HTTPException(detail=error.message, status_code=error.status_code)


async def list_exams_controller():
    try:
        return await list_exams()
    except ExamError as error:
        raise HTTPException(detail=error.message, status_code=error.status_code)
