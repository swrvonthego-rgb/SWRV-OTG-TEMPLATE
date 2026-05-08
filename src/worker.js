// src/worker.js — Cloudflare Worker entry point
// Handles /api/roadmap by calling Groq, falls through to static assets

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

    // ── API routes ─────────────────────────────────────────
    if (url.pathname === '/api/roadmap') {
      return handleRoadmap(request, env);
    }

    // Health check — useful for debugging
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          hasGroqKey: !!env.GROQ_API_KEY,
          time: new Date().toISOString(),
        }),
        { headers: JSON_HEADERS }
      );
    }

    // ── Static assets ──────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};

async function handleRoadmap(request, env) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  // Validate API key configured
  if (!env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'GROQ_API_KEY not configured. Set it in Cloudflare Workers > Settings > Variables and Secrets.',
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const { system, messages } = body;
    const userMessage = messages?.[0]?.content || '';

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
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
      }
    );

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('Groq error:', data);
      return new Response(
        JSON.stringify({
          error: data.error?.message || 'Groq API error',
        }),
        { status: groqResponse.status, headers: JSON_HEADERS }
      );
    }

    const text = data.choices?.[0]?.message?.content || '';

    // Match the response shape the frontend expects
    return new Response(
      JSON.stringify({
        content: [{ type: 'text', text }],
      }),
      { headers: JSON_HEADERS }
    );
  } catch (err) {
    console.error('Handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error — try again' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
