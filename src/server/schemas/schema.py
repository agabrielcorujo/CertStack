from typing import Any, Optional
from pydantic import BaseModel 

class SampleRequest(BaseModel): #used for post, put, patch and delete requests
    request_param1: str #required parameter
    request_param2: Optional[str] = None #not required, optional parameter

class CreateProfileRequest(BaseModel):
    certs:list[str]

class UpdateProfileRequest(BaseModel):
    cert:str

class RecordProgressRequest(BaseModel):
    exam_name: str
    correct: int = 0
    incorrect: int = 0


class FlashcardAIRequest(BaseModel):
    question: str
    exam: str
    user_question: str
    choices: Any | None = None
    answer: Any | None = None
    explanation: Optional[str] = None
