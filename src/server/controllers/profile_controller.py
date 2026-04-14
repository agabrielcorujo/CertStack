from services.profile_services import *
from schemas.schema import CreateProfileRequest,UpdateProfileRequest, RecordProgressRequest
from fastapi import HTTPException

async def create_profile_controller(user_id:str,request:CreateProfileRequest):

    try:
        return await create_profile(user_id,request.certs)

    except ProfileError as error:

        raise HTTPException(status_code=error.status_code,detail=error.message)
    
async def update_profile_controller(user_id:str,request:UpdateProfileRequest):

    try:
        return await update_profile(user_id,request.cert)

    except ProfileError as error:
        
        raise HTTPException(status_code=error.status_code,detail=error.message)
    
async def get_profile_controller(user_id:str):
    try:

        return await get_profile(user_id)
    
    except ProfileError as error:

        raise HTTPException(status_code=error.status_code,detail=error.message)

async def record_progress_controller(user_id: str, request: RecordProgressRequest):
    try:
        return await record_progress(user_id, request.exam_name, request.correct, request.incorrect)
    except ProfileError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
