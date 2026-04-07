from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

import jwt
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(title="CertStack Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "http://localhost:3003",  # Docker mapped frontend port
        "http://localhost:5173",  # Vite dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "certstack-dev-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60

# Temporary in-memory store for local development.
_USERS: Dict[str, str] = {
    "demo@certstack.dev": "demo1234",
}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class Question(BaseModel):
    id: str
    exam: str
    topic: str
    difficulty: str
    question_text: str
    choices: List[str]
    correct_index: int
    explanation: str


class SubmitRequest(BaseModel):
    question_id: str
    selected_index: int


class ChatRequest(BaseModel):
    question_id: Optional[str] = None
    message: str


_QUESTIONS: List[Question] = [
    Question(
        id="q1",
        exam="AWS",
        topic="Compute",
        difficulty="Easy",
        question_text="What does EC2 stand for?",
        choices=[
            "Elastic Compute Cloud",
            "Electronic Computer Cloud",
            "Enterprise Compute Center",
            "Elastic Cloud Computing",
        ],
        correct_index=0,
        explanation="EC2 stands for Elastic Compute Cloud.",
    ),
    Question(
        id="q2",
        exam="AWS",
        topic="Storage",
        difficulty="Easy",
        question_text="S3 is primarily used for what?",
        choices=["Compute", "Object storage", "DNS", "Monitoring"],
        correct_index=1,
        explanation="S3 is AWS object storage.",
    ),
    Question(
        id="q3",
        exam="AWS",
        topic="Networking",
        difficulty="Easy",
        question_text="Which AWS service provides DNS?",
        choices=["CloudFront", "Route 53", "VPC", "Direct Connect"],
        correct_index=1,
        explanation="Route 53 is AWS DNS.",
    ),
    Question(
        id="q4",
        exam="AWS",
        topic="Databases",
        difficulty="Medium",
        question_text="DynamoDB default reads are which consistency model?",
        choices=["Strong", "Eventual", "Causal", "Sequential"],
        correct_index=1,
        explanation="DynamoDB defaults to eventual consistency.",
    ),
    Question(
        id="q5",
        exam="AWS",
        topic="Compute",
        difficulty="Medium",
        question_text="AWS Lambda maximum timeout is?",
        choices=["5 minutes", "10 minutes", "15 minutes", "30 minutes"],
        correct_index=2,
        explanation="Lambda max runtime is 15 minutes.",
    ),
    Question(
        id="q6",
        exam="AWS",
        topic="Architecture",
        difficulty="Medium",
        question_text="Application Load Balancer supports which protocol family?",
        choices=["TCP only", "HTTP/HTTPS", "UDP only", "All protocols"],
        correct_index=1,
        explanation="ALB is layer-7 and supports HTTP/HTTPS.",
    ),
    Question(
        id="q7",
        exam="AWS",
        topic="Databases",
        difficulty="Hard",
        question_text="CloudFormation drift detection helps detect what?",
        choices=["Cost overruns", "Configuration changes", "Security issues", "Performance issues"],
        correct_index=1,
        explanation="It detects configuration drift from the template.",
    ),
    Question(
        id="q8",
        exam="AWS",
        topic="Observability",
        difficulty="Hard",
        question_text="AWS X-Ray is primarily used for?",
        choices=["Logging", "Monitoring", "Distributed tracing", "Alerting"],
        correct_index=2,
        explanation="X-Ray is for request tracing across distributed systems.",
    ),
    Question(
        id="q9",
        exam="AWS",
        topic="Workflow",
        difficulty="Expert",
        question_text="Step Functions Express workflows max duration is?",
        choices=["1 minute", "5 minutes", "15 minutes", "1 hour"],
        correct_index=1,
        explanation="Express workflows run up to 5 minutes.",
    ),
    Question(
        id="q10",
        exam="AWS",
        topic="Governance",
        difficulty="Expert",
        question_text="Which service provides cross-account resource sharing?",
        choices=["IAM", "RAM", "Organizations", "Control Tower"],
        correct_index=1,
        explanation="AWS RAM enables cross-account resource sharing.",
    ),
]


def create_access_token(email: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    payload = {"sub": email, "exp": expires_at}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/auth/register")
def register(payload: RegisterRequest) -> dict:
    email = payload.email.lower()
    if email in _USERS:
        raise HTTPException(status_code=409, detail="User already exists")

    _USERS[email] = payload.password
    return {"message": "Account created"}


@app.post("/auth/login")
def login(payload: LoginRequest) -> dict:
    email = payload.email.lower()
    password = _USERS.get(email)
    if password is None or password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(email)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/questions")
def get_questions(
    difficulty: Optional[str] = Query(default=None),
    topic: Optional[str] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> list:
    filtered = _QUESTIONS
    if difficulty:
        filtered = [q for q in filtered if q.difficulty.lower() == difficulty.lower()]
    if topic:
        filtered = [q for q in filtered if q.topic.lower() == topic.lower()]

    return [q.model_dump() for q in filtered[:limit]]


@app.get("/questions/{question_id}")
def get_question(question_id: str) -> dict:
    for question in _QUESTIONS:
        if question.id == question_id:
            return question.model_dump()
    raise HTTPException(status_code=404, detail="Question not found")


@app.post("/submit")
def submit(payload: SubmitRequest) -> dict:
    question = next((q for q in _QUESTIONS if q.id == payload.question_id), None)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = payload.selected_index == question.correct_index
    return {
        "correct": is_correct,
        "correct_index": question.correct_index,
        "explanation": question.explanation,
    }


@app.post("/chat")
def chat(payload: ChatRequest) -> dict:
    prompt = payload.message.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    return {
        "question_id": payload.question_id,
        "response": (
            "Start by identifying the core concept being tested, eliminate one clearly wrong option, "
            "and explain why each remaining choice could be right or wrong before locking your answer."
        ),
    }
