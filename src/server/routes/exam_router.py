from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from controllers.exam_controller import get_exam_questions_controller
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token

router = APIRouter(prefix="/exams", tags=["exams"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.get("/")
async def get_exam_questions(exam_name: str, token: str = Depends(oauth2_scheme)):
    decode_access_token(token)

    return await get_exam_questions_controller(exam_name)
