import { renderRoadmapEmail } from './email-template.js';
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
    // Existing deployments predate the attribution column — add it if missing.
    try {
      await env.EMAIL_DB.prepare('ALTER TABLE email_captures ADD COLUMN attribution TEXT').run();
    } catch (_) { /* already exists */ }
    __emailTableReady = true;
  } catch (_) { /* table may already exist with a compatible schema */ }
}

async function captureEmail(env, { email, name, source, vision_preview, attribution } = {}) {
  if (!env || !env.EMAIL_DB || !email) return;
  const clean = String(email).trim().toLowerCase();
  if (!clean.includes('@')) return;
  try {
    await ensureEmailTable(env);
    await env.EMAIL_DB.prepare(
      'INSERT OR IGNORE INTO email_captures (email, name, source, vision_preview, attribution) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      clean,
      name || null,
      source || 'site',
      (vision_preview || '').slice(0, 2000),
      (attribution || '').slice(0, 300) || null,
    ).run();
  } catch (_) { /* never block the request on list capture */ }
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

    if (url.pathname.startsWith('/r/')) {
      const id = url.pathname.slice(3);
      return Response.redirect(`${url.origin}/?resume=${encodeURIComponent(id)}`, 302);
    }

    if (url.pathname === '/api/health') {
      // Report the SHAPE of the Resend key (never the key itself) so a bad
      // paste — truncation, stray whitespace, wrong prefix — is diagnosable
      // without anyone having to reveal the secret.
      const rawKey = env.RESEND_API_KEY || '';
      const key = rawKey.trim();
      return new Response(JSON.stringify({
        status: 'ok',
        hasGroq: !!env.GROQ_API_KEY,
        hasResend: !!key,
        resendKey: {
          length: key.length,
          startsWithRe: key.startsWith('re_'),
          hadWhitespace: rawKey !== key,
          looksComplete: key.startsWith('re_') && key.length >= 30,
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
    const { system, messages } = body;
    const userMessage = messages?.[0]?.content || '';

    // ────────────────────────────────────────────────────────
    // Default system prompt — instructs Groq to return JSON
    // matching the RoadmapResult schema. Used if the caller
    // didn't provide one (which is the current frontend behavior).
    // ────────────────────────────────────────────────────────
    // System prompt is provided by the frontend (renderSystemPrompt in config.ts).
    // This fallback fires only if frontend omits it.
    const DEFAULT_SYSTEM_PROMPT = `You are The Roadmap for SWRV On The Go (swrvonthego.pro), founded by Swerve (Robert Birdsong), 25+ years in the music business. Analyze the user's vision and return ONLY a JSON object with these exact fields: gift (string), work (string), purpose (string), evidence (string — show your reasoning, quote their words), vision_summary (string — use their specific words/places), blueprint (object with: reverse_engineering, mindset, discipline, diet, fitness, community, work_ethic), brand_colors (array of {hex,name,meaning}), business_name_idea (string), website_blueprint (string), vision_services_map (array of {vision_element, quote, services: [{name,price,connection}]}), recommended_services (array of {name, why, price, phase, order}), closing_word (string — quote something specific they said). No markdown. No prose outside JSON. First character { last character }.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: (system && system.trim()) || DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      console.error('Groq API error:', data);
      return new Response(JSON.stringify({ error: data.error?.message || 'Groq API error' }),
        { status: groqResponse.status, headers: JSON_HEADERS });
    }
    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) {
      console.error('Groq returned empty content:', data);
      return new Response(JSON.stringify({ error: 'AI returned empty response — try again' }),
        { status: 502, headers: JSON_HEADERS });
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
    const { to, userName, sessionId, result, brand, rawVision, attribution } = body;
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
    });

    // No sending key yet? The email is already saved to the list — just
    // report that the outbound send was skipped.
    if (!(env.RESEND_API_KEY || "").trim()) {
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

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(env.RESEND_API_KEY || "").trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: [to],
        subject: `Your Roadmap is ready — ${userName || 'welcome'}`,
        html,
      }),
    });

    const data = await resendRes.json();
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
    const { email, name, source, vision_preview, attribution } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: JSON_HEADERS });
    }
    await captureEmail(env, { email, name, source: source || 'roadmap', vision_preview, attribution });
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
  try {
    const { firstName, lastName, email, inquiryType, eventDate, location, message } = await request.json();
    if (!firstName || !email || !message) {
      return new Response(JSON.stringify({ error: 'firstName, email, message required' }), { status: 400, headers: JSON_HEADERS });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    // Add the booker to the mailing list FIRST — before anything can bail —
    // so the lead is never lost even if outbound email isn't configured.
    await captureEmail(env, { email, name: fullName, source: 'zion-booking' });

    // No sending key yet? The booker + their request are already captured;
    // return success so the visitor still proceeds to the deposit step.
    if (!(env.RESEND_API_KEY || "").trim()) {
      return new Response(JSON.stringify({ ok: true, emailSkipped: true }), { headers: JSON_HEADERS });
    }
    const subject = `🎤 Booking Request — ${fullName}${eventDate ? ` · ${eventDate}` : ''} (${inquiryType || 'Event'})`;
    const fromAddr = env.EMAIL_FROM || 'SWRV <hello@swrvonthego.pro>';
    const notifyTo = env.ZION_NOTIFY_EMAIL || env.NOTIFY_EMAIL || 'info@swrvonthego.pro';

    const safe = (x) => String(x ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:auto;padding:24px;background:#0a0804;color:#ede8dc;border-radius:8px;">
        <div style="border-bottom:2px solid #c8a84b;padding-bottom:16px;margin-bottom:24px;">
          <h2 style="color:#c8a84b;margin:0;font-size:22px;letter-spacing:0.05em;">🎤 NEW BOOKING INQUIRY</h2>
          <p style="margin:6px 0 0;font-size:12px;color:#8a8070;">Zion Birdsong · Let's Create Together</p>
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
        'Authorization': `Bearer ${(env.RESEND_API_KEY || "").trim()}`,
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
      return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 502, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Zion booking error:', err);
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

  try {
    const body = await request.json();
    const { service, serviceName, servicePrice, kickoffDate, kickoffTime,
            deliveryDate, name, email, phone, message, payMethod,
            assetLink, uploadedFileNames, referralCode } = body;

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

    if (!(env.RESEND_API_KEY || "").trim()) {
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
      headers: { Authorization: `Bearer ${(env.RESEND_API_KEY || "").trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
        subject: `🔥 New Booking: ${serviceName} — ${name}${referralCode ? ` (ref: ${referralCode})` : ''}`,
        html: teamHtml,
        attachments: attachments.length ? attachments : undefined }),
    });

    // Send confirmation to client
    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${(env.RESEND_API_KEY || "").trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: [email],
        subject: `Booking Confirmed: ${serviceName} — SWRV On The Go`, html: clientHtml }),
    });

    if (!r1.ok) {
      const err = await r1.text();
      console.error('Resend team email failed:', err);
      return new Response(JSON.stringify({ error: 'Booking received but email delivery failed. Team has been notified.' }), { status: 502, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });

  } catch (err) {
    console.error('Booking error:', err);
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

  try {
    const { path, pathLabel, answers, name, email, phone, brief, serviceName } = await request.json();
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

    if ((env.RESEND_API_KEY || "").trim()) {
      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${(env.RESEND_API_KEY || "").trim()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
            subject: `📋 New Project Intake: ${pathLabel || path} — ${name}`, html: teamHtml }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${(env.RESEND_API_KEY || "").trim()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromAddr, to: [email],
            subject: `Your ${pathLabel || path} Brief — SWRV On The Go`, html: clientHtml }),
        }),
      ]);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Intake submit error:', err);
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
