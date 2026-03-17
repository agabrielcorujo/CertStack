BEGIN;

--stores user created flashcard decks scoped to an exam
CREATE TABLE IF NOT EXISTS user_flashcard_decks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    deck_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_flashcard_decks_unique_name UNIQUE (user_id, deck_name)
);

--many-to-many style link between a deck and the exam question ids stored in vector DB
CREATE TABLE IF NOT EXISTS flashcard_deck_questions (
    id BIGSERIAL PRIMARY KEY,
    deck_id BIGINT NOT NULL REFERENCES user_flashcard_decks(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT flashcard_deck_questions_unique UNIQUE (deck_id, question_id)
);

--spaced repetition tracking per user/question pair
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    exam TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    ease_factor NUMERIC(6, 4) NOT NULL DEFAULT 2.5000,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetition_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT flashcard_progress_unique_question UNIQUE (user_id, question_id)
);

--session level analytics for dashboards
CREATE TABLE IF NOT EXISTS flashcard_study_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    exam TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    deck_id BIGINT REFERENCES user_flashcard_decks(id) ON DELETE SET NULL,
    cards_reviewed INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_decks_user_id
    ON user_flashcard_decks(user_id);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_decks_exam
    ON user_flashcard_decks(exam);

CREATE INDEX IF NOT EXISTS idx_flashcard_deck_questions_deck_id
    ON flashcard_deck_questions(deck_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_deck_questions_question_id
    ON flashcard_deck_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_exam
    ON flashcard_progress(user_id, exam);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review_date
    ON flashcard_progress(user_id, next_review_date);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_category
    ON flashcard_progress(user_id, exam, category);

CREATE INDEX IF NOT EXISTS idx_flashcard_study_sessions_user_exam
    ON flashcard_study_sessions(user_id, exam);

CREATE INDEX IF NOT EXISTS idx_flashcard_study_sessions_started_at
    ON flashcard_study_sessions(user_id, started_at DESC);

--generic updated_at trigger function (safe to rerun)
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_flashcard_decks_updated_at ON user_flashcard_decks;
CREATE TRIGGER trg_user_flashcard_decks_updated_at
BEFORE UPDATE ON user_flashcard_decks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_flashcard_progress_updated_at ON flashcard_progress;
CREATE TRIGGER trg_flashcard_progress_updated_at
BEFORE UPDATE ON flashcard_progress
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

COMMIT;
