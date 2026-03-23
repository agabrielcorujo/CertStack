from services.profile_services import *
from schemas.schema import CreateProfileRequest,UpdateProfileRequest
from fastapi import HTTPException

async def create_profile_controller(user_id:str,request:CreateProfileRequest):

    try:
        return await create_profile(user_id,request.certs)

    except ProfileError as error:

        raise HTTPException(status_code=error.status_code,detail=error.messge)
    
async def update_profile_controller(user_id:str,request:UpdateProfileRequest):

    try:
        return await update_profile(user_id,request.cert)

    except ProfileError as error:
        
        raise HTTPException(status_code=error.status_code,detail=error.messge)

