-- ════════════════════════════════════════════════════════════
-- D1 schema — swrv-email-list (binding: EMAIL_DB)
-- ════════════════════════════════════════════════════════════
-- The Worker also creates email_captures automatically on first write
-- (see ensureEmailTable in src/worker.js), so this file is mainly for
-- reference / manual setup. To apply manually:
--   npx wrangler d1 execute swrv-email-list --remote --file=schema.sql
-- ════════════════════════════════════════════════════════════

-- Mailing list: one row per unique email, captured from every form on
-- the site (roadmap email, roadmap disclaimer screen, Zion booking,
-- service booking, project intake).
CREATE TABLE IF NOT EXISTS email_captures (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT UNIQUE NOT NULL,
  name           TEXT,
  source         TEXT,
  vision_preview TEXT,
  captured_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_captures_captured_at ON email_captures (captured_at);

-- Admin auth (used by /admin — single-user email/password gate).
CREATE TABLE IF NOT EXISTS admin_users (
  email         TEXT PRIMARY KEY,
  salt          TEXT NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
