-- ============================================================
-- 100 MÚSICOS DIJERON — D1 Schema (SQLite)
-- Ejecutar con: wrangler d1 execute 100-musicos-db --file=src/db/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS questions (
  id      TEXT PRIMARY KEY,
  text    TEXT    NOT NULL,
  category TEXT   NOT NULL DEFAULT 'General',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
  id          TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT    NOT NULL,
  points      INTEGER NOT NULL CHECK (points > 0 AND points <= 100),
  position    INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_position ON answers(question_id, position);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
