from controllers.flashcard_controller import *
from fastapi import Depends,APIRouter
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token
from schemas.schema import FlashcardAIRequest

router = APIRouter(prefix="/flashcards",tags=["flashcards"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.get("/")
async def get_5_cards(exam_name:str,domain:str,subdomain:str=None,limit: int = 10, token:str = Depends(oauth2_scheme)):

    decode_access_token(token)

    return await get_5_flaschards_controller(exam_name,domain,subdomain,limit)

@router.get("/ai/")
async def ask_ai_about_question(question:str,exam:str,user_question:str,token:str = Depends(oauth2_scheme)):
    
    user_id = decode_access_token(token)

    return await ask_ai_about_question_controller(user_id,question,exam,user_question)


@router.post("/ai/")
async def ask_ai_about_question_post(request: FlashcardAIRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)

    return await ask_ai_about_question_controller(
        user_id,
        request.question,
        request.exam,
        request.user_question,
        request.choices,
        request.answer,
        request.explanation,
    )
