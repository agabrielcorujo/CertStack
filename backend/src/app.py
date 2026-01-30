from fastapi import Depends,FastAPI
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.db import safe_query
from jwt_auth.auth_router import router as auth_router
from jwt_auth.jwt_auth import decode_access_token
from fastapi.middleware.cors import CORSMiddleware
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "http://localhost:5173",   # if using Vite
        # add prod frontend domain later
    ],
    allow_credentials=True,       # REQUIRED for cookies
    allow_methods=["*"],          # includes OPTIONS
    allow_headers=["*"],          # Authorization, Content-Type
)

#mount auth endpoints (login, logout,register,refresh)
app.include_router(auth_router)

@app.get("example/endpoint")

def example_endpoint(token: str = Depends(oauth2_scheme)):
    """
    how endpoints should be defined. 
    access token is extracted from cookies using Depends. 
    access token is validated using auth package. 
    if token is invalid, exception will be raised. 

    """

    user_id = decode_access_token(token)

    return f"some action based on {user_id}"


