from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field, model_validator


MAX_NUM_QUESTIONS = 100

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
    num_questions: int = Field(ge=1, le=MAX_NUM_QUESTIONS)
    mode: Literal["practice", "exam"] = "practice"
    time_limit_seconds: Optional[int] = None
    shuffle_seed: Optional[int] = None


class StartSectionPracticeRequest(BaseModel):
    exam_name: str
    section: str
    num_questions: int = Field(ge=1, le=MAX_NUM_QUESTIONS)
    mode: Literal["practice", "exam"] = "practice"
    time_limit_seconds: Optional[int] = None
    shuffle_seed: Optional[int] = None


class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_hash: str
    selected_answer: Optional[Union[str, List[str]]] = None
    time_spent_seconds: Optional[int] = Field(default=None, ge=0)
    flagged: bool = False
    is_skipped: bool = False

    @model_validator(mode="after")
    def validate_selected_answer_for_skip(self):
        if not self.is_skipped and self.selected_answer is None:
            raise ValueError("selected_answer is required unless is_skipped=true")
        return self