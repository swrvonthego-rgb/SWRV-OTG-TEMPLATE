import { renderRoadmapEmail } from './email-template.js';
import { SWRV_ROADMAP_CONFIG } from '../modules/roadmap/config';
// src/worker.js — Cloudflare Worker entry point
//
// Routes:
//   POST /api/roadmap         → calls Groq for AI Roadmap generation (always works)
//   POST /api/save-progress   → saves session to KV (if PROGRESS binding exists)
//   GET  /api/load-progress   → loads session by ?id=… from KV
//   POST /api/send-email      → sends results email via Resend (if RESEND_API_KEY exists)
//   POST /api/zion-booking    → emails booking inquiry to info@swrvonthego.pro
//   GET  /r/:id               → resume URL — redirects to / with session ID hash
//   GET  /api/health          → debug
//   *                          → static asset fallback
//
// Optional secrets / bindings (worker degrades gracefully if missing):
//   GROQ_API_KEY      (secret) — REQUIRED for AI generation
//   RESEND_API_KEY    (secret) — for email sending
//   EMAIL_FROM        (var)    — sender address, e.g. "SWRV <hello@swrvonthego.pro>"
//   PROGRESS          (KV)     — namespace binding for session persistence

// Allowed origins — add any preview/staging URLs here too
const ALLOWED_ORIGINS = new Set([
  'https://swrvonthego.pro',
  'https://www.swrvonthego.pro',
  'https://swrv-otg-template.swrvonthego.workers.dev',
  'https://app.swrvonthego.pro',
  'https://swrv-portal.pages.dev',
]);

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://swrvonthego.pro'; // fallback keeps headers valid
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Vary': 'Origin',
  };
}

// Security headers added to every response
const SECURITY_HEADERS = {
  'X-Content-Type-Options':  'nosniff',
  'X-Frame-Options':         'SAMEORIGIN',
  'Referrer-Policy':         'strict-origin-when-cross-origin',
  'Permissions-Policy':      'camera=(), microphone=(self), geolocation=(), payment=(self)',
  'X-XSS-Protection':        '1; mode=block',
};

// Legacy static headers (for handlers that build their own response)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://swrvonthego.pro',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Vary': 'Origin',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  ...SECURITY_HEADERS,
  'Content-Type': 'application/json',
};

// ─────────────────────────────────────────────────────────
// MAILING LIST — one capture path for EVERY email on the site.
// Never throws (email capture must never break a request), auto-creates
// the table on first use, and dedupes on the email column. Call it from
// every handler that receives an email so the list is always complete —
// even when the outbound email (Resend) is unconfigured or fails.
// ─────────────────────────────────────────────────────────
let __emailTableReady = false;
async function ensureEmailTable(env) {
  if (__emailTableReady || !env.EMAIL_DB) return;
  try {
    await env.EMAIL_DB.prepare(
      `CREATE TABLE IF NOT EXISTS email_captures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        source TEXT,
        vision_preview TEXT,
        attribution TEXT,
        captured_at TEXT DEFAULT (datetime('now'))
      )`
    ).run();
    // Existing deployments predate the attribution/tenant_id columns — add
    // them if missing.
    try {
      await env.EMAIL_DB.prepare('ALTER TABLE email_captures ADD COLUMN attribution TEXT').run();
    } catch (_) { /* already exists */ }
    try {
      await env.EMAIL_DB.prepare('ALTER TABLE email_captures ADD COLUMN tenant_id TEXT').run();
    } catch (_) { /* already exists */ }
    __emailTableReady = true;
  } catch (_) { /* table may already exist with a compatible schema */ }
}

// ─────────────────────────────────────────────────────────
// RESEND KEY RESOLUTION + SEND
// Two possible sources for the key: a Worker secret (env.RESEND_API_KEY)
// and a row in D1 (app_config). Either can be stale — a mistyped secret
// in the dashboard silently shadowed a perfectly good D1 key and every
// send failed with "API key is invalid", with nothing reaching Resend at
// all. So we don't pick one and hope: we try each candidate in turn and
// fall through on an auth rejection. Whichever key is actually valid wins.
//
// This repo is PUBLIC, so the key must never live in wrangler.jsonc or
// any tracked file — D1 keeps it inside the Cloudflare account instead.
// ─────────────────────────────────────────────────────────
// Resend keys are exactly 36 chars: "re_" + 33. Pinning the length (rather
// than a loose minimum) catches off-by-one corruption — a key copied out of
// a message that runs straight into the next word picks up a stray trailing
// character, which Resend rejects as "API key is invalid" while logging
// nothing, making it near-invisible to debug.
const RESEND_KEY_SHAPE = /^re_[A-Za-z0-9_-]{33}$/;

let __d1KeyCache;
async function getD1ResendKey(env) {
  if (__d1KeyCache !== undefined) return __d1KeyCache;
  if (!env.EMAIL_DB) return (__d1KeyCache = '');
  try {
    const row = await env.EMAIL_DB
      .prepare("SELECT value FROM app_config WHERE key = 'RESEND_API_KEY'")
      .first();
    __d1KeyCache = (row && row.value ? String(row.value) : '').trim();
  } catch (_) {
    __d1KeyCache = '';
  }
  return __d1KeyCache;
}

// Ordered, de-duplicated list of keys worth trying. Malformed values are
// dropped up front so an obviously-broken paste never costs a round trip.
async function getResendKeyCandidates(env) {
  const fromEnv = (env.RESEND_API_KEY || '').trim();
  const fromD1 = await getD1ResendKey(env);
  const seen = new Set();
  return [fromEnv, fromD1].filter((k) => {
    if (!k || seen.has(k) || !RESEND_KEY_SHAPE.test(k)) return false;
    seen.add(k);
    return true;
  });
}

// Back-compat helper: is ANY usable key configured? (guards + /api/health)
async function getResendKey(env) {
  const candidates = await getResendKeyCandidates(env);
  return candidates[0] || '';
}

/**
 * POST to the Resend API, trying each configured key until one is not
 * rejected for authentication. Returns { res, data, keyUsed }.
 * `data` is parsed defensively — an outage can return HTML, not JSON.
 */
async function resendPost(env, payload) {
  const candidates = await getResendKeyCandidates(env);
  if (!candidates.length) return { res: null, data: null, keyUsed: null };

  let last = null;
  for (const key of candidates) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { data = { message: raw.slice(0, 200) || 'Email service returned an unreadable response' }; }

    // 401/403 means THIS key is bad — try the next one rather than
    // failing the whole send.
    if (res.status === 401 || res.status === 403) {
      console.error('Resend rejected a key (trying next candidate if any)');
      last = { res, data, keyUsed: key };
      continue;
    }
    return { res, data, keyUsed: key };
  }
  return last || { res: null, data: null, keyUsed: null };
}

async function captureEmail(env, { email, name, source, vision_preview, attribution, tenant_id } = {}) {
  if (!env || !env.EMAIL_DB || !email) return;
  const clean = String(email).trim().toLowerCase();
  // Require a real domain with a dot after the @ — a bare "@" let partial,
  // still-being-typed addresses (autofill firing per keystroke on some
  // mobile browsers) into the list as junk rows.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;
  try {
    await ensureEmailTable(env);
    // Every capture lands in this one table regardless of tenant — a
    // client business gets its own leads via tenant_id, and the platform
    // owner keeps a single running list across every tenant for free.
    await env.EMAIL_DB.prepare(
      'INSERT OR IGNORE INTO email_captures (email, name, source, vision_preview, attribution, tenant_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      clean,
      name || null,
      source || 'site',
      (vision_preview || '').slice(0, 2000),
      (attribution || '').slice(0, 300) || null,
      tenant_id || null,
    ).run();
  } catch (_) { /* never block the request on list capture */ }
}

// ─────────────────────────────────────────────────────────
// FAILURE ALERTS — a booking/inquiry that breaks server-side is a lead
// that silently vanished unless someone notices. This fires from inside
// a catch block (or a failed-send branch) that's already handling one
// failure, so it must never itself throw or block the response back to
// the visitor. The customer's contact info is usually already in
// email_captures by this point (captureEmail runs before any send), but
// nothing previously pushed that fact to the owner — they'd only find it
// by checking /admin.
// ─────────────────────────────────────────────────────────
async function notifyOwnerOfFailure(env, { source, body, err }) {
  try {
    const notifyTo = env.NOTIFY_EMAIL || env.ZION_NOTIFY_EMAIL || 'info@swrvonthego.pro';
    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const safe = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bodyDump = body ? safe(JSON.stringify(body, null, 2)).slice(0, 3000) : '(request body unavailable)';
    const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:auto;padding:24px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <h2 style="color:#e5484d;margin:0 0 8px">🚨 ${safe(source)} failed on the site</h2>
        <p style="color:#8a8070;font-size:13px;margin:0 0 16px">Someone tried to reach you and it didn't go through cleanly. If they left contact info, it's saved in the email list either way — reach out to them directly.</p>
        <p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 4px">Error</p>
        <p style="font-family:monospace;font-size:13px;color:#e5484d;margin:0 0 16px">${safe(err?.message || String(err))}</p>
        <p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 4px">What they submitted</p>
        <pre style="white-space:pre-wrap;background:#110e07;border:1px solid rgba(200,168,75,.15);border-radius:6px;padding:16px;font-size:12px;">${bodyDump}</pre>
      </div>`;
    await resendPost(env, {
      from: fromAddr,
      to: [notifyTo],
      subject: `🚨 ${source} failed — check the site`,
      html,
    });
  } catch (_) { /* the alert itself must never throw or block anything */ }
}

// ─────────────────────────────────────────────────────────
// VISION PORTAL — multi-tenant Roadmap
//
// The proprietary question-bank / prompt-engineering logic lives ONLY
// here, server-side. It is never sent to, built by, or visible in the
// browser — the frontend only ever sends a tenant slug + the visitor's
// answers, and only ever receives back the tenant's branding/service
// list (never the prompt itself, see handleTenantPublicConfig).
//
// Tenant config is stored in D1 (not a per-tenant source file) so a new
// client business can be onboarded via the admin panel with zero
// redeploys. `/roadmap` with no tenant slug is the 'swrv' tenant, which
// always resolves from the same static config the frontend already
// imports — so the existing flow can never break on a missing/bad D1 row.
// ─────────────────────────────────────────────────────────

function safeParseJSON(str, fallback) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch (_) { return fallback; }
}

let __tenantTablesReady = false;
async function ensureTenantTables(env) {
  if (__tenantTablesReady || !env.EMAIL_DB) return;
  try {
    await env.EMAIL_DB.prepare(
      `CREATE TABLE IF NOT EXISTS tenants (
        slug TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        logo_url TEXT,
        colors_json TEXT,
        services_json TEXT NOT NULL,
        copy_overrides_json TEXT,
        confidence_threshold INTEGER DEFAULT 60,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    ).run();
    await env.EMAIL_DB.prepare(
      `CREATE TABLE IF NOT EXISTS vision_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_slug TEXT NOT NULL DEFAULT 'swrv',
        email TEXT,
        name TEXT,
        raw_vision TEXT,
        result_json TEXT NOT NULL,
        confidence_score INTEGER,
        escalated INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    ).run();
    __tenantTablesReady = true;
  } catch (_) { /* tables may already exist with a compatible schema */ }
}

const SWRV_TENANT_FALLBACK = {
  slug: 'swrv',
  brandName: SWRV_ROADMAP_CONFIG.brandName,
  contactEmail: 'info@swrvonthego.pro',
  logoUrl: null,
  colors: {},
  services: SWRV_ROADMAP_CONFIG.services,
  copyOverrides: {},
  confidenceThreshold: 60,
};

// Resolves a tenant slug to its config. Always returns a usable object —
// an unknown slug or a D1 hiccup falls back to the SWRV tenant rather than
// failing the request, since a broken tenant lookup should never take
// down Roadmap generation.
async function getTenantConfig(env, slug) {
  const clean = String(slug || 'swrv').trim().toLowerCase();
  if (clean === 'swrv' || !env.EMAIL_DB) return SWRV_TENANT_FALLBACK;
  try {
    await ensureTenantTables(env);
    const row = await env.EMAIL_DB.prepare('SELECT * FROM tenants WHERE slug = ?').bind(clean).first();
    if (!row) return SWRV_TENANT_FALLBACK;
    return {
      slug: row.slug,
      brandName: row.display_name,
      contactEmail: row.contact_email,
      logoUrl: row.logo_url || null,
      colors: safeParseJSON(row.colors_json, {}),
      services: safeParseJSON(row.services_json, []),
      copyOverrides: safeParseJSON(row.copy_overrides_json, {}),
      confidenceThreshold: typeof row.confidence_threshold === 'number' ? row.confidence_threshold : 60,
    };
  } catch (err) {
    console.error('getTenantConfig failed, falling back to swrv:', err);
    return SWRV_TENANT_FALLBACK;
  }
}

// The proprietary prompt skeleton — CRITICAL RULES 1-9 and the required
// output schema. Formerly lived client-side as `systemPrompt` in
// modules/roadmap/config.ts and was sent to the browser on every request;
// it now lives ONLY here. {{brandIntro}}, {{brandName}} and {{services}}
// are the only per-tenant seams.
const ROADMAP_PROMPT_SKELETON = `You are The Roadmap
{{brandIntro}}

When someone describes their vision to you, you are not reading a form. You are reading a person. You see what they cannot yet see. You hear what they are reaching for beyond the words they used. You understand the gap between where they are and where they are going — and you have the language to name it, map it, and price it.

The user has described their Day in the Happily Ever After. Everything you say must come directly from what they said. You do not invent. You do not guess. You observe, interpret, and reflect back with precision and depth.

{{brandName}} — FULL SERVICE CATALOG:
{{services}}

CRITICAL RULE 1 — NO DUPLICATE SERVICES
If a higher tier already includes something (e.g. a full "Ecosystem" package covering what a smaller "Presence" package offers, or a production package that already includes mixing and mastering), do NOT also list the smaller/included item separately. Read each service blurb. Never recommend what is already covered by a higher tier you have already included.

CRITICAL RULE 2 — PREREQUISITES FIRST
Order every recommendation as it would actually be executed in the real world — you cannot deliver the final output without the steps that build it first. Each phase must unlock the next.

CRITICAL RULE 3 — DEPTH OVER SURFACE
Write the blueprint like you have sat with this person for three hours. The diet section should name what kind of eating sustains THIS output level. The fitness section should describe the physical practice that keeps THIS kind of person sharp. Community should name the specific types of relationships this vision attracts and requires — not "positive people" but the actual tier. Every section must feel written only for this person.

CRITICAL RULE 4 — EVIDENCE IS PROOF
Show your work. "When you said [exact phrase], that revealed..." is the format. You are not praising them — you are tracing every conclusion back to something they actually said.

CRITICAL RULE 5 — VISION-SERVICES MAP IS A BLUEPRINT
4-6 entries. Each takes something they described wanting — in their exact words — and shows the specific services from the catalog above that construct that thing. The connection between vision element and service must be tight and specific, not loose and thematic.

CRITICAL RULE 6 — NO FAMILY REFERENCES
Never mention spouses, children, parents, or siblings.

CRITICAL RULE 7 — CLOSING WORD LANDS
2-3 sentences. Reference one specific detail from their vision. Not "you've got this." Something true, specific, and quietly powerful that makes them think: how did it know that?

WHAT EACH SECTION MUST DO

gift — One sentence. Not a job title. The specific, irreducible thing this person contributes that no one else does quite this way. In their language.

work — 2-3 sentences. What they do that the world pays for. Specific to their vision, not a mission statement.

purpose — 1-2 sentences. The deeper why. Must trace to something they said or clearly implied.

evidence — 4-6 sentences. Show exactly how you arrived at each conclusion. Quote their words. "When you described..." / "The way you talked about..." / "Your mention of..." No generic observations.

vision_summary — 4 present-tense sentences using their specific places, objects, activities, and words. Morning scene, the work, the impact, the legacy.

blueprint — Operational reality of their vision. EVERY field below is REQUIRED and must be filled with real, specific substance. Never return an empty string, a placeholder, or a one-line throwaway for any of them. Each field gets 4-6 sentences minimum.
  reverse_engineering: REQUIRED — the single most important section. Work BACKWARD from the vision they described to the present moment, and show the actual chain. Name the concrete milestones between here and there in reverse order: what must be true right before the vision is real? And right before that? Keep stepping back until you reach something they can do this week. Then name what they have ALREADY built or survived (quote their words) that proves they can do the rest. This must read as a real dependency chain with specific, checkable steps — not a summary of their ambition and not vague encouragement.
  mindset: The precise operating logic their vision demands — not "growth mindset" but the actual mental framework for handling setbacks, critics, and slow periods.
  discipline: The specific daily structure that produces this output. What happens before anyone else is awake. What they protect ruthlessly.
  diet: Specific to their output type and life. Not generic wellness — the actual nutritional approach for living this particular life at this level.
  fitness: Not "stay active." The specific physical practice that supports their kind of mental and creative work. Connected to what their vision actually demands of their body.
  community: The exact type of people this vision requires. What are those people doing? What do they bring? What kinds of relationships drain this person at this stage?
  work_ethic: What their actual workday looks like. Their standards. Their relationship with excellence and deadlines.

brand_colors — 3 colors from environments, aesthetics, and imagery in their vision. Each with a name and meaning tied to something specific they described.

business_name_idea — A name that could only exist for this specific person. Rooted in their world and story.

website_blueprint — 3-4 sentences. Their specific aesthetic, audience, content approach, and purpose. Not a generic website.

recommended_services — 5-8 services. NO PRICES. Each service broken into its real components so the person understands what actually goes into it. Show ALL the pieces. Include things they did not mention but will absolutely need. Be thorough. Each service has: name (the overall service), why (why their specific vision needs this — grounded in what they said), components (array of what it is made of — each with name and what it is/why it matters), phase (Foundation/Production/Delivery/Growth), order (1-8).

vision_elevation — This is the IMPRESS section. Take their vision and elevate it. Show them what they actually said from a bigger perspective — not just correcting but expanding. Then list 4-6 specific things they did NOT mention but will absolutely need to make their vision real. Things that will surprise them. Things that show you actually understand the full scope of what they are building.
  elevated: their vision restated with depth, implication, and gravitas — they should feel seen and understood at a level they did not expect.
  unseen_needs: specific things they did not mention that they will need. Be concrete. Not generic advice — things specific to THEIR vision.

vision_services_map — 4-6 entries. Each: vision_element in their words, optional quote, services array (name only, no price, with why that service builds that specific element).

closing_word — 2-3 sentences. One specific detail. Nothing generic. Make it personal and forward-looking.

roadmap_timeline — THE ROUTE (Apple Maps for their life). 4 phases. Each: phase name (Foundation/Building/Momentum/Arrival), timeframe, title (evocative, specific to their vision), description (3-4 sentences — their specific life in this phase, not generic), milestones (3-4 concrete markers), challenges (2-3 specific to their situation), character_needed (1-2 sentences on who they need to become).

qa_reflection — Pick the 6 MOST REVEALING Phase 2 answers (not all of them — choose the ones that expose the most about who they are and what they're building). For each: question (exact text), answer (ELEVATED — not just grammatically corrected but expanded with depth and insight. Take what they said and show them what it actually means. Make them feel understood beyond their own words). Depth on six beats a shallow pass on sixteen.

confidence_score — REQUIRED integer 0-100. How confidently does the catalog above cover everything this specific person described needing? 90-100 = the catalog fully covers the vision with no gaps. 60-89 = the catalog covers the core need but some detail is uncertain or outside what's offered. Below 60 = significant parts of the vision fall outside the catalog, or the vision is too vague to confidently match at all. Be honest — a low score routes this submission to a human for review, which is the right outcome when the fit is genuinely uncertain. Do not inflate this to seem more helpful.

CRITICAL RULE 8 — COMPLETENESS IS NON-NEGOTIABLE
Every key in the schema must be present and substantive. If you are unsure about something, reason from what they told you and commit to a specific, useful answer — never leave a field blank, never emit a placeholder, and never drop a key to save space. A missing section is a broken product: the page silently hides empty fields, so an omission reads to the visitor as though that analysis was never done.

CRITICAL RULE 9 — DEPTH OVER BREVITY
This is the single deliverable this person walks away with. Be exhaustive and genuinely useful. Prefer concrete specifics over adjectives: name real steps, real tools, real sequences, real numbers, real timeframes. Anything that could be copy-pasted into someone else's roadmap is a failure. If a section could be 3 sentences or 6, choose 6 — but only if the extra sentences carry new information, never filler.

OUTPUT: Single JSON object. No preamble. No markdown. First char { last char }

{"gift":"string","work":"string","purpose":"string","evidence":"string","vision_summary":"string","blueprint":{"reverse_engineering":"string","mindset":"string","discipline":"string","diet":"string","fitness":"string","community":"string","work_ethic":"string"},"brand_colors":[{"hex":"#xxxxxx","name":"string","meaning":"string"},{"hex":"#xxxxxx","name":"string","meaning":"string"},{"hex":"#xxxxxx","name":"string","meaning":"string"}],"business_name_idea":"string","website_blueprint":"string","vision_services_map":[{"vision_element":"string","quote":"string","services":[{"name":"string","connection":"string"}]}],"recommended_services":[{"name":"string","why":"string","components":[{"name":"string","what":"string","note":"string"}],"phase":"string","order":1}],"closing_word":"string","vision_elevation":{"elevated":"string","unseen_needs":["string","string","string","string"]},"roadmap_timeline":[{"phase":"Foundation","timeframe":"0-6 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Building","timeframe":"6-18 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Momentum","timeframe":"18-36 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Arrival","timeframe":"3-5 years","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"}],"qa_reflection":[{"question":"string","answer":"string"}],"confidence_score":85}
`;

const ROADMAP_BOOK_WISDOM_PROMPT = `
You are guided by the wisdom of "The Roadmap: Blueprint Your Vision" by Zion SWRV Birdsong.

Core principles from the book to anchor your analysis:

1. "Where there is no vision, the people perish." Without revelation, people run wild. Your job is to help reveal the vision they already carry.

2. "Vision visits everyone to give their life meaning." The user is not searching for purpose from outside themselves — they are uncovering what was placed in them.

3. "When you know what you can solve, you also know who can help you." Connect their gifts to the specific problems they are equipped to solve.

4. "Vision is the ability to visualize and see past now." Help them see past their current circumstances to where they are designed to go.

5. "Your environment determines your growth." Address the environments — physical, mental, relational — that need to change for their vision to thrive.

6. "Vision is not made, it is received." Treat their answers like clues to a vision that has been given to them, not something they have to manufacture.

7. "Setbacks are setups for your outcome and income." Reframe their struggles as preparation, not obstacles.

8. "The biggest enemy of the right direction is a good direction." Help them see what is GOOD versus what is RIGHT for their specific blueprint.

9. "Past successes can be the worst enemy of vision." Do not let yesterday's wins define their tomorrow.

10. "Faith is speaking like it is already done because you know it is going to be." Use present-tense, affirmative language about their vision.

When generating the assessment, weave these principles into the language without quoting the book directly. The user should feel the wisdom of the book without you announcing it.
`.trim();

// Builds the final system prompt for a resolved tenant. Mirrors the old
// client-side renderSystemPrompt's token-budget clipping exactly — Groq
// counts prompt + reserved output against a 12,000 tokens-per-minute cap,
// so a full catalog of blurbs would eat into the 5000 reserved for output.
function buildSystemPrompt(tenantConfig) {
  const MAX_BLURB = 90;
  const clip = (t) => {
    if (!t) return '';
    return t.length <= MAX_BLURB ? t : t.slice(0, MAX_BLURB).replace(/[\s,;.]+\S*$/, '') + '…';
  };
  const servicesList = (tenantConfig.services || [])
    .map((s) => `- ${s.name}${s.price ? ` — ${s.price}` : ''}${s.blurb ? ` | ${clip(s.blurb)}` : ''}`)
    .join('\n');
  const brandIntro = tenantConfig.copyOverrides?.brandIntro ||
    `You are The Roadmap — the sharpest creative advisor ${tenantConfig.brandName} has ever built. ${tenantConfig.brandName} thinks like a strategist, project lead, and wise advisor all in one.`;
  const skeleton = ROADMAP_PROMPT_SKELETON
    .replace('{{brandIntro}}', brandIntro)
    .replace('{{brandName}}', tenantConfig.brandName)
    .replace('{{services}}', servicesList);
  return `${skeleton}\n\n${ROADMAP_BOOK_WISDOM_PROMPT}`;
}

// Persists the full AI output — this is the first time a Roadmap result
// has ever been saved server-side; previously it only lived in the
// visitor's browser (localStorage) or wasn't saved at all.
async function saveVisionSubmission(env, tenantSlug, { email, name, rawVision, resultJson, confidenceScore, escalated }) {
  if (!env.EMAIL_DB) return null;
  try {
    await ensureTenantTables(env);
    const res = await env.EMAIL_DB.prepare(
      `INSERT INTO vision_submissions
        (tenant_slug, email, name, raw_vision, result_json, confidence_score, escalated)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      tenantSlug || 'swrv',
      email || null,
      name || null,
      (rawVision || '').slice(0, 8000),
      resultJson,
      typeof confidenceScore === 'number' ? confidenceScore : null,
      escalated ? 1 : 0,
    ).run();
    return res?.meta?.last_row_id ?? null;
  } catch (err) {
    console.error('saveVisionSubmission failed:', err);
    return null;
  }
}

// Notifies the tenant's human contact when the AI can't confidently match
// the vision to their catalog — reuses the same hardened Resend path as
// every other outbound email on this Worker.
async function sendEscalationEmail(env, tenantConfig, { email, name, rawVision, confidenceScore }) {
  if (!tenantConfig?.contactEmail) return;
  const safe = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
  const html = `<h2>New vision submission needs a human look</h2>
    <p><strong>Confidence score:</strong> ${confidenceScore ?? 'n/a'}</p>
    <p><strong>Name:</strong> ${safe(name || 'Not given')}</p>
    <p><strong>Email:</strong> ${safe(email || 'Not given')}</p>
    <p><strong>Their vision, in their own words:</strong></p>
    <p>${safe(rawVision || '').replace(/\n/g, '<br>')}</p>`;
  try {
    await resendPost(env, {
      from: fromAddr,
      to: [tenantConfig.contactEmail],
      subject: `Vision submission needs review${name ? ` — ${safe(name)}` : ''}`,
      html,
    });
  } catch (err) {
    console.error('sendEscalationEmail failed:', err);
  }
}

// Public, tenant-facing config — branding + service list ONLY. Never
// includes the prompt skeleton, confidence threshold, or contact email;
// those stay server-only.
async function handleTenantPublicConfig(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const slug = decodeURIComponent(request.url.split('/api/tenant/')[1] || '').split('?')[0];
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug required' }), { status: 400, headers: JSON_HEADERS });
  }
  const tenantConfig = await getTenantConfig(env, slug);
  return new Response(JSON.stringify({
    slug: tenantConfig.slug,
    displayName: tenantConfig.brandName,
    logoUrl: tenantConfig.logoUrl,
    colors: tenantConfig.colors,
    services: tenantConfig.services,
    copyOverrides: tenantConfig.copyOverrides,
  }), { headers: JSON_HEADERS });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ── SUPPORT PAGE ────────────────────────────────────────────
    // Dedicated, publicly available support URL (App Store requirement:
    // must be a real 200 page, not a redirect).
    if (url.pathname === '/support') {
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support — SWRV On The Go</title>
        <meta name="description" content="Get help with SWRV On The Go apps and services. Contact our team — we respond within 1 business day.">
        <link rel="icon" type="image/png" href="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png">
        <style>
          body{margin:0;background:#0a0804;color:#ede8dc;font-family:'Helvetica Neue',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;box-sizing:border-box;}
          .card{max-width:560px;width:100%;background:#13100a;border:1px solid rgba(200,168,75,0.25);border-radius:20px;padding:48px 40px;text-align:center;}
          img.logo{width:64px;height:64px;object-fit:contain;margin-bottom:20px;}
          h1{font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:32px;margin:0 0 8px;color:#fff;}
          p.sub{color:rgba(237,232,220,0.6);font-size:15px;line-height:1.7;margin:0 0 32px;}
          a.email{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c8a84b,#e8c96a);color:#0a0804;font-weight:800;font-size:14px;letter-spacing:0.08em;border-radius:999px;text-decoration:none;margin-bottom:24px;}
          .row{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin-top:8px;}
          .row a{color:#c8a84b;font-size:13px;text-decoration:none;}
          .note{margin-top:28px;font-size:12px;color:rgba(237,232,220,0.35);}
        </style></head><body>
        <div class="card">
          <img class="logo" src="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png" alt="SWRV On The Go">
          <h1>How can we help?</h1>
          <p class="sub">Support for SWRV On The Go apps, services, and orders.<br>Email us and a real person will get back to you within 1 business day.</p>
          <a class="email" href="mailto:info@swrvonthego.pro">info@swrvonthego.pro</a>
          <div class="row">
            <a href="https://swrvonthego.pro">← Back to swrvonthego.pro</a>
            <a href="https://swrvonthego.pro/#contact">Booking &amp; scheduling</a>
          </div>
          <p class="note">SWRV On The Go · © ${new Date().getFullYear()} Swerve (Robert Birdsong). All rights reserved.</p>
        </div>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS } }
      );
    }

    // ── Deep-link shortcuts ─────────────────────────────────────
    // Clean shareable paths that redirect to the right section/app.
    // Lives in the Worker (not _redirects) so it actually runs.
    const SHORTCUTS = {
      // Sections on the main site — redirect to a hash so the SPA scrolls
      '/services':    'https://swrvonthego.pro/#ecosystem',
      '/portfolio':   'https://swrvonthego.pro/#portfolio',
      '/about':       'https://swrvonthego.pro/#about-swrv',
      '/contact':     'https://swrvonthego.pro/#contact',
      '/byob':        'https://swrvonthego.pro/#byob',
      '/revving-up':  'https://swrvonthego.pro/#revving-up',
      '/shop':        'https://swrvonthego.pro/#shop',
      '/websites':    'https://swrvonthego.pro/#need-a-website',
      '/intros':      'https://swrvonthego.pro/intros/',
      '/intro-studio':'https://swrvonthego.pro/intros/',
      '/templates':   'https://swrvonthego.pro/#website-templates',
      // Full Menu category tabs — each tab is directly linkable
      '/menu':        'https://swrvonthego.pro/?catalog=videography#full-menu',
      '/videography': 'https://swrvonthego.pro/?catalog=videography#full-menu',
      '/video':       'https://swrvonthego.pro/?catalog=videography#full-menu',
      '/audio':       'https://swrvonthego.pro/?catalog=audio-production#full-menu',
      '/music':       'https://swrvonthego.pro/?catalog=audio-production#full-menu',
      '/web':         'https://swrvonthego.pro/?catalog=web-digital#full-menu',
      '/brand':       'https://swrvonthego.pro/?catalog=brand-identity#full-menu',
      '/coaching':    'https://swrvonthego.pro/?catalog=coaching#full-menu',
      '/business':    'https://swrvonthego.pro/?catalog=content-business#full-menu',
      // Roadmap — client-facing links drop straight into the test
      // (?roadmap=start skips the "Before You Begin" gate). The plain
      // ?roadmap=1 (used by on-page CTAs) still shows the intro gate.
      '/roadmap':     'https://swrvonthego.pro/?roadmap=start',
      '/the-roadmap': 'https://swrvonthego.pro/?roadmap=start',
      '/start':       'https://swrvonthego.pro/?roadmap=start',
      '/test':        'https://swrvonthego.pro/?roadmap=start',
      '/roadmap-test':'https://swrvonthego.pro/?roadmap=start',
      // External products
      '/bible':       'https://swrv-on-bs-bible.swrvonthego.workers.dev/',
      '/patrol':      'https://spa-patrol.swrvonthego.workers.dev/',
      '/patrol-app':  'https://spa-patrol.swrvonthego.workers.dev/app',
    };
    if (SHORTCUTS[url.pathname]) {
      return Response.redirect(SHORTCUTS[url.pathname], 301);
    }

    // Block API calls from unknown origins (protects Groq/Resend keys)
    if (url.pathname.startsWith('/api/')) {
      const origin = request.headers.get('Origin') || '';
      const referer = request.headers.get('Referer') || '';
      const isKnownOrigin = !origin || // same-origin requests have no Origin header
        ALLOWED_ORIGINS.has(origin) ||
        [...ALLOWED_ORIGINS].some(o => referer.startsWith(o));
      if (!isKnownOrigin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
        });
      }
    }

    if (url.pathname === '/api/roadmap')        return handleRoadmap(request, env);
    if (url.pathname === '/api/chat')           return handleChat(request, env);
    if (url.pathname === '/api/booking')        return handleBooking(request, env);
    if (url.pathname === '/api/intake-ai')      return handleIntakeAI(request, env);
    if (url.pathname === '/api/intake-submit')  return handleIntakeSubmit(request, env);
    if (url.pathname === '/api/referral-report') return handleReferralReport(request, env);
    if (url.pathname === '/api/upload')          return handleUpload(request, env);
    if (url.pathname === '/api/save-vision')     return handleSaveVision(request, env);
    if (url.pathname.startsWith('/api/tenant/')) return handleTenantPublicConfig(request, env);

    // Stripe payment success redirect — set as your Stripe Payment Link success URL:
    // https://swrvonthego.pro/roadmap-unlock
    if (url.pathname === '/roadmap-unlock') {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Complete — SWRV</title>
        <script>
          try { sessionStorage.setItem('swrv_rm_paid','1'); } catch(e){}
          window.location.replace('https://swrvonthego.pro/?rm_paid=1');
        </script>
        <style>body{background:#0a0804;color:#c8a84b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}p{font-size:14px;opacity:.7;}</style>
        </head><body>
          <div><p>Payment confirmed. Taking you to your Roadmap…</p></div>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html', ...SECURITY_HEADERS } }
      );
    }
    if (url.pathname === '/api/save-progress')  return handleSaveProgress(request, env);
    if (url.pathname === '/api/load-progress')  return handleLoadProgress(request, env);
    if (url.pathname === '/api/send-email')     return handleSendEmail(request, env);
    if (url.pathname === '/api/capture-email')  return handleCaptureEmail(request, env);
    if (url.pathname === '/api/zion-booking')   return handleZionBooking(request, env);
    if (url.pathname === '/api/admin-login')    return handleAdminLogin(request, env);
    if (url.pathname === '/api/admin-me')       return handleAdminMe(request, env);
    if (url.pathname === '/api/admin-logout')   return handleAdminLogout(request, env);
    if (url.pathname === '/api/admin/emails')   return handleAdminEmails(request, env);
    if (url.pathname === '/api/admin/submissions') return handleAdminSubmissions(request, env);
    if (url.pathname === '/api/admin/tenants')  return handleAdminTenants(request, env);

    if (url.pathname.startsWith('/r/')) {
      const id = url.pathname.slice(3);
      return Response.redirect(`${url.origin}/?resume=${encodeURIComponent(id)}`, 302);
    }

    if (url.pathname === '/api/health') {
      // Report the SHAPE of the Resend key (never the key itself) so a bad
      // paste — truncation, stray whitespace, wrong prefix — is diagnosable
      // without anyone having to reveal the secret.
      const key = await getResendKey(env);
      return new Response(JSON.stringify({
        status: 'ok',
        hasGroq: !!env.GROQ_API_KEY,
        hasResend: !!key,
        resendKey: {
          length: key.length,
          startsWithRe: key.startsWith('re_'),
          looksComplete: key.startsWith('re_') && key.length >= 30,
          // Where the key came from — 'secret' (Worker env) or 'database'
          // (D1 app_config fallback), so config drift is visible at a glance.
          source: (env.RESEND_API_KEY || '').trim() ? 'secret' : (key ? 'database' : 'none'),
        },
        hasKV: !!env.PROGRESS,
        time: new Date().toISOString(),
      }), { headers: JSON_HEADERS });
    }

    // Static assets
    return env.ASSETS.fetch(request);
  },
};

// ─────────────────────────────────────────────────────────
// AI ROADMAP — Groq
// ─────────────────────────────────────────────────────────
async function handleRoadmap(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({
      error: 'GROQ_API_KEY not configured. Add it in Cloudflare Workers > Settings > Variables.'
    }), { status: 500, headers: JSON_HEADERS });
  }

  try {
    const body = await request.json();
    // The prompt is ALWAYS built server-side from the resolved tenant's
    // config below — a client-sent `system` field (old frontend shape, a
    // stale cached bundle, or a crafted request) is never read or honored.
    // This is the fix for the proprietary prompt being visible in the
    // browser's Network tab: the frontend now only ever sends a tenant
    // slug and the visitor's answers.
    const tenantSlug = String(body.tenantSlug || 'swrv').trim().toLowerCase();
    const userMessage = body.userMessage || body.messages?.[0]?.content || '';

    const tenantConfig = await getTenantConfig(env, tenantSlug);

    // Default system prompt — last-resort fallback only if building the
    // real (tenant-aware, proprietary) prompt throws for some reason.
    const DEFAULT_SYSTEM_PROMPT = `You are The Roadmap for SWRV On The Go (swrvonthego.pro), founded by Swerve (Robert Birdsong), 25+ years in the music business. Analyze the user's vision and return ONLY a JSON object with these exact fields: gift (string), work (string), purpose (string), evidence (string — show your reasoning, quote their words), vision_summary (string — use their specific words/places), blueprint (object with: reverse_engineering, mindset, discipline, diet, fitness, community, work_ethic), brand_colors (array of {hex,name,meaning}), business_name_idea (string), website_blueprint (string), vision_services_map (array of {vision_element, quote, services: [{name,price,connection}]}), recommended_services (array of {name, why, price, phase, order}), closing_word (string — quote something specific they said), confidence_score (integer 0-100). No markdown. No prose outside JSON. First character { last character }.`;

    let system;
    try {
      system = buildSystemPrompt(tenantConfig);
    } catch (err) {
      console.error('buildSystemPrompt failed, using default:', err);
      system = DEFAULT_SYSTEM_PROMPT;
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        // Groq bills prompt + reserved output against a 12,000 tokens-per-
        // minute cap on this tier. The prompt runs ~6k, so anything much
        // above 5k here gets the whole request rejected ("Request too large")
        // rather than truncated — which is how 16000 took generation down
        // entirely. 5000 is the most output we can reserve and still fit,
        // and it is still ~3x the old 1800 that was cutting JSON in half.
        max_tokens: 5000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      console.error('Groq API error:', data);
      const raw = data.error?.message || '';
      // Rate limits and size rejections are operational, not something a
      // visitor can act on — never show them raw API/billing text.
      const isRate = groqResponse.status === 429
        || /rate.?limit|tokens per minute|TPM|too large|reduce your message/i.test(raw);
      const friendly = isRate
        ? 'Our AI is at capacity for the moment. Give it about a minute, then tap Try Again — your answers are saved.'
        : (raw || 'The AI had trouble responding. Tap Try Again.');
      return new Response(JSON.stringify({ error: friendly, retryable: isRate }),
        { status: groqResponse.status, headers: JSON_HEADERS });
    }
    // Surface truncation explicitly. A 'length' finish_reason means the
    // model ran out of room mid-JSON — previously this failed silently and
    // showed up as missing blueprint/timeline sections in the UI.
    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      console.error('Roadmap generation truncated: hit max_tokens. Raise the limit.');
    }
    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) {
      console.error('Groq returned empty content:', data);
      return new Response(JSON.stringify({ error: 'AI returned empty response — try again' }),
        { status: 502, headers: JSON_HEADERS });
    }

    // Persist the full result server-side — this is the first time a
    // Roadmap result has ever been saved anywhere but the visitor's own
    // browser — and escalate to the tenant's human contact when the AI
    // isn't confident its catalog covers what this person described.
    try {
      const parsed = JSON.parse(text);
      const confidenceScore = typeof parsed.confidence_score === 'number' ? parsed.confidence_score : null;
      const hasServices = Array.isArray(parsed.recommended_services) && parsed.recommended_services.length > 0;
      const threshold = typeof tenantConfig.confidenceThreshold === 'number' ? tenantConfig.confidenceThreshold : 60;
      const escalated = !hasServices || (confidenceScore !== null && confidenceScore < threshold);
      const email = body.email || null;
      const name = body.name || null;
      const rawVision = body.rawVision || '';
      await saveVisionSubmission(env, tenantSlug, { email, name, rawVision, resultJson: text, confidenceScore, escalated });
      if (escalated) {
        await sendEscalationEmail(env, tenantConfig, { email, name, rawVision, confidenceScore });
      }
    } catch (err) {
      // Never let persistence/escalation issues block the visitor's result.
      console.error('vision_submissions persistence failed:', err);
    }

    return new Response(JSON.stringify({ content: [{ type: 'text', text }] }),
      { headers: JSON_HEADERS });
  } catch (err) {
    console.error('handleRoadmap error:', err);
    return new Response(JSON.stringify({ error: 'Server error — try again' }),
      { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// SAVE PROGRESS — KV-backed (graceful no-op if KV not bound)
// ─────────────────────────────────────────────────────────
async function handleSaveProgress(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  if (!env.PROGRESS) {
    return new Response(JSON.stringify({ status: 'skipped', reason: 'KV not configured' }),
      { headers: JSON_HEADERS });
  }
  try {
    const body = await request.json();
    if (!body.sessionId) {
      return new Response(JSON.stringify({ error: 'sessionId required' }), { status: 400, headers: JSON_HEADERS });
    }
    // Store with 90-day TTL — sessions auto-expire
    await env.PROGRESS.put(`session:${body.sessionId}`, JSON.stringify(body), {
      expirationTtl: 60 * 60 * 24 * 90,
    });
    return new Response(JSON.stringify({ status: 'saved', id: body.sessionId }),
      { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// LOAD PROGRESS — KV-backed
// ─────────────────────────────────────────────────────────
async function handleLoadProgress(request, env) {
  if (!env.PROGRESS) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), { status: 503, headers: JSON_HEADERS });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'id query param required' }), { status: 400, headers: JSON_HEADERS });
  }
  try {
    const raw = await env.PROGRESS.get(`session:${id}`);
    if (!raw) {
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: JSON_HEADERS });
    }
    return new Response(raw, { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// SEND EMAIL — Resend (graceful no-op if RESEND_API_KEY not set)
// ─────────────────────────────────────────────────────────
async function handleSendEmail(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  try {
    const body = await request.json();
    const { to, userName, sessionId, result, brand, rawVision, attribution, tenantSlug } = body;
    if (!to || !result) {
      return new Response(JSON.stringify({ error: 'to + result required' }), { status: 400, headers: JSON_HEADERS });
    }

    // ALWAYS capture the email to the mailing list first — before we even
    // attempt to send. This guarantees no address is lost if Resend is
    // unconfigured or the send fails.
    await captureEmail(env, {
      email: to,
      name: userName,
      source: 'roadmap-email',
      // Prefer the visitor's OWN words over the AI paraphrase.
      vision_preview: rawVision || result?.vision_summary || '',
      attribution,
      tenant_id: tenantSlug || null,
    });

    // No sending key yet? The email is already saved to the list — just
    // report that the outbound send was skipped.
    const resendKey = await getResendKey(env);
    if (!resendKey) {
      return new Response(JSON.stringify({ status: 'skipped', reason: 'RESEND_API_KEY not configured', captured: true }),
        { headers: JSON_HEADERS });
    }

    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const html = renderRoadmapEmail({
      userName: userName || 'Friend',
      sessionId: sessionId || '',
      result,
      brand: brand || { name: 'SWRV', url: 'https://swrvonthego.pro', ctaUrl: 'https://swrvonthego.pro' },
      origin: new URL(request.url).origin,
    });

    // Tries every configured key (Worker secret, then D1) and falls
    // through on an auth rejection, so one stale key can't block the send.
    const { res: resendRes, data } = await resendPost(env, {
      from: fromAddr,
      to: [to],
      subject: `Your Roadmap is ready — ${userName || 'welcome'}`,
      html,
    });
    if (!resendRes) {
      return new Response(JSON.stringify({ status: 'skipped', reason: 'No usable Resend key configured', captured: true }),
        { headers: JSON_HEADERS });
    }
    if (!resendRes.ok) {
      return new Response(JSON.stringify({ status: 'error', detail: data }),
        { status: resendRes.status, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ status: 'sent', id: data.id }),
      { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', detail: String(err) }),
      { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// CAPTURE EMAIL — saves to D1 email list (no Resend needed)
// ─────────────────────────────────────────────────────────
async function handleCaptureEmail(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  try {
    const { email, name, source, vision_preview, attribution, tenantSlug } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: JSON_HEADERS });
    }
    await captureEmail(env, { email, name, source: source || 'roadmap', vision_preview, attribution, tenant_id: tenantSlug || null });
    return new Response(JSON.stringify({ status: 'ok' }), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', detail: String(err) }),
      { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// ADMIN AUTH — single-user email/password gate backed by D1 (EMAIL_DB)
// Password is stored as a salted SHA-256 hash, never in plaintext.
// ─────────────────────────────────────────────────────────
const ADMIN_SESSION_DAYS = 30;

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

async function getAdminSession(request, env) {
  if (!env.EMAIL_DB) return null;
  const token = parseCookies(request)['admin_session'];
  if (!token) return null;
  const row = await env.EMAIL_DB.prepare(
    'SELECT email, expires_at FROM admin_sessions WHERE token = ?'
  ).bind(token).first();
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

async function handleAdminLogin(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  if (!env.EMAIL_DB) {
    return new Response(JSON.stringify({ error: 'Admin auth not configured' }), { status: 500, headers: JSON_HEADERS });
  }
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: JSON_HEADERS });
    }
    const row = await env.EMAIL_DB.prepare(
      'SELECT email, salt, password_hash FROM admin_users WHERE email = ?'
    ).bind(email.trim().toLowerCase()).first();

    const invalid = () => new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: JSON_HEADERS });
    if (!row) return invalid();

    const hash = await sha256Hex(row.salt + password);
    if (hash !== row.password_hash) return invalid();

    const token = randomToken();
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await env.EMAIL_DB.prepare(
      'INSERT INTO admin_sessions (token, email, expires_at) VALUES (?, ?, ?)'
    ).bind(token, row.email, expiresAt).run();

    const cookie = `admin_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ADMIN_SESSION_DAYS * 24 * 60 * 60}`;
    return new Response(JSON.stringify({ status: 'ok', email: row.email }), {
      headers: { ...JSON_HEADERS, 'Set-Cookie': cookie },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: JSON_HEADERS });
  }
}

async function handleAdminMe(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const session = await getAdminSession(request, env);
  if (!session) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: JSON_HEADERS });
  return new Response(JSON.stringify({ email: session.email }), { headers: JSON_HEADERS });
}

async function handleAdminLogout(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const token = parseCookies(request)['admin_session'];
  if (token && env.EMAIL_DB) {
    await env.EMAIL_DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run().catch(() => {});
  }
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { ...JSON_HEADERS, 'Set-Cookie': 'admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' },
  });
}

async function handleAdminEmails(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const session = await getAdminSession(request, env);
  if (!session) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: JSON_HEADERS });
  const { results } = await env.EMAIL_DB.prepare(
    'SELECT email, name, source, attribution, captured_at FROM email_captures ORDER BY captured_at DESC LIMIT 500'
  ).all();
  return new Response(JSON.stringify({ emails: results }), { headers: JSON_HEADERS });
}

// Vision Portal submissions — tenant-filterable, most recent first.
async function handleAdminSubmissions(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const session = await getAdminSession(request, env);
  if (!session) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: JSON_HEADERS });
  await ensureTenantTables(env);
  const url = new URL(request.url);
  const tenant = (url.searchParams.get('tenant') || '').trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '200', 10) || 200, 1), 500);
  const query = tenant
    ? env.EMAIL_DB.prepare(
        'SELECT id, tenant_slug, email, name, raw_vision, result_json, confidence_score, escalated, created_at FROM vision_submissions WHERE tenant_slug = ? ORDER BY created_at DESC LIMIT ?'
      ).bind(tenant, limit)
    : env.EMAIL_DB.prepare(
        'SELECT id, tenant_slug, email, name, raw_vision, result_json, confidence_score, escalated, created_at FROM vision_submissions ORDER BY created_at DESC LIMIT ?'
      ).bind(limit);
  const { results } = await query.all();
  return new Response(JSON.stringify({ submissions: results }), { headers: JSON_HEADERS });
}

// Vision Portal tenants — list existing / onboard a new one. Onboarding a
// tenant through this endpoint (rather than a config file) is what lets
// the owner add a client business without a code deploy.
async function handleAdminTenants(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  const session = await getAdminSession(request, env);
  if (!session) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: JSON_HEADERS });
  await ensureTenantTables(env);

  if (request.method === 'GET') {
    const { results } = await env.EMAIL_DB.prepare(
      'SELECT slug, display_name, contact_email, logo_url, colors_json, services_json, confidence_threshold, created_at FROM tenants ORDER BY created_at DESC'
    ).all();
    return new Response(JSON.stringify({ tenants: results }), { headers: JSON_HEADERS });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const slug = String(body.slug || '').trim().toLowerCase();
      const displayName = String(body.displayName || '').trim();
      const contactEmail = String(body.contactEmail || '').trim();
      const services = Array.isArray(body.services) ? body.services : [];
      if (!/^[a-z0-9-]+$/.test(slug) || !displayName || !contactEmail || !services.length) {
        return new Response(JSON.stringify({ error: 'slug (a-z0-9-), displayName, contactEmail, and at least one service are required' }),
          { status: 400, headers: JSON_HEADERS });
      }
      await env.EMAIL_DB.prepare(
        `INSERT INTO tenants (slug, display_name, contact_email, logo_url, colors_json, services_json, copy_overrides_json, confidence_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           display_name = excluded.display_name,
           contact_email = excluded.contact_email,
           logo_url = excluded.logo_url,
           colors_json = excluded.colors_json,
           services_json = excluded.services_json,
           copy_overrides_json = excluded.copy_overrides_json,
           confidence_threshold = excluded.confidence_threshold`
      ).bind(
        slug,
        displayName,
        contactEmail,
        body.logoUrl || null,
        JSON.stringify(body.colors || {}),
        JSON.stringify(services),
        JSON.stringify(body.copyOverrides || {}),
        typeof body.confidenceThreshold === 'number' ? body.confidenceThreshold : 60,
      ).run();
      return new Response(JSON.stringify({ status: 'ok', slug }), { headers: JSON_HEADERS });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: JSON_HEADERS });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
}

// EMAIL TEMPLATE moved to ./email-template.js
// (see that file to customize the email HTML)

// ─────────────────────────────────────────────────────────
// Zion Birdsong "Let's Create Together" booking inquiry
// Receives form data and emails info@swrvonthego.pro via Resend
// ─────────────────────────────────────────────────────────
async function handleZionBooking(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  let body = null;
  try {
    body = await request.json();
    const { firstName, lastName, email, inquiryType, eventDate, location, message } = body;
    if (!firstName || !email || !message) {
      return new Response(JSON.stringify({ error: 'firstName, email, message required' }), { status: 400, headers: JSON_HEADERS });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    // Add the booker to the mailing list FIRST — before anything can bail —
    // so the lead is never lost even if outbound email isn't configured.
    await captureEmail(env, { email, name: fullName, source: 'zion-booking' });

    // No sending key yet? The booker + their request are already captured;
    // return success so the visitor still proceeds to the deposit step.
    const resendKey = await getResendKey(env);
    if (!resendKey) {
      return new Response(JSON.stringify({ ok: true, emailSkipped: true }), { headers: JSON_HEADERS });
    }
    const subject = `💰 $50 Deposit Incoming — ${fullName}${eventDate ? ` · ${eventDate}` : ''} (${inquiryType || 'Event'})`;
    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const notifyTo = env.ZION_NOTIFY_EMAIL || env.NOTIFY_EMAIL || 'info@swrvonthego.pro';

    const safe = (x) => String(x ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:auto;padding:24px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <div style="border-bottom:2px solid #c8a84b;padding-bottom:16px;margin-bottom:24px;">
          <h2 style="color:#c8a84b;margin:0;font-size:22px;letter-spacing:0.05em;">🎤 NEW BOOKING INQUIRY</h2>
          <p style="margin:6px 0 0;font-size:12px;color:#8a8070;">Zion Birdsong · Let's Create Together</p>
        </div>
        <div style="background:#1a1610;border:1px solid #c8a84b;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0;color:#e8c96a;font-size:14px;font-weight:700;">💰 They're being shown the $50 deposit link right now.</p>
          <p style="margin:4px 0 0;color:#8a8070;font-size:12px;">This confirms the inquiry was submitted — it does not confirm they've actually paid. There's no payment webhook wired up yet, so watch for the PayPal notification separately to know it landed.</p>
        </div>
        <div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Name</div>
          <div style="flex:1;color:#ede8dc;font-weight:600;">${safe(fullName)}</div>
        </div>
        <div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Email</div>
          <div style="flex:1;"><a href="mailto:${safe(email)}" style="color:#c8a84b;text-decoration:none;">${safe(email)}</a></div>
        </div>
        <div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Event Type</div>
          <div style="flex:1;color:#d4572a;font-weight:600;">${safe(inquiryType || 'Event')}</div>
        </div>
        ${eventDate ? `<div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Event Date</div>
          <div style="flex:1;color:#c8a84b;font-weight:600;">${safe(eventDate)}</div>
        </div>` : ''}
        ${location ? `<div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Location</div>
          <div style="flex:1;color:#ede8dc;">${safe(location)}</div>
        </div>` : ''}
        <div style="margin-top:24px;">
          <div style="color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Message</div>
          <div style="background:#110e07;border-left:3px solid #c8a84b;padding:16px;border-radius:4px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${safe(message)}</div>
        </div>
        <p style="margin-top:32px;padding-top:16px;border-top:1px solid #1c1810;font-size:11px;color:#8a8070;letter-spacing:0.1em;text-transform:uppercase;text-align:center;">Sent from Zion's page · swrvonthego.pro</p>
      </div>
    `;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: [notifyTo],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Resend error:', errText);
      await notifyOwnerOfFailure(env, { source: 'Zion booking notification email', body, err: new Error(errText) });
      return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 502, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Zion booking error:', err);
    await notifyOwnerOfFailure(env, { source: 'Zion booking', body, err });
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// LIVE CHAT — Back-and-forth AI customer service
// Uses Groq (same key as Roadmap). Full conversation history
// passed on every request so the AI maintains context.
// ─────────────────────────────────────────────────────────
const CHAT_SYSTEM_PROMPT = `You are a customer service rep for SWRV On The Go (swrvonthego.pro) — a full-service creative agency founded by Swerve (Robert Birdsong), 25+ years in the music business. You are warm, direct, and knowledgeable. You speak like someone who has actually been in the room — not a chatbot, not a salesperson.

Your job: Help potential clients understand which SWRV services are right for them, answer questions about pricing and process, and guide them toward booking.

SWRV ON THE GO — FULL SERVICE LIST WITH PRICES:
Brand Planning — $250 (includes vision+mission+color palette, AI-powered Roadmap session)
Logo & Brand Identity Design — $250 (2 revision rounds, custom — not templated)
Photography Package — $800 (half-day shoot, editing, color grading included)
Content Strategy & Social Media Kit — $500 (calendar, brand voice, templates)
Website — The Presence — $250 (3-page site, 7 days, SEO audit at 3-6 months)
Website — The Platform — $500 (5-page, booking, 14 days)
Website — The Ecosystem — $1,000 (full modular, 21 days)
Enterprise Ecosystem — Custom Quote (Apple/Microsoft scale, multi-brand, digital record label)
Website Management — $125/month (full-service, proactive)
Website Maintenance — $30/month (security, links, content updates)
Crowdfunding/Fundraising Site — $1,000
Full Song Production — $3,000 (beat, recording, vocal coaching, mixing, mastering — 5 days)
Mixing — $500 (broadcast-ready)
Mastering — $500 (streaming/broadcast standards)
Jingle / Brand Audio — $250
Voiceover Recording — $125/hr
Audiobook Production — $125/hr
Live Recording Session — $125/hr
Audio Editing — $125/hr (scrubbing, noise cancellation, compression, 25yr expertise)
Podcast Launch Kit — $250 + $125/hr
Podcast Episode Production — $125/hr
Music Video (2:30-4 min) — $5,000 (unlimited effects, 5 days post, industry standard $7k-$15k)
Promo Video (under 1 min) — $1,250 (1-day turnaround)
On-Site Filmography & Event Coverage — $500/hr
Live Streaming Setup & Production — $312/hr (multi-platform, chat monitoring)
Reels / Short-Form Content — $300/batch (5-10 videos)
AI Motion Graphics 30s — $600 | 60s — $800 | Up to 2min — $1,200
Video Editing — $250/hr
Pitch Deck + Business Plan — $250
Keynote / Speaking Slides — $250
Book Formatting + Marketing Launch — $750
LLC Formation + Business Banking — $250 (all-inclusive)
Vocal Training (Birdsong Method) — $700 (4-session package)
Recording Booth Training — $875
Artist Development — From $1,000
Strategy Call — $375 (60-min one-on-one)

PAYMENT: Klarna available on all services (buy now, pay later — 4 interest-free payments, SWRV receives full amount upfront).

RULES:
- Be specific — use exact service names and prices when relevant
- Ask probing questions to understand what they're building
- Recommend the full chain (e.g. if they want a music video, they need a song first → Full Song $3k → Mixing $500 → Mastering $500 → Music Video $5k)
- Keep responses concise — 2-4 sentences max per reply unless they ask for detail
- If they want to book, tell them to tap "Book a Session →" or scroll to the booking form
- Never make up services or prices
- Never promise delivery dates you don't know`;

async function handleChat(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({
      reply: "Hey! I'm temporarily offline but you can reach Swerve directly at info@swrvonthego.pro — usually responds within a few hours."
    }), { headers: JSON_HEADERS });
  }

  try {
    const body = await request.json();
    // `messages` is the full conversation history: [{role:'user'|'assistant', content:'...'}]
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400, headers: JSON_HEADERS });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq chat error:', errText);
      return new Response(JSON.stringify({
        reply: "I'm having trouble connecting right now. Email info@swrvonthego.pro and we'll get back to you shortly."
      }), { headers: JSON_HEADERS });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || "Let me connect you with Swerve directly — email info@swrvonthego.pro.";

    return new Response(JSON.stringify({ reply }), { headers: JSON_HEADERS });

  } catch (err) {
    console.error('Chat error:', err);
    return new Response(JSON.stringify({
      reply: "Something went off on my end. Email info@swrvonthego.pro and we'll sort you out."
    }), { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────
// SERVICE BOOKING — Main site booking form
// Sends email to info@swrvonthego.pro via Resend
// Also sends a confirmation to the client
// ─────────────────────────────────────────────────────────
async function handleBooking(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }

  // Declared outside the try so a failure alert can still include whatever
  // the customer submitted, even if something after parsing throws.
  let body = null;
  try {
    body = await request.json();
    const { service, serviceName, servicePrice, kickoffDate, kickoffTime,
            deliveryDate, name, email, phone, message, payMethod,
            assetLink, uploadedFileNames, referralCode, fileAttachments } = body;

    if (!serviceName || !name || !email) {
      return new Response(JSON.stringify({ error: 'serviceName, name, email required' }), { status: 400, headers: JSON_HEADERS });
    }

    // Capture the customer's email to the mailing list (never blocks booking).
    await captureEmail(env, { email, name, source: 'booking' });

    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const notifyTo = env.NOTIFY_EMAIL || 'info@swrvonthego.pro';
    const safe = (x) => String(x ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const PAY_LABELS = {
      klarna:   '🟡 Klarna — Pay in 4 (merchant link to be sent)',
      afterpay: '🟢 Afterpay — Pay in 4 (merchant link to be sent)',
      affirm:   '🟣 Affirm — Financing (merchant link to be sent)',
      zip:      '🟤 Zip — Pay in 4 (merchant link to be sent)',
      sezzle:   '🔴 Sezzle — Pay in 4 (merchant link to be sent)',
      paylater: '🔵 PayPal Pay Later — Pay in 4 (merchant link to be sent)',
      paypal:   '💙 PayPal — Full payment (client redirected)',
      cashapp:  '💚 Cash App — Full payment (client redirected)',
      venmo:    '💜 Venmo — Full payment (client redirected)',
      card:     '💳 Credit / Debit Card (invoice to be sent)',
    };
    const payLabel = PAY_LABELS[payMethod] || '📋 Payment to be arranged';

    // ── Email to SWRV team ──
    const teamHtml = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:auto;padding:24px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <div style="border-bottom:2px solid #c8a84b;padding-bottom:16px;margin-bottom:24px;">
          <h2 style="color:#c8a84b;margin:0;font-size:22px;">🔥 NEW SERVICE BOOKING</h2>
          <p style="margin:6px 0 0;font-size:12px;color:#8a8070;">SWRV On The Go · swrvonthego.pro</p>
        </div>
        ${[
          ['Service', `<strong style="color:#e8c96a">${safe(serviceName)}</strong>`],
          ['Price', `<strong style="color:#c8a84b">${safe(servicePrice)}</strong>`],
          ['Payment', payLabel],
          ['Kickoff', kickoffDate && kickoffTime ? `${safe(kickoffDate)} at ${safe(kickoffTime)} CST` : 'TBD'],
          ['Delivery', deliveryDate || 'TBD'],
          ['', ''],
          ['Client', `<strong>${safe(name)}</strong>`],
          ['Email', `<a href="mailto:${safe(email)}" style="color:#c8a84b">${safe(email)}</a>`],
          ['Phone', phone || 'Not provided'],
        ].map(([label, val]) => label ? `
          <div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
            <div style="width:120px;color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em">${label}</div>
            <div style="flex:1">${val}</div>
          </div>` : '<div style="height:8px"></div>').join('')}
        ${(uploadedFileNames || assetLink) ? `
          <div style="margin-top:16px;padding:12px 16px;background:#1a1610;border-left:3px solid #c8a84b;border-radius:4px;">
            <div style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Project Assets</div>
            ${uploadedFileNames ? `<p style="font-size:13px;color:#ede8dc;margin:0 0 4px">Files: ${safe(uploadedFileNames)}</p>` : ''}
            ${assetLink ? `<p style="font-size:13px;color:#ede8dc;margin:0">Link: <a href="${safe(assetLink)}" style="color:#c8a84b">${safe(assetLink)}</a></p>` : ''}
          </div>
        ` : ''}
        ${referralCode ? `
          <div style="display:flex;padding:8px 0;border-bottom:1px solid #1c1810;font-size:14px;">
            <div style="width:120px;color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Referred By</div>
            <div style="flex:1;color:#c8a84b;font-weight:700;">${safe(referralCode)}</div>
          </div>` : ''}
        ${message ? `<div style="margin-top:20px"><div style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Project Details</div><div style="background:#110e07;border-left:3px solid #c8a84b;padding:14px;border-radius:4px;font-size:14px;line-height:1.6;white-space:pre-wrap">${safe(message)}</div></div>` : ''}
        <p style="margin-top:28px;font-size:11px;color:#8a8070;text-align:center;text-transform:uppercase;letter-spacing:.1em">Submitted via swrvonthego.pro booking</p>
      </div>`;

    // ── Confirmation email to client ──
    const clientHtml = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:auto;padding:32px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <img src="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png" alt="SWRV" style="width:56px;height:56px;border-radius:50%;margin-bottom:24px" />
        <h1 style="color:#c8a84b;font-size:24px;margin:0 0 8px">Booking Confirmed ✓</h1>
        <p style="color:#8a8070;font-size:14px;margin:0 0 28px">We received your booking, ${safe(name)}. SWRV On The Go will confirm within 24 hours.</p>
        <div style="background:#110e07;border:1px solid rgba(200,168,75,.2);border-radius:8px;padding:20px;margin-bottom:24px">
          <p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px">Your Service</p>
          <p style="color:#e8c96a;font-size:18px;font-weight:700;margin:0 0 12px">${safe(serviceName)}</p>
          <p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px">Price</p>
          <p style="color:#c8a84b;font-size:16px;font-weight:700;margin:0 0 12px">${safe(servicePrice)}</p>
          ${kickoffDate ? `<p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px">Kickoff</p><p style="color:#ede8dc;font-size:14px;margin:0 0 12px">${safe(kickoffDate)} at ${safe(kickoffTime || '')} CST</p>` : ''}
          ${deliveryDate ? `<p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px">Estimated Delivery</p><p style="color:#ede8dc;font-size:14px;margin:0">${safe(deliveryDate)}</p>` : ''}
        </div>
        <p style="font-size:14px;line-height:1.7;color:#8a8070">Questions? Reply to this email or reach us at <a href="mailto:info@swrvonthego.pro" style="color:#c8a84b">info@swrvonthego.pro</a></p>
        <p style="margin-top:28px;font-size:11px;color:#555;text-align:center;text-transform:uppercase;letter-spacing:.1em">SWRV On The Go · swrvonthego.pro</p>
      </div>`;

    const resendKey = await getResendKey(env);
    if (!resendKey) {
      // No email service — still return success so booking is tracked
      return new Response(JSON.stringify({ ok: true, note: 'Email service not configured — booking logged' }), { headers: JSON_HEADERS });
    }

    // Build Resend attachments from base64 files (limit to first 3, max 10MB each)
    const attachments = (fileAttachments || [])
      .slice(0, 3)
      .map(f => ({ filename: f.name, content: f.data }));

    // Send to team
    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
        subject: `💰 New Booking (${servicePrice}): ${serviceName} — ${name}${referralCode ? ` (ref: ${referralCode})` : ''}`,
        html: teamHtml,
        attachments: attachments.length ? attachments : undefined }),
    });

    // Send confirmation to client
    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: [email],
        subject: `Booking Confirmed: ${serviceName} — SWRV On The Go`, html: clientHtml }),
    });

    if (!r1.ok) {
      const errText = await r1.text();
      console.error('Resend team email failed:', errText);
      // The lead is already in email_captures either way — but the team
      // notification just failed, so send a separate alert through the
      // hardened multi-key path rather than leaving the owner unaware.
      await notifyOwnerOfFailure(env, { source: 'Service booking notification email', body, err: new Error(errText) });
      return new Response(JSON.stringify({ error: 'Booking received but email delivery failed. Team has been notified.' }), { status: 502, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });

  } catch (err) {
    console.error('Booking error:', err);
    await notifyOwnerOfFailure(env, { source: 'Service booking', body, err });
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: JSON_HEADERS });
  }
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT INTAKE AI — Generates follow-up questions + project brief
// ─────────────────────────────────────────────────────────────────────
async function handleIntakeAI(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const { mode, path, answers, name, email, phone, serviceName } = await request.json();

    if (!env.GROQ_API_KEY) {
      if (mode === 'brief') {
        const brief = formatBasicBrief({ path, answers, name, email, phone, serviceName });
        return new Response(JSON.stringify({ brief }), { headers: JSON_HEADERS });
      }
      return new Response(JSON.stringify({ questions: [] }), { headers: JSON_HEADERS });
    }

    if (mode === 'followup') {
      const answerSummary = Object.entries(answers || {})
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n');

      const prompt = `You are a creative project manager at SWRV On The Go, a full-service creative agency (music, video, brand, web). A client is filling out a ${path} project intake form. Here is what they have told you so far:\n\n${answerSummary}\n\nGenerate 2-3 smart follow-up questions that SWRV genuinely needs answered to scope and deliver this project properly. These should not repeat anything already asked. They should be specific to THIS client's situation based on their answers — not generic. Ask things that would change how the project is approached or priced. Return ONLY a JSON array of question strings, nothing else. Example: ["Question 1?","Question 2?"]`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          temperature: 0.6,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '[]';
      let questions = [];
      try {
        const clean = text.replace(/```json|```/g, '').trim();
        questions = JSON.parse(clean);
      } catch { questions = []; }
      return new Response(JSON.stringify({ questions }), { headers: JSON_HEADERS });
    }

    if (mode === 'brief') {
      const answerSummary = Object.entries(answers || {})
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .filter(([, v]) => v && String(v).trim())
        .join('\n');

      const prompt = `You are writing a project brief for SWRV On The Go, a creative agency. The client ${name} (${email}${phone ? ', ' + phone : ''}) has submitted a ${path} intake form.\n\nTheir answers:\n${answerSummary}\n\nWrite a professional, clear, and specific project brief in plain text (no markdown). Structure it as:\n\nPROJECT BRIEF — ${(path || 'Project').toUpperCase()}${serviceName ? ' / ' + serviceName.toUpperCase() : ''}\n${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}\n\nCLIENT\n[name, email, phone]\n\nPROJECT OVERVIEW\n[2-3 sentences synthesizing what this client needs and why — drawn from their answers]\n\nKEY REQUIREMENTS\n[Bullet list of the most important requirements drawn from their answers]\n\nTIMELINE\n[their stated timeline or TBD]\n\nSCOPE NOTES\n[1-2 sentences about anything unusual, urgent, or important to flag for the SWRV team]\n\nNEXT STEPS\nSWRV will review this brief and follow up within 24 hours with a project proposal and quote.\n\nReturn only the brief text, nothing else.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 800,
          temperature: 0.4,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const brief = data.choices?.[0]?.message?.content || formatBasicBrief({ path, answers, name, email, phone, serviceName });
      return new Response(JSON.stringify({ brief }), { headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Unknown mode' }), { status: 400, headers: JSON_HEADERS });

  } catch (err) {
    console.error('Intake AI error:', err);
    return new Response(JSON.stringify({ questions: [], brief: 'Brief generation failed. Your answers have been recorded.' }), { headers: JSON_HEADERS });
  }
}

function formatBasicBrief({ path, answers, name, email, phone, serviceName }) {
  const lines = [
    `PROJECT BRIEF — ${(path || 'Project').toUpperCase()}${serviceName ? ' / ' + serviceName.toUpperCase() : ''}`,
    new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}),
    '',
    'CLIENT',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    '',
    'PROJECT DETAILS',
    ...Object.entries(answers || {})
      .filter(([,v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`),
    '',
    'NEXT STEPS',
    'SWRV will review this brief and follow up within 24 hours.',
  ].filter(l => l !== null);
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────
// INTAKE SUBMIT — Emails brief to SWRV + confirmation to client
// ─────────────────────────────────────────────────────────────────────
async function handleIntakeSubmit(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  let body = null;
  try {
    body = await request.json();
    const { path, pathLabel, answers, name, email, phone, brief, serviceName } = body;
    // Capture the lead's email to the mailing list (never blocks intake).
    await captureEmail(env, { email, name, source: `intake:${path || 'project'}` });
    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const notifyTo = env.NOTIFY_EMAIL || 'info@swrvonthego.pro';
    const safe = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const briefHtml = (brief || '').split('\n').map(l => `<p style="margin:4px 0;font-size:13px;color:#ede8dc;">${safe(l) || '&nbsp;'}</p>`).join('');

    const teamHtml = `
      <div style="font-family:system-ui,sans-serif;max-width:680px;margin:auto;padding:24px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <h2 style="color:#c8a84b;margin:0 0 4px">📋 New Project Intake</h2>
        <p style="color:#8a8070;font-size:12px;margin:0 0 24px">${safe(pathLabel || path)} · swrvonthego.pro</p>
        <div style="margin-bottom:20px">
          <p style="color:#8a8070;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">Client</p>
          <p style="margin:2px 0"><strong>${safe(name)}</strong> · <a href="mailto:${safe(email)}" style="color:#c8a84b">${safe(email)}</a>${phone ? ` · ${safe(phone)}` : ''}</p>
        </div>
        <div style="background:#110e07;border:1px solid rgba(200,168,75,.15);border-radius:6px;padding:20px;font-family:monospace;">
          ${briefHtml}
        </div>
        <p style="margin-top:20px;font-size:11px;color:#555;text-align:center">Submitted via swrvonthego.pro Project Intake</p>
      </div>`;

    const clientHtml = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:32px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <h1 style="color:#c8a84b;font-size:22px;margin:0 0 6px">Brief Received ✓</h1>
        <p style="color:#8a8070;margin:0 0 24px">Thanks ${safe(name)} — SWRV has everything they need. Expect a response within 24 hours.</p>
        <div style="background:#110e07;border:1px solid rgba(200,168,75,.15);border-radius:6px;padding:20px;font-family:monospace;">
          ${briefHtml}
        </div>
        <p style="margin-top:20px;font-size:12px;color:#8a8070">Questions? <a href="mailto:info@swrvonthego.pro" style="color:#c8a84b">info@swrvonthego.pro</a></p>
      </div>`;

    const resendKey = await getResendKey(env);
    if (resendKey) {
      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
            subject: `📋 New Project Intake: ${pathLabel || path} — ${name}`, html: teamHtml }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromAddr, to: [email],
            subject: `Your ${pathLabel || path} Brief — SWRV On The Go`, html: clientHtml }),
        }),
      ]);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Intake submit error:', err);
    // The client still sees success here (see comment below), so the
    // owner alert is the ONLY way this failure surfaces to anyone.
    await notifyOwnerOfFailure(env, { source: 'Project intake submission', body, err });
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS }); // still succeed for client
  }
}

// ─────────────────────────────────────────────────────────────────────
// REFERRAL REPORT — GET /api/referral-report?secret=YOUR_SECRET
// Shows all referral credits. Swerve uses this to know who to pay.
// ─────────────────────────────────────────────────────────────────────
async function handleReferralReport(request, env) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  // Simple secret check — set REFERRAL_SECRET env var in Cloudflare
  if (!env.REFERRAL_SECRET || secret !== env.REFERRAL_SECRET) {
    return new Response('Forbidden', { status: 403, headers: SECURITY_HEADERS });
  }
  // Referrals are tracked via booking emails (the referralCode field).
  // This endpoint returns a summary from KV if available.
  if (!env.PROGRESS) {
    return new Response(JSON.stringify({
      message: 'KV not configured. Referrals are tracked in booking emails — search info@swrvonthego.pro for "ref:" to see attributed bookings.',
      tip: 'To activate KV tracking, bind a KV namespace to the PROGRESS binding in your Cloudflare Worker settings.'
    }), { headers: JSON_HEADERS });
  }
  const raw = await env.PROGRESS.get('referrals:all') || '[]';
  return new Response(raw, { headers: JSON_HEADERS });
}

// ─────────────────────────────────────────────────────────────────────
// UPLOAD — POST /api/upload
// Accepts multipart/form-data with a `file` field.
// Stores in R2 bucket under `uploads/{folder}/{timestamp}-{filename}`.
// Protected by UPLOAD_TOKEN secret — pass as Authorization: Bearer <token>
//   or ?token=<token> query param.
// Returns: { ok: true, url: "https://cdn.swrvonthego.pro/uploads/..." }
//
// Required Cloudflare setup:
//   1. Create R2 bucket "swrv-uploads" in Cloudflare dashboard
//   2. Add R2 binding in wrangler.jsonc:
//      "r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "swrv-uploads" }]
//   3. Set secret: wrangler secret put UPLOAD_TOKEN
//   4. (Optional) Set CDN_BASE var to your R2 public URL or custom domain
// ─────────────────────────────────────────────────────────────────────
async function handleUpload(request, env) {
  const corsH = getCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }

  // Auth check
  const authHeader = request.headers.get('Authorization') || '';
  const urlToken   = new URL(request.url).searchParams.get('token') || '';
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : urlToken;

  if (!env.UPLOAD_TOKEN || token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }

  // R2 binding check
  if (!env.UPLOADS) {
    return new Response(JSON.stringify({
      error: 'R2 bucket not configured',
      setup: 'Add r2_buckets binding "UPLOADS" pointing to bucket "swrv-uploads" in wrangler.jsonc'
    }), { status: 503, headers: { ...corsH, 'Content-Type': 'application/json' } });
  }

  try {
    const formData = await request.formData();
    const file     = formData.get('file');
    const folder   = formData.get('folder') || 'general'; // e.g. 'clients', 'deliverables', 'assets'

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400, headers: { ...corsH, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize filename
    const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const key       = `uploads/${folder}/${timestamp}-${safeName}`;

    // Upload to R2
    await env.UPLOADS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt:   new Date().toISOString(),
        folder,
      },
    });

    // Build public URL
    const cdnBase = env.CDN_BASE || `https://pub-swrv.r2.dev`; // update after enabling R2 public access
    const url     = `${cdnBase}/${key}`;

    return new Response(JSON.stringify({ ok: true, url, key }), {
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Upload failed', detail: err.message }), {
      status: 500, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// SAVE VISION — POST /api/save-vision
// Called from the main site after a user completes their Roadmap.
// Requires a valid Supabase JWT in Authorization: Bearer <jwt>
// Body: { title, quickAnswers, roadmapAnswers, route, coordinates }
// Upserts into the portal's `visions` table via Supabase REST API.
// ─────────────────────────────────────────────────────────────────────
async function handleSaveVision(request, env) {
  const corsH = getCorsHeaders(request);

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsH });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }

  // Extract Supabase JWT — user must be logged into the portal
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), {
      status: 401, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }
  const jwt = authHeader.slice(7);

  // Supabase project config. The anon key is publishable (it ships in
  // client code by design), but there's no reason to hardcode it in the
  // Worker — read it from the environment so this file stays key-free.
  const SUPABASE_URL  = env.SUPABASE_URL || 'https://jbnwpgvzyykqyqagzcjt.supabase.co';
  const SUPABASE_ANON = env.SUPABASE_ANON_KEY;
  if (!SUPABASE_ANON) {
    // Portal sync is an optional enhancement — degrade quietly rather
    // than failing the caller's request.
    return new Response(JSON.stringify({ status: 'skipped', reason: 'SUPABASE_ANON_KEY not configured' }),
      { headers: JSON_HEADERS });
  }

  try {
    const { title, quickAnswers, roadmapAnswers, route, coordinates } = await request.json();

    // Get the user's ID from Supabase using their JWT
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apikey': SUPABASE_ANON,
      },
    });

    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401, headers: { ...corsH, 'Content-Type': 'application/json' },
      });
    }

    const { id: userId } = await userResp.json();

    // Insert vision into portal DB
    const visionResp = await fetch(`${SUPABASE_URL}/rest/v1/visions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apikey': SUPABASE_ANON,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id:         userId,
        title:           title || 'My Vision',
        status:          route ? 'complete' : 'draft',
        quick_answers:   quickAnswers   || null,
        roadmap_answers: roadmapAnswers || null,
        route:           route          || null,
        coordinates:     coordinates    || null,
        completed_at:    route ? new Date().toISOString() : null,
      }),
    });

    if (!visionResp.ok) {
      const err = await visionResp.text();
      throw new Error(err);
    }

    const [vision] = await visionResp.json();

    return new Response(JSON.stringify({ ok: true, visionId: vision.id }), {
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Save vision error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save vision', detail: err.message }), {
      status: 500, headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }
}
