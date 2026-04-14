from typing import Optional
from pydantic import BaseModel 

class SampleRequest(BaseModel): #used for post, put, patch and delete requests
    request_param1: str #required parameter
    request_param2: Optional[str] = None #not required, optional parameter

class CreateProfileRequest(BaseModel):
    certs:list

class UpdateProfileRequest(BaseModel):
    cert:str