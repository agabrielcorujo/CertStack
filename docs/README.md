# CertStack
Quizlet-like platform for studying for professional certification/licensing exams, focused on but not limited to state regulated licensing (i.e. Bar Exam, USMLE, CPA, etc).

## Practice Backend

- Practice backend inventory (current contracts): `docs/practice-backend-inventory.md`

## Backend Overview (`src/server`)

The backend is a layered FastAPI app:

1. `server.py` bootstraps FastAPI, CORS, and mounts routers.
2. `routes/` defines HTTP endpoints and request auth requirements.
3. `controllers/` handles request orchestration and maps domain errors to HTTP errors.
4. `services/` contains business logic and throws typed app-level errors (`AppError`).
5. `schemas/` defines request/response contracts with Pydantic models.

Current entrypoint:

- `src/server/server.py`
- Mounts `jwt_auth.services.auth_services` (from `jwt-auth` dependency)
- Mounts local business routes from `src/server/routes/example_route.py`

### Request Flow

1. Client calls a route in `routes/*`.
2. Route validates input via `schemas/*` and validates token with `decode_access_token`.
3. Route calls controller.
4. Controller calls service.
5. Service returns data or raises `AppError`.
6. Controller converts `AppError` into `HTTPException` with the right status code.

## Backend Setup

Create env files:

- Copy `src/server/.env.example` into:
  - `src/server/.env.dev`
  - `src/server/.env.prod`
- Fill in DB and JWT values.

Run backend locally with Docker Compose:

```bash
cd src/infrastructure
docker compose up --build server redis
```

Health check:

- `GET http://127.0.0.1:8000/` -> `{ "status": "healthy" }`

Run full local stack (client + server + redis):

```bash
cd src/infrastructure
docker compose up --build
```

Useful Docker commands:

```bash
# stop containers
docker compose down

# restart only backend services
docker compose up --build -d server redis

# backend logs
docker compose logs -f server
```

## How to Implement New Backend Code

Use this order for every feature.

### 1) Add/Update Schemas

Create a request model in `src/server/schemas/schema.py` (or a new schema module):

```python
from pydantic import BaseModel
from typing import Optional

class CreateThingRequest(BaseModel):
    name: str
    description: Optional[str] = None
```

### 2) Add Service Logic

Add pure business logic in `src/server/services/service.py` (or a feature-specific service file):

```python
class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def create_thing_service(name: str):
    if not name:
        raise AppError("name is required", 400)
    return {"name": name}
```

### 3) Add Controller

Controllers call services and normalize errors:

```python
from fastapi import HTTPException
from services.service import create_thing_service, AppError

def create_thing_controller(request):
    try:
        return create_thing_service(request.name)
    except AppError as error:
        raise HTTPException(detail=error.message, status_code=error.status_code)
```

### 4) Add Route

Expose the endpoint in `src/server/routes/`:

```python
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt_auth.services.auth_services import decode_access_token
from controllers.example_controller import create_thing_controller
import schemas.schema as schema

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/things")
def create_thing(request: schema.CreateThingRequest, token: str = Depends(oauth2_scheme)):
    decode_access_token(token)
    return create_thing_controller(request)
```

### 5) Register Router (if new router file)

In `src/server/server.py`, import and mount the new router:

```python
from routes.things_route import router as things_router
app.include_router(things_router)
```

## Auth and Route Protection

- Protected routes use `OAuth2PasswordBearer(tokenUrl="/auth/login")`.
- The bearer token is validated via `decode_access_token(token)`.
- Invalid tokens return `401` automatically from the auth helper.

## Data and LLM Utilities

- `src/server/data/` contains source exam JSON and parsing utilities.
- `src/server/controllers/example_controller.py` includes `update_Database(path)` for loading JSON questions into Upstash Vector DB using OpenAI embeddings.
- For production, prefer API-based secret loading over interactive `getpass` prompts.

## Contributing

Branching model:

- `prod`: stable production branch
- `testing`: integration and pre-release testing
- `feature/*`: individual feature/fix branches

Workflow:

1. Branch from `testing`.
2. Implement and commit scoped changes.
3. Merge latest `testing` into your feature branch before PR.
4. Open PR from `feature/*` -> `testing` (Or pull `feature/*` into testing).
5. CI promotes `testing` -> `prod` after checks pass.
