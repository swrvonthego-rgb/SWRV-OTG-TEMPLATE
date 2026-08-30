// api/roadmap.ts — Vercel serverless function
// ────────────────────────────────────────────────────────────
// In production (Vercel), this file is auto-deployed as
// https://yoursite.com/api/roadmap.
//
// It calls Groq's Llama 3.3 70B with the system prompt from
// modules/roadmap/config.ts (rendered with the services list
// interpolated). The frontend just sends `{ messages: [...] }`
// and gets back `{ content: [{ type: 'text', text: '...' }] }`.
//
// REQUIRED ENV VARS:
//   GROQ_API_KEY  — get one free at https://console.groq.com
//
// In LOCAL DEV (Vite), this file is NOT used; the
// scripts/dev-api-plugin.ts Vite middleware serves /api/roadmap
// instead so it works out of the box with `npm run dev`.

import { SWRV_ROADMAP_CONFIG } from '../modules/roadmap/config';

// The real, proprietary prompt (CRITICAL RULES + JSON schema) lives
// server-side only in src/worker.js (the Cloudflare Worker that actually
// serves this app's /api/roadmap in production) so it's never sent to or
// built by the browser. This Vercel-era handler is not part of that
// deploy path; it gets an equivalent minimal prompt so it type-checks and
// degrades safely rather than importing removed client-side prompt logic.
function buildSystemPrompt(): string {
  const servicesList = SWRV_ROADMAP_CONFIG.services
    .map((s: any) => `- ${s.name}${s.price ? ` — ${s.price}` : ''}`)
    .join('\n');
  return `You are The Roadmap for ${SWRV_ROADMAP_CONFIG.brandName}. Analyze the user's vision and return ONLY a JSON object with these exact fields: gift, work, purpose, evidence, vision_summary, blueprint (reverse_engineering, mindset, discipline, diet, fitness, community, work_ethic), brand_colors (array of {hex,name,meaning}), business_name_idea, website_blueprint, vision_services_map, recommended_services, vision_elevation, closing_word, roadmap_timeline, qa_reflection, confidence_score (integer 0-100).\n\nSERVICE CATALOG:\n${servicesList}\n\nNo markdown. No prose outside JSON. First character { last character }.`;
}

interface VercelRequest {
  method?: string;
  body?: { messages?: Array<{ role: string; content: string }> };
}
interface VercelResponse {
  setHeader: (k: string, v: string) => void;
  status: (code: number) => VercelResponse;
  json: (data: unknown) => VercelResponse;
  end: () => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: 'GROQ_API_KEY not set. Add it to .env (dev) or Vercel env vars (prod).',
    });
  }

  try {
    const { messages } = req.body || {};
    const userMessage = messages?.[0]?.content || '';

    // Render the system prompt (with services list baked in)
    const systemPrompt = buildSystemPrompt();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1400,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Groq API error',
      });
    }

    const text = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error — try again' });
  }
}
