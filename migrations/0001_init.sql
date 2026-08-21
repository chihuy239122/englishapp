PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  persona TEXT NOT NULL,
  level TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER
);

CREATE TABLE turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  client_turn_id TEXT NOT NULL UNIQUE,
  turn_index INTEGER NOT NULL,
  transcript TEXT,
  ai_reply TEXT,
  corrections TEXT,
  audio_base64 TEXT,
  audio_available INTEGER NOT NULL DEFAULT 0,
  user_audio_key TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_turns_session ON turns(session_id);
CREATE INDEX idx_sessions_user ON sessions(user_id, started_at);

CREATE TABLE turn_tokens (
  token_hash TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  user_audio_key TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  turn_id TEXT UNIQUE,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER
);

CREATE INDEX idx_turn_tokens_session ON turn_tokens(session_id, expires_at);
