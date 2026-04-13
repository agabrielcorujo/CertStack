from services.flashcard_services import *
from services.llm_service import *
from fastapi import HTTPException

async def get_5_flaschards_controller(exam_name:str,domain:str,subdomain:str=None):
    
    try:
        return await get_5_flaschards_service(exam_name,domain,subdomain)

    except FlashcardError as error:

        raise HTTPException(detail=error.message,status_code=error.status_code)
    
async def ask_ai_about_question_controller(userid:str,question:str,exam:str,user_question:str):
    try:

        return await ask_ai_about_question_service(userid,question,exam,user_question)

    except LLMError as error:

        raise HTTPException(detail=error.message,status_code=error.status_code)

