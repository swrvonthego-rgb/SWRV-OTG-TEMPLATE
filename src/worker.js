import { renderRoadmapEmail } from './email-template.js';
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

// EMAIL TEMPLATE moved to ./email-template.js
// (see that file to customize the email HTML)
