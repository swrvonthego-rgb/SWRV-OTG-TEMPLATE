// src/worker.js — Cloudflare Worker entry point
//
// Routes:
//   POST /api/roadmap         → calls Groq for AI Roadmap generation (always works)
//   POST /api/save-progress   → saves session to KV (if PROGRESS binding exists)
//   GET  /api/load-progress   → loads session by ?id=… from KV
//   POST /api/send-email      → sends results email via Resend (if RESEND_API_KEY exists)
//   GET  /r/:id               → resume URL — redirects to / with session ID hash
//   GET  /api/health          → debug
//   *                          → static asset fallback
//
// Optional secrets / bindings (worker degrades gracefully if missing):
//   GROQ_API_KEY      (secret) — REQUIRED for AI generation
//   RESEND_API_KEY    (secret) — for email sending
//   EMAIL_FROM        (var)    — sender address, e.g. "SWRV <hello@swrvonthego.pro>"
//   PROGRESS          (KV)     — namespace binding for session persistence

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/roadmap')        return handleRoadmap(request, env);
    if (url.pathname === '/api/save-progress')  return handleSaveProgress(request, env);
    if (url.pathname === '/api/load-progress')  return handleLoadProgress(request, env);
    if (url.pathname === '/api/send-email')     return handleSendEmail(request, env);

    if (url.pathname.startsWith('/r/')) {
      const id = url.pathname.slice(3);
      return Response.redirect(`${url.origin}/?resume=${encodeURIComponent(id)}`, 302);
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        hasGroq: !!env.GROQ_API_KEY,
        hasResend: !!env.RESEND_API_KEY,
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

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1400,
        temperature: 0.7,
        messages: [
          { role: 'system', content: system || '' },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Groq API error' }),
        { status: groqResponse.status, headers: JSON_HEADERS });
    }
    const text = data.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ content: [{ type: 'text', text }] }),
      { headers: JSON_HEADERS });
  } catch (err) {
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
  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ status: 'skipped', reason: 'RESEND_API_KEY not configured' }),
      { headers: JSON_HEADERS });
  }
  try {
    const body = await request.json();
    const { to, userName, sessionId, result, brand } = body;
    if (!to || !result) {
      return new Response(JSON.stringify({ error: 'to + result required' }), { status: 400, headers: JSON_HEADERS });
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
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
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
// EMAIL HTML TEMPLATE
// ─────────────────────────────────────────────────────────
function renderRoadmapEmail({ userName, sessionId, result, brand, origin }) {
  const total = (result.recommended_services || []).reduce((sum, s) => {
    const n = parseInt((s.price || '').replace(/\D/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const resumeUrl = sessionId ? `${origin}/r/${sessionId}` : `${origin}/`;
  const tierUrl = brand.ctaUrl || `${origin}/`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Your Roadmap</title></head>
<body style="margin:0;background:#0d0b08;font-family:Georgia,serif;color:#e8dcc8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b08;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111009;border:1px solid rgba(232,220,200,.1);border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td style="padding:32px 40px;text-align:center;border-bottom:1px solid rgba(232,220,200,.1);">
  <div style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#c4923a;font-family:Georgia,serif;font-style:italic;">${escapeHtml(brand.name)}</div>
  <h1 style="margin:14px 0 0;font-size:32px;font-weight:400;color:#f7f2ea;font-style:italic;">Your Roadmap</h1>
  <p style="margin:8px 0 0;font-size:13px;color:rgba(232,220,200,.5);">${escapeHtml(userName)} · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
  ${section('Your Gift', result.gift)}
  ${section('Your Work', result.work)}
  ${section('Your Purpose', result.purpose)}
  ${section('Your Happily Ever After — Mapped', result.vision_summary)}
  ${section('Your Brand Identity', `<strong style="color:#d4a843;">${escapeHtml(result.business_name_idea || '')}</strong><br>${escapeHtml(result.website_blueprint || '')}`)}

  ${result.recommended_services && result.recommended_services.length ? `
    <h3 style="margin:32px 0 14px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">What It Takes — ${escapeHtml(brand.name)} Services</h3>
    ${result.recommended_services.map(s => `
      <div style="border:1px solid rgba(232,220,200,.1);border-radius:4px;padding:14px;margin-bottom:10px;">
        <div style="font-weight:600;color:#f7f2ea;">${escapeHtml(s.name)} <span style="float:right;color:#d4a843;">${escapeHtml(s.price)}</span></div>
        <div style="font-size:14px;color:rgba(232,220,200,.7);margin-top:6px;">${escapeHtml(s.why)}</div>
      </div>
    `).join('')}
    <div style="margin-top:18px;padding:14px;border-top:1px solid rgba(232,220,200,.1);text-align:right;">
      <span style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,220,200,.5);">Estimated investment&nbsp;</span>
      <span style="font-size:24px;color:#d4a843;font-weight:600;">$${total.toLocaleString()}</span>
    </div>
  ` : ''}

  ${result.closing_word ? `
    <div style="margin-top:32px;padding:24px;background:rgba(196,146,58,.05);border-left:3px solid #c4923a;font-style:italic;color:#e8dcc8;">
      ${escapeHtml(result.closing_word)}
    </div>
  ` : ''}
</td></tr>

<!-- CTAs -->
<tr><td style="padding:0 40px 32px;text-align:center;">
  <a href="${tierUrl}" style="display:inline-block;background:#c4923a;color:#111009;padding:14px 28px;text-decoration:none;font-weight:600;letter-spacing:.05em;text-transform:uppercase;font-size:13px;border-radius:2px;margin:8px;">Choose Your Tier →</a>
  <br>
  <a href="${resumeUrl}" style="display:inline-block;color:#c4923a;padding:10px;text-decoration:underline;font-size:13px;margin-top:8px;">Resume / finish later</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid rgba(232,220,200,.1);font-size:11px;color:rgba(232,220,200,.4);">
  Generated by <a href="${escapeHtml(brand.url || '#')}" style="color:#c4923a;text-decoration:none;">${escapeHtml(brand.name)}</a>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function section(label, value) {
  return `
    <h3 style="margin:0 0 8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">${escapeHtml(label)}</h3>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#e8dcc8;">${value}</p>
  `;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
