import os
import json as j
import boto3 as aws
from contextlib import asynccontextmanager
from pydantic import BaseModel

def load_aws_secrets() -> str | None:
    """Best-effort secret loading for local/dev startup.

    In Docker dev, AWS region/credentials are often not present; we should not
    crash server boot in that case.
    """
    secret_id = os.getenv("AWS_SECRET_ID", "certstack-secrets")
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    if not region:
        return "Skipping AWS Secrets Manager load (missing AWS_REGION/AWS_DEFAULT_REGION)."

    try:
        sm_client = aws.client("secretsmanager", region_name=region)
        result = sm_client.get_secret_value(SecretId=secret_id)
        if "SecretString" not in result:
            return "Secrets Manager response missing SecretString."

        secrets = j.loads(result["SecretString"])
        for key, value in secrets.items():
            os.environ[key] = value
        return None
    except Exception as exc:
        return f"Skipping AWS Secrets Manager load: {exc}"


secrets_warning = load_aws_secrets()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

api_enabled = False
api_error = None
lifespan_handler = None

try:
    from jwt_auth.auth_routes import router as auth_router
    from routes.profile_router import router as profile_router
    from routes.flashcard_router import router as flashcard_router
    from routes.exam_router import router as exam_router
    from jwt_auth.db.db import close_pool, init_pool
    from jwt_auth.db.redis import close_cache, init_cache
    from services.bootstrap_service import ensure_app_schema

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await init_pool()
        await init_cache()
        await ensure_app_schema()
        try:
            yield
        finally:
            await close_cache()
            await close_pool()

    lifespan_handler = lifespan
    api_enabled = True
except Exception as exc:
    api_error = str(exc)

app = FastAPI(lifespan=lifespan_handler) if lifespan_handler else FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev
        "https://certstack-rcos.com",
        "https://certstack.fyi"
    ],
    allow_credentials=True,       # REQUIRED for cookies
    allow_methods=["*"],          # includes OPTIONS
    allow_headers=["*"],          # Authorization, Content-Type
)

# Mount API routers only when auth/db dependencies are available.
if api_enabled:
    app.include_router(auth_router)
    app.include_router(profile_router)
    app.include_router(flashcard_router)
    app.include_router(exam_router)

DEV_QUESTIONS = [
    {
        "id": "dev-q1",
        "question_text": "Which AWS service provides object storage?",
        "choices": ["EC2", "S3", "RDS", "Lambda"],
        "correct_index": 1,
        "explanation": "Amazon S3 is AWS object storage.",
    },
    {
        "id": "dev-q2",
        "question_text": "For a simply supported beam with a centered load, where is the maximum moment?",
        "choices": ["At support", "At midspan", "At quarter point", "Uniform"],
        "correct_index": 1,
        "explanation": "A centered point load creates the largest bending moment at midspan.",
    },
    {
        "id": "dev-q3",
        "question_text": "What IAM principle grants only required permissions?",
        "choices": ["High availability", "Least privilege", "Fault tolerance", "Auto scaling"],
        "correct_index": 1,
        "explanation": "Least privilege minimizes risk by granting only necessary access.",
    },
    {
        "id": "dev-q4",
        "question_text": "What is the default consistency model for DynamoDB reads?",
        "choices": ["Strong", "Eventual", "Causal", "Sequential"],
        "correct_index": 1,
        "explanation": "DynamoDB uses eventual consistency by default unless strong consistency is requested.",
    },
]

DEV_QUESTION_MAP = {q["id"]: q for q in DEV_QUESTIONS}


class SubmitRequest(BaseModel):
    question_id: str
    selected_index: int


class ChatRequest(BaseModel):
    question_id: str
    message: str


@app.get("/questions")
def dev_questions(limit: int = 10, difficulty: str | None = None):
    # Keep the shape expected by the frontend during local fallback mode.
    _ = difficulty
    bounded_limit = max(1, min(limit, 50))
    return DEV_QUESTIONS[:bounded_limit]


@app.post("/submit")
def dev_submit(payload: SubmitRequest):
    question = DEV_QUESTION_MAP.get(payload.question_id)
    if not question:
        return {
            "correct": False,
            "correct_index": 0,
            "explanation": "Question not found in dev fallback set.",
        }

    correct_index = int(question["correct_index"])
    return {
        "correct": payload.selected_index == correct_index,
        "correct_index": correct_index,
        "explanation": question["explanation"],
    }


@app.post("/chat")
def dev_chat(payload: ChatRequest):
    question = DEV_QUESTION_MAP.get(payload.question_id)
    question_text = question["question_text"] if question else "this question"
    return {
        "response": (
            "AI Tutor fallback mode is active. "
            f"For {question_text}, focus on the key concept first, then eliminate wrong options. "
            f"You asked: {payload.message}"
        )
    }

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "api_enabled": api_enabled,
        "api_error": api_error,
        "secrets_warning": secrets_warning,
    }




