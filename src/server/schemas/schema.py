from typing import List, Optional, Union
from pydantic import BaseModel 

class SampleRequest(BaseModel): #used for post, put, patch and delete requests
    request_param1: str #required parameter
    request_param2: Optional[str] = None #not required, optional parameter

class CreateProfileRequest(BaseModel):
    certs:list

class UpdateProfileRequest(BaseModel):
    cert:str


# Practice exam requests
class StartPracticeRequest(BaseModel):
    exam_name: str
    categories: List[str]
    num_questions: int


class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_hash: str
    selected_answer: Union[str, List[str]]
    time_spent_seconds: Optional[int] = None
    flagged: bool = False