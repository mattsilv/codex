-- Add Lucia auth tables to the existing schema

-- Sessions table for Lucia
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Auth keys table for Lucia (used for OAuth providers)
CREATE TABLE auth_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  hashed_password TEXT,
  provider_id TEXT,
  provider_user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_auth_keys_user_id ON auth_keys(user_id);
CREATE INDEX idx_auth_keys_provider ON auth_keys(provider_id, provider_user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Modify existing users table to add required Lucia fields
ALTER TABLE users ADD COLUMN oauth_provider TEXT;
ALTER TABLE users ADD COLUMN oauth_id TEXT;