from fastapi import Depends,FastAPI,APIRouter, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.jwt_auth import decode_access_token
import business_logic

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.get("/sample-endpoint")
def sample_endpoint(token:str = Depends(oauth2_scheme)):

    user_id = decode_access_token(token)

    #do something by calling functions in business_logic.py
    
    pass

