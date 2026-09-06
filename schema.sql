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
-- service booking, project intake, and every Vision Portal tenant).
-- attribution and tenant_id predate this file and are added at runtime
-- via ALTER TABLE (see ensureEmailTable in src/worker.js) — every capture
-- lands here regardless of tenant, so this doubles as the platform
-- owner's own master list across every client business.
CREATE TABLE IF NOT EXISTS email_captures (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT UNIQUE NOT NULL,
  name           TEXT,
  source         TEXT,
  vision_preview TEXT,
  attribution    TEXT,
  tenant_id      TEXT,
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

-- Vision Portal tenants — client businesses licensing the Roadmap/Vision
-- intake tool (e.g. Coastal Event Services). Branding/catalog are JSON
-- blobs: with 2-3 tenants a relational catalog schema is premature.
-- Managed via /api/admin/tenants (no redeploy needed to onboard a client).
CREATE TABLE IF NOT EXISTS tenants (
  slug                 TEXT PRIMARY KEY,
  display_name         TEXT NOT NULL,
  contact_email        TEXT NOT NULL,
  logo_url             TEXT,
  colors_json          TEXT,
  services_json        TEXT NOT NULL,
  copy_overrides_json  TEXT,
  confidence_threshold INTEGER DEFAULT 60,
  created_at           TEXT DEFAULT (datetime('now'))
);

-- Every completed Roadmap generation, full AI output included — the
-- Roadmap result previously lived only in the browser (localStorage) and
-- was never persisted server-side. tenant_slug defaults to 'swrv' for the
-- site's own (non-multi-tenant) Roadmap at /roadmap.
CREATE TABLE IF NOT EXISTS vision_submissions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_slug      TEXT NOT NULL DEFAULT 'swrv',
  email            TEXT,
  name             TEXT,
  raw_vision       TEXT,
  result_json      TEXT NOT NULL,
  confidence_score INTEGER,
  escalated        INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_vision_submissions_tenant ON vision_submissions (tenant_slug, created_at);
