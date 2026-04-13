from typing import Optional
from pydantic import BaseModel 

class SampleRequest(BaseModel): #used for post, put, patch and delete requests
    request_param1: str #required parameter
    request_param2: Optional[str] = None #not required, optional parameter

class CreateProfileRequest(BaseModel):
    certs:list

class UpdateProfileRequest(BaseModel):
    cert:str

#flashcard requests
class GetFlashcardsRequest(BaseModel):
    exam: str
    category: Optional[str] = None
    deck_id: Optional[int] = None
    limit: int = 20

class ReviewFlashcardRequest(BaseModel):
    question_id: str
    was_correct: bool
    confidence: Optional[int] = None #optional 1-5 self rating
    time_taken_ms: Optional[int] = None
    session_id: Optional[int] = None

class CreateDeckRequest(BaseModel):
    deck_name: str
    exam: str
    description: Optional[str] = None

class AddQuestionToDeckRequest(BaseModel):
    deck_id: int
    question_id: str

class GetProgressRequest(BaseModel):
    exam: str
    category: Optional[str] = None

class StartStudySessionRequest(BaseModel):
    exam: str
    category: Optional[str] = None
    deck_id: Optional[int] = None

class EndStudySessionRequest(BaseModel):
    session_id: int
    cards_reviewed: Optional[int] = None
    correct_answers: Optional[int] = None


class GetStudySessionHistoryRequest(BaseModel):
    exam: Optional[str] = None
    category: Optional[str] = None
    deck_id: Optional[int] = None
    include_active: bool = False
    limit: int = 20
    offset: int = 0
