from fastapi import FastAPI
from jwt_auth.auth_routes import router as auth_router
from routes.profile_router import router as profile_router
from routes.practice_router import router as practice_router
from fastapi.middleware.cors import CORSMiddleware

from jwt_auth.db.db import init_pool, close_pool, create_users_table
from jwt_auth.db.redis import init_cache, close_cache

app = FastAPI()


@app.on_event("startup")
async def _startup() -> None:
    await init_pool()
    await create_users_table()
    await init_cache()


@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_cache()
    await close_pool()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev
                                    # add prod frontend domain later
    ],
    allow_credentials=True,       # REQUIRED for cookies
    allow_methods=["*"],          # includes OPTIONS
    allow_headers=["*"],          # Authorization, Content-Type
)

#mount routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(practice_router)

@app.get("/")
def health_check():
    return {
        "status":"healthy"
    }






