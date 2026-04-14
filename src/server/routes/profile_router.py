from fastapi import Depends,APIRouter
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token
from controllers.profile_controller import (
    create_profile_controller,
    update_profile_controller,
    get_profile_controller,
    record_progress_controller,
)
from schemas.schema import UpdateProfileRequest,CreateProfileRequest, RecordProgressRequest

router = APIRouter(prefix="/profile",tags=["profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/create-profile")
async def sample_endpoint(Request:CreateProfileRequest,token:str = Depends(oauth2_scheme)):

    user_id = decode_access_token(token) #this automatically raises 401 unauthorized if the token is invalid

    return await create_profile_controller(user_id,Request)

@router.post("/update-profile")
async def sample_endpoint(Request:UpdateProfileRequest,token:str = Depends(oauth2_scheme)):

    user_id = decode_access_token(token) #this automatically raises 401 unauthorized if the token is invalid

    return await update_profile_controller(user_id,Request)

@router.get("/")
async def get_user(token:str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)

    return await get_profile_controller(user_id)

@router.post("/progress")
async def record_progress(request: RecordProgressRequest, token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)

    return await record_progress_controller(user_id, request)
