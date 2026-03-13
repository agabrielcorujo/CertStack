# Practice Backend Inventory (Current State)

This document captures the *current* practice-exam backend contracts and persistence model, as implemented today. It’s intended to be a stable baseline before adding “exam-mode”, analytics, review queues, etc.

## 1) Routing + Auth

- Router: `src/server/routes/practice_router.py` (prefix: `/practice`)
- App mounts router in `src/server/server.py`.
- All practice endpoints require `Authorization: Bearer <token>`.
- Token is validated by `jwt_auth.controllers.auth_controller.decode_access_token_controller`.

## 2) Endpoints

### Start session
- `POST /practice/start`
  - Body: `StartPracticeRequest`
  - Returns: `{ session_id: number, questions: QuestionForClient[] }`

- `POST /practice/start-section`
  - Body: `StartSectionPracticeRequest`
  - Convenience wrapper around `/practice/start` with `categories=[section]`.

### Domain discovery
- `GET /practice/domains?exam_name=...`
  - Returns: `{ exam_name: string, domains: DomainInfo[] }`

### Session state + history
- `GET /practice/history?limit=20&exam_name=...`
  - Returns: `{ history: PracticeHistoryItem[] }`

- `GET /practice/session/{session_id}`
  - Returns: `{ session: PracticeSession, answers: UserAnswer[] }`
  - Note: `session.question_set` is sanitized (no answer keys).

### Answering + completion
- `POST /practice/submit`
  - Body: `SubmitAnswerRequest`
  - Returns: `{ question_hash: string, is_correct: boolean, correct_answer: string | string[] }`

- `POST /practice/complete/{session_id}`
  - Returns: `{ session_id, total_questions, answered, correct, score_percent }`

- `GET /practice/results/{session_id}`
  - Returns: `{ session, answers, score_percent, category_breakdown }`

## 3) Request Schemas (Pydantic)

Defined in `src/server/schemas/schema.py`:

- `StartPracticeRequest`
  - `exam_name: str`
  - `categories: List[str]`
  - `num_questions: int`

- `StartSectionPracticeRequest`
  - `exam_name: str`
  - `section: str`
  - `num_questions: int`

- `SubmitAnswerRequest`
  - `session_id: int`
  - `question_hash: str`
  - `selected_answer: str | List[str]`
  - `time_spent_seconds: Optional[int] = None`
  - `flagged: bool = False`

## 4) Question Payload Rules

### Source question object (internal)
Built in `src/server/services/practice_services.py` and stored in `practice_sessions.question_set` as a JSON blob:

- `question_hash` (md5 of question text)
- `question` (text)
- `choices` (list)
- `answer` (string or list)  ← stored server-side
- `is_multiselect` (bool)
- `category` (domain)
- `difficulty` (optional)

### Question returned to clients
`_sanitize_question_for_client()` strips answer keys from the question payload. Returned fields:

- `question_hash`, `question`, `choices`, `is_multiselect`, `category`, `difficulty`

## 5) Data Sources

For `exam_name == "cloud practitioner"`:

- Primary: `src/server/data/cloudpractitioner/cp_questions.json`
- Metadata: `src/server/data/cloudpractitioner/cp_context.json` (domain weights + ordering)

Fallback (when local JSON isn’t available): `services.services.get_exam()` (vector-store retrieval).

## 6) Persistence Model (DB)

The code assumes two tables exist (names are hardcoded in queries):

### `practice_sessions`
Used by `create_practice_session()` and `get_session()`.

Implied columns:
- `id` (PK)
- `user_id`
- `exam_name`
- `selected_categories` (array)
- `total_questions` (int)
- `status` (e.g. `in_progress`, `completed`)
- `start_time` (timestamp)
- `end_time` (timestamp nullable)
- `question_set` (JSON)

### `user_answers`
Written by `submit_answer()`, read by `get_session()`.

Implied columns:
- `id` (PK)
- `session_id` (FK)
- `question_hash`
- `question_text`
- `selected_answer` (JSON)
- `correct_answer` (JSON)
- `is_correct` (bool)
- `flagged` (bool)
- `time_spent_seconds` (int nullable)
- `answered_at` (timestamp)
- `category` (text)

## 7) Env + Local Dev

See `src/server/.env.example` for required environment variables:
- DB: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- JWT: `JWT_KEY`

The backend runs via docker compose from `src/infrastructure/docker-compose.yml`.

## 8) Known Behavior Notes

- Sessions are user-scoped: session lookup uses `WHERE id = %s AND user_id = %s`.
- Answer-key leakage is prevented in session/results by sanitizing `question_set` before returning.
- `/practice/submit` currently returns immediate feedback (correctness + correct answer).

## 9) Next Step (What we’ll change next)

Step 2 will add explicit DB migrations/DDL for the above tables and extend them for exam-mode timing + analytics fields.
