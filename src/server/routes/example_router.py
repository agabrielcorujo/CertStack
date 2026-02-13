from fastapi import Depends,APIRouter
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.controllers.auth_controller import decode_access_token_controller as decode_access_token
from controllers.example_controller import (
    sample_controller
)
import schemas.schema as schema

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.get("/sample-endpoint")
def sample_endpoint(Request:schema.SampleRequest,token:str = Depends(oauth2_scheme)):

    user_id = decode_access_token(token) #this automatically raises 401 unauthorized if the token is invalid

    return sample_controller(Request)

