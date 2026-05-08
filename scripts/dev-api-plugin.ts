// scripts/dev-api-plugin.ts
// ────────────────────────────────────────────────────────────
// Vite middleware that emulates Vercel serverless functions in
// `npm run dev`. Routes /api/roadmap to the Groq API using the
// same logic as api/roadmap.ts — without it, the dev experience
// would be broken (Vite has no built-in serverless emulator).
//
// In production on Vercel, this plugin is unused; Vercel runs
// api/roadmap.ts as a real serverless function.
// ────────────────────────────────────────────────────────────

import type { Plugin, ViteDevServer } from 'vite';
import { SWRV_ROADMAP_CONFIG, renderSystemPrompt } from '../modules/roadmap/config';

export function devApiPlugin(): Plugin {
  return {
    name: 'roadmap-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/roadmap', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          return res.end();
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        // Read JSON body
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Bad JSON' }));
        }

        const apiKey = process.env.GROQ_API_KEY;

        // ── DEV STUB: if no key set, return a believable mock so
        // the UI is fully testable without an API key ────────────
        if (!apiKey) {
          console.warn(
            '\n  ⚠  GROQ_API_KEY not set — returning a mock Roadmap response.\n' +
              '     Set GROQ_API_KEY in your .env to use the real AI.\n',
          );
          await new Promise((r) => setTimeout(r, 1500));
          const mock = {
            gift: 'You see what others miss — and you know how to make them feel it.',
            work: 'You build immersive brand experiences for visionaries who refuse to be put in a box. You translate inner clarity into outer presence — through story, sound, and design — so that the people who need them can finally find them.',
            purpose:
              "You exist to remind multifaceted people they don't have to shrink. Your work makes the unconventional path feel like the right one.",
            vision_summary:
              "Morning: the room smells like coffee and cedar; you read for an hour before anyone needs you. Midday: you're in studio with someone whose vision was buried — and they leave with it lit. Evening: dinner with people who ask better questions than they answer. Night: you write down what you saw today, knowing tomorrow you'll build it.",
            brand_colors: [
              { hex: '#c4923a', name: 'Ember', meaning: 'The fire you carry — warm, persistent, hard to ignore.' },
              { hex: '#0d0b08', name: 'Deep', meaning: 'The quiet behind the work. Where the real thinking happens.' },
              { hex: '#e8dcc8', name: 'Sand', meaning: 'The grounded warmth. The human texture under everything you build.' },
            ],
            business_name_idea: 'Mock Studio (set GROQ_API_KEY for real results)',
            website_blueprint:
              'Editorial-feeling, slow-paced, with serif headlines and generous whitespace. Each section reads like a chapter, not a pitch. The work breathes; the visitor lingers.',
            recommended_services: [
              {
                name: 'Logo & Brand Identity Design',
                why: "Your work needs a visual signature as considered as the work itself.",
                price: '$350',
              },
              {
                name: 'Vision Statement + Mission Statement Writing',
                why: 'Your inner clarity deserves outer language strong enough to hold it.',
                price: '$150',
              },
              {
                name: 'Website Design & Development',
                why: 'A site that reads like an editorial, not a brochure — built for slow scrollers.',
                price: '$1,800',
              },
              {
                name: 'Photography Package (Brand/Lifestyle)',
                why: 'Imagery that captures the textures of your daily work, not just your face.',
                price: '$600',
              },
            ],
            closing_word:
              "I heard everything you didn't say out loud. You're not behind — you've been gathering. The shape is already there. We just need to give people a door in.",
          };
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              content: [{ type: 'text', text: JSON.stringify(mock) }],
            }),
          );
        }

        // ── REAL: hit Groq ───────────────────────────────────
        try {
          const userMessage = body.messages?.[0]?.content || '';
          const systemPrompt = renderSystemPrompt(SWRV_ROADMAP_CONFIG);

          const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
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

          const data = await upstream.json();

          if (!upstream.ok) {
            console.error('Groq error:', data);
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                error: data.error?.message || 'Groq API error',
              }),
            );
          }

          const text = data.choices?.[0]?.message?.content || '';
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              content: [{ type: 'text', text }],
            }),
          );
        } catch (err) {
          console.error('Dev API error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Server error — try again' }));
        }
      });
    },
  };
}
