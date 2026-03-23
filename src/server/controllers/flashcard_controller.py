from services.flashcard_services import *
from fastapi import HTTPException

async def get_5_flaschards_controller(exam_id:str,domain:str,topic:str):
    
    try:
        return await get_5_flaschards_service(exam_id,domain,topic)

    except FlashcardError as error:

        raise HTTPException(detail=error.message,status_code=error.status_code)
    
async def ask_ai_about_question_controller(userid:str,question:str,exam:str,user_question:str):
    try:

        return await ask_ai_about_question_service(userid,question,exam,user_question)

    except FlashcardError as error:

        raise HTTPException(detail=error.message,status_code=error.status_code)

