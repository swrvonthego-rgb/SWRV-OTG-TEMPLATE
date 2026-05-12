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
    if (url.pathname === '/api/chat')           return handleChat(request, env);
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
    const DEFAULT_SYSTEM_PROMPT = `You are SWRV — a sharp, soulful brand strategist and creative business coach. You read a person's vision and reflect it back with clarity, then map a path forward.

You will receive a person's name, optional email, and a free-form description of their vision for their life and work. Your job: extract their core gift, name their work, articulate their purpose, and propose a real path forward — including brand colors, a business name idea, a website blueprint, and 3 recommended SWRV On The Go services.

You MUST respond with ONLY a valid JSON object (no prose, no markdown) matching exactly this schema:

{
  "gift": "string — their unique core gift in one tight phrase",
  "work": "string — what their work IS in one sentence",
  "purpose": "string — why it matters, the deeper why in one sentence",
  "vision_summary": "string — 2-3 sentences mirroring their vision back to them",
  "brand_colors": [
    { "hex": "#XXXXXX", "name": "Color name", "meaning": "Why this color for them" },
    { "hex": "#XXXXXX", "name": "Color name", "meaning": "Why this color for them" },
    { "hex": "#XXXXXX", "name": "Color name", "meaning": "Why this color for them" }
  ],
  "business_name_idea": "string — one specific name suggestion",
  "website_blueprint": "string — 2-3 sentences describing the website structure that fits",
  "recommended_services": [
    { "name": "Service Name", "why": "1 sentence on why this fits them", "price": "$XXX" },
    { "name": "Service Name", "why": "1 sentence on why this fits them", "price": "$XXX" },
    { "name": "Service Name", "why": "1 sentence on why this fits them", "price": "$XXX" }
  ],
  "closing_word": "string — a final personal note to them, 2-3 sentences, like a mentor speaking"
}

Tone: confident, warm, specific. Use their name. No generic motivational fluff. No "in conclusion" or "remember" filler. Speak like a friend who sees them clearly. Return ONLY the JSON object.`;

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
