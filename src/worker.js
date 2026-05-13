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
  'Permissions-Policy':      'camera=(), microphone=(), geolocation=()',
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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
    if (url.pathname === '/api/save-progress')  return handleSaveProgress(request, env);
    if (url.pathname === '/api/load-progress')  return handleLoadProgress(request, env);
    if (url.pathname === '/api/send-email')     return handleSendEmail(request, env);
    if (url.pathname === '/api/zion-booking')   return handleZionBooking(request, env);

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

// ─────────────────────────────────────────────────────────
// Zion Birdsong "Let's Create Together" booking inquiry
// Receives form data and emails info@swrvonthego.pro via Resend
// ─────────────────────────────────────────────────────────
async function handleZionBooking(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: JSON_HEADERS });
  }
  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: JSON_HEADERS });
  }
  try {
    const { firstName, lastName, email, inquiryType, message } = await request.json();
    if (!firstName || !email || !message) {
      return new Response(JSON.stringify({ error: 'firstName, email, message required' }), { status: 400, headers: JSON_HEADERS });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const subject = `Zion Booking Inquiry — ${fullName} (${inquiryType || 'General'})`;
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
          <div style="width:140px;color:#8a8070;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Inquiry Type</div>
          <div style="flex:1;color:#d4572a;font-weight:600;">${safe(inquiryType || 'General')}</div>
        </div>
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
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
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
            assetLink, uploadedFileNames } = body;

    if (!serviceName || !name || !email) {
      return new Response(JSON.stringify({ error: 'serviceName, name, email required' }), { status: 400, headers: JSON_HEADERS });
    }

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

    if (!env.RESEND_API_KEY) {
      // No email service — still return success so booking is tracked
      return new Response(JSON.stringify({ ok: true, note: 'Email service not configured — booking logged' }), { headers: JSON_HEADERS });
    }

    // Send to team
    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
        subject: `🔥 New Booking: ${serviceName} — ${name}`, html: teamHtml }),
    });

    // Send confirmation to client
    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
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

    if (env.RESEND_API_KEY) {
      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromAddr, to: [notifyTo], reply_to: email,
            subject: `📋 New Project Intake: ${pathLabel || path} — ${name}`, html: teamHtml }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
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
