from fastapi import FastAPI
from jwt_auth.auth_routes import router as auth_router
from routes.flashcard_router import router as flashcard_router
from routes.profile_router import router as profile_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
app.include_router(flashcard_router)
app.include_router(profile_router)

@app.get("/")
def health_check():
    return {
        "status":"healthy"
    }






