-- ============================================================
-- 100 MÚSICOS DIJERON — Esquema de Base de Datos
-- ============================================================

-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: questions
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLA: answers
-- ============================================================
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0 AND points <= 100),
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS answers_question_id_idx ON answers(question_id);
CREATE INDEX IF NOT EXISTS answers_position_idx ON answers(question_id, position);

-- ============================================================
-- TABLA: games
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'lobby'
    CHECK (status IN ('lobby', 'playing', 'fast_money', 'finished')),
  current_round_id UUID,  -- FK added after rounds table
  team_one_name TEXT NOT NULL DEFAULT 'Equipo 1',
  team_two_name TEXT NOT NULL DEFAULT 'Equipo 2',
  team_one_score INTEGER NOT NULL DEFAULT 0,
  team_two_score INTEGER NOT NULL DEFAULT 0,
  active_team TEXT CHECK (active_team IN ('team_one', 'team_two')),
  strikes INTEGER NOT NULL DEFAULT 0 CHECK (strikes >= 0 AND strikes <= 3),
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS games_code_idx ON games(code);
CREATE INDEX IF NOT EXISTS games_status_idx ON games(status);

-- ============================================================
-- TABLA: rounds
-- ============================================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  multiplier INTEGER NOT NULL DEFAULT 1 CHECK (multiplier IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'face_off'
    CHECK (status IN ('face_off', 'playing', 'steal', 'finished')),
  controlling_team TEXT CHECK (controlling_team IN ('team_one', 'team_two')),
  revealed_answer_ids UUID[] DEFAULT '{}',
  round_points INTEGER NOT NULL DEFAULT 0,
  winner_team TEXT CHECK (winner_team IN ('team_one', 'team_two')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS rounds_game_id_idx ON rounds(game_id);
CREATE INDEX IF NOT EXISTS rounds_status_idx ON rounds(game_id, status);

-- ============================================================
-- TABLA: fast_money_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS fast_money_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_one_answers JSONB DEFAULT '[]',
  player_two_answers JSONB DEFAULT '[]',
  total_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'playing_one'
    CHECK (status IN ('playing_one', 'playing_two', 'finished')),
  time_limit_one INTEGER NOT NULL DEFAULT 20,
  time_limit_two INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fast_money_game_id_idx ON fast_money_sessions(game_id);

-- ============================================================
-- FK: games.current_round_id → rounds.id
-- ============================================================
ALTER TABLE games
  ADD CONSTRAINT fk_games_current_round
  FOREIGN KEY (current_round_id) REFERENCES rounds(id)
  ON DELETE SET NULL;

-- ============================================================
-- AUTO-UPDATE: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (open para MVP — sin autenticación)
-- ============================================================
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fast_money_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on games"
  ON games FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on questions"
  ON questions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on answers"
  ON answers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on rounds"
  ON rounds FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on fast_money_sessions"
  ON fast_money_sessions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME: Habilitar para las tablas necesarias
-- ============================================================
-- Ejecuta esto en el Dashboard de Supabase > Database > Replication
-- o descomenta si tienes acceso:
-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
-- ALTER PUBLICATION supabase_realtime ADD TABLE fast_money_sessions;
