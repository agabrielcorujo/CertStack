from fastapi import Depends,APIRouter, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel 
from typing import Optional
from jwt_auth.jwt_auth import decode_access_token
from business_logic import (
    AppError
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class SampleRequest(BaseModel):
    request_param1: str #required parameter
    request_param2: Optional[str] = None #not required, optional parameter


@router.get("/sample-endpoint")
def sample_endpoint(Request:SampleRequest,token:str = Depends(oauth2_scheme)):

    user_id = decode_access_token(token) #this automatically raises 401 unauthorized if the token is invalid

    try:
        #do something by calling functions in business_logic.py
        variable1 = Request.request_param1
        variable2 = Request.request_param2
        ...

    except AppError as Err:

        raise HTTPException(
            status_code=Err.status_code,
            detail=Err.message
        )

    return {"response":"some response"}

