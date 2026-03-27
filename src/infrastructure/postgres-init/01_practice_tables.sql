-- Minimal baseline schema for current practice backend.
-- This is intentionally small (matches current service queries) and will be replaced by Alembic later.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  selected_categories TEXT[] NOT NULL DEFAULT '{}',
  total_questions INT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'practice',
  status TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP NULL,
  question_set JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id_start_time
  ON practice_sessions (user_id, start_time DESC);

CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_hash TEXT NOT NULL,
  question_text TEXT NOT NULL,
  selected_answer JSONB NULL,
  correct_answer JSONB NULL,
  is_correct BOOLEAN NOT NULL,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INT NULL,
  answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  category TEXT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_answers_session_question
  ON user_answers (session_id, question_hash);

CREATE INDEX IF NOT EXISTS idx_user_answers_session_id
  ON user_answers (session_id);
