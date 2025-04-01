-- Migration to add email verification
ALTER TABLE users ADD COLUMN verification_code TEXT;
ALTER TABLE users ADD COLUMN verification_code_expires_at TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0 NOT NULL;

-- Add index for quick lookups
CREATE INDEX idx_user_verification ON users(verification_code, email);