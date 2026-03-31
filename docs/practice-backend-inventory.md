# Practice Backend Inventory (Current Runtime Behavior)

This document is a quick onboarding reference for how the practice-exam backend works today.
It describes current runtime behavior only.

## Scope

- Backend service: FastAPI app in src/server
- Practice endpoints: /practice/*
- Auth endpoints: /auth/* (provided by jwt-auth package)
- Persistence: PostgreSQL
- Cache/token support: Redis

## Service Layout

- App entrypoint: src/server/server.py
- Practice router: src/server/routes/practice_router.py
- Practice controller layer: src/server/controllers/practice_controller.py
- Practice service/business logic: src/server/services/practice_services.py
- Request schemas: src/server/schemas/schema.py

Runtime call path for practice APIs:
router -> controller -> service -> DB/helpers

## Startup and Dependencies

On startup, the app initializes:

- PostgreSQL pool (jwt-auth DB helper)
- Auth users table
- Redis cache

On shutdown, cache and DB pool are closed.

Required runtime dependencies:

- PostgreSQL reachable by DB_* env vars
- Redis reachable by REDIS_URL

## Authentication Model

All /practice endpoints require bearer auth:

- Header: Authorization: Bearer <token>
- Token decoding is done via jwt-auth
- Practice sessions are user-scoped by user_id

## Practice Modes

Two modes are supported in start requests:

- practice
- exam

Mode affects answer-key visibility.

Additional mode guarantees implemented:

- Practice mode can reveal correctness immediately after submit.
- Exam mode never reveals answer keys or correctness until the session is completed.
- Exam mode can enforce a time limit when time_limit_seconds is provided.

## Endpoint Behavior (Current)

### Start Session

POST /practice/start

- Creates a session
- Stores selected question set in DB
- Returns sanitized question payloads (never includes answer key)

POST /practice/start-section

- Convenience wrapper over /practice/start
- Uses a single selected section/category

### Domains

GET /practice/domains?exam_name=...

- Returns available domains/categories for an exam
- For cloud practitioner, uses cp_context.json ordering/weights when available

### Session and History

GET /practice/session/{session_id}

- Returns session metadata and user answers
- session.question_set is sanitized (no answer field)
- For exam mode before completion, answers omit correct_answer and is_correct
- For exam mode with time_limit_seconds set, session fetch applies expiry check:
	if now >= start_time + time_limit_seconds, session is auto-marked completed

GET /practice/history?limit=...&exam_name=...

- Returns recent user sessions with computed score_percent
- Ordered by most recent start_time

### Submit

POST /practice/submit

- Records or updates answer for a question in the session
- State guardrails:
	- Allowed only when status is in_progress
	- Rejects submit when session is paused (400)
	- Rejects submit when session is completed (400)
	- Rejects submit for any non-in_progress state (400)

Response visibility by mode/status:

- Practice mode: returns question_hash, is_correct, correct_answer
- Exam mode before completion: returns question_hash only
- Exam mode after completion: returns correctness fields in results/session views (not pre-completion submit responses)

### Pause/Resume

POST /practice/pause/{session_id}
POST /practice/resume/{session_id}

- State guardrails:
	- pause is allowed only from in_progress
	- resume is allowed only from paused
	- completed sessions are terminal and cannot pause/resume
	- invalid transitions return 400 consistently

### Complete

POST /practice/complete/{session_id}

- Marks session completed
- Sets end_time
- Returns summary: total_questions, answered, correct, score_percent
- State guardrails:
	- complete is allowed from in_progress or paused
	- completed is terminal
	- complete on an already completed session is idempotent (returns current results)

### Results

GET /practice/results/{session_id}

- Practice mode: returns results payload (including answer correctness fields)
- Exam mode before completion: returns 400
- Exam mode after completion: returns full results with answer correctness fields
- For expired timed exam sessions, results become available once auto-completion occurs.

## Data Sources

For exam_name "cloud practitioner":

- Primary questions: src/server/data/cloudpractitioner/cp_questions.json
- Domain metadata: src/server/data/cloudpractitioner/cp_context.json

Fallback path (if local question file is unavailable): vector retrieval via services.services.get_exam.

## Request Schemas (Current)

Defined in src/server/schemas/schema.py.

- StartPracticeRequest
- StartSectionPracticeRequest
- SubmitAnswerRequest

Validation guardrails currently enforced by schema:

- mode must be one of: practice | exam
- num_questions must be in [1, 100]
- time_spent_seconds must be >= 0 when provided
- selected_answer is required unless is_skipped=true

Current fields include:

- exam_name, categories/section, num_questions
- mode
- time_limit_seconds
- shuffle_seed
- submit payload fields: session_id, question_hash, selected_answer, time_spent_seconds, flagged, is_skipped

## Persistence Model (Current)

Primary tables used by practice service:

### practice_sessions

Current expected columns include:

- id
- user_id
- exam_name
- selected_categories
- total_questions
- mode
- status
- start_time
- end_time
- question_set

Optional columns may also be used when present (service checks dynamically), such as:

- time_limit_seconds
- shuffle_seed
- last_activity_at
- paused_at
- correct_count
- answered_count

Compatibility behavior (important for onboarding):

- Service includes best-effort schema shims for pre-migration dev DBs.
- On runtime access, missing mode and time_limit_seconds columns are added if absent.
- This preserves exam secrecy and exam-expiry behavior even before Alembic rollout.

### user_answers

Current expected columns include:

- id
- session_id
- question_hash
- question_text
- selected_answer
- correct_answer
- is_correct
- flagged
- time_spent_seconds
- answered_at
- category

Optional columns may also be used when present:

- difficulty
- is_multiselect
- is_skipped

## Environment Configuration

See src/server/.env.example for baseline variables.

Common required variables:

- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT
- DB_NAME
- JWT_KEY
- REDIS_URL

## Local Run (Current Team Workflow)

The most reliable local workflow is Docker Compose from src/infrastructure/docker-compose.yml:

- postgres service
- redis service
- server service

API is exposed on localhost:8000.

Quick smoke expectations for new members (state + expiry rules):

- pause from in_progress -> 200
- pause from paused -> 400
- resume from paused -> 200
- resume from in_progress -> 400
- submit from paused/completed -> 400
- complete from in_progress or paused -> 200
- complete on completed session -> 200 (idempotent)
- exam session with short time_limit_seconds auto-completes after expiry window
