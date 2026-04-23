import os
import json as j
import boto3 as aws

sm_client = aws.client("secretsmanager")
result = sm_client.get_secret_value(SecretId="certstack-secrets")

if "SecretString" in result:
    secrets = j.loads(result["SecretString"])
    for key, value in secrets.items():
        os.environ[key] = value
else:
    raise RuntimeError("missing environment variables")

from fastapi import FastAPI
from jwt_auth.auth_routes import router as auth_router
from routes.profile_router import router as profile_router
from routes.flashcard_router import router as flashcard_router
from routes.exam_router import router as exam_router
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

app = FastAPI(lifespan=lifespan)

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

#mount routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(flashcard_router)
app.include_router(exam_router)

@app.get("/")
def health_check():
    return {
        "status":"healthy"
    }




