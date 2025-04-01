-- Migration to add user deletion fields
ALTER TABLE users ADD COLUMN deleted_at TEXT;
ALTER TABLE users ADD COLUMN marked_for_deletion INTEGER DEFAULT 0;