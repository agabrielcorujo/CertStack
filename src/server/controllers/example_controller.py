from schemas.schema import SampleRequest
from services.example_service import sample_service,AppError
from fastapi import HTTPException

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def sample_function(userid:str,param:type)->type:

    if ... : #something goes wrong

        raise AppError(message="something went wrong",status_code="some status code")

    return ...
