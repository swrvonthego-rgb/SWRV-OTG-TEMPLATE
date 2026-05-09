// ════════════════════════════════════════════════════════════
// copy.config.ts — Centralized copy + AI prompts + email templates
// ════════════════════════════════════════════════════════════
//
// Long-form, human-readable copy strings that are referenced from
// multiple places (Brand Transmission narration, Roadmap email
// templates, AI system prompt, etc.).
//
// Note: short UI copy stays in site.config.ts (HERO, ABOUT, FOOTER, etc.).
// This file is for the longer narrative + AI prompt text that benefits
// from being its own concern.
// ════════════════════════════════════════════════════════════

// ── BRAND TRANSMISSION NARRATION (7 scenes) ─────────────────
// These map 1:1 to public/audio/narration-{0..6}.mp3
// To regenerate the audio, edit these strings AND re-run the GitHub
// Actions workflow `.github/workflows/generate-narration.yml`.
//
// IMPORTANT: this file is referenced by docs only — the brand-transmission.html
// has its own copy of these strings (they need to be inlined for the iframe).
// Keep them in sync. If you edit narration text, update BOTH places:
//   • public/brand-transmission.html (the SCENES array)
//   • this file (for documentation/regeneration purposes)
export const BRAND_TRANSMISSION_SCENES = [
  {
    label: 'TRANSMISSION 01/07 — WORLD STATUS',
    narration:
      "The world has changed. Content creation is how the world speaks now. Whether you're a musician, a chef, a pastor, a dancer, a coach, a developer, an athlete, a stylist, a realtor, or a business owner — you are an artist. And every artist needs a brand ecosystem built entirely around their vision.",
  },
  {
    label: 'TRANSMISSION 02/07 — THE PROBLEM',
    narration:
      "Most people are trying to build their vision with the wrong tools. They're using generic platforms, generic templates, generic strategies — and wondering why their work doesn't feel like theirs.",
  },
  {
    label: 'TRANSMISSION 03/07 — THE INSIGHT',
    narration:
      "Your vision is yours. Your brand should be too. The systems you use to bring it into the world should bend to your gift — not the other way around.",
  },
  {
    label: 'TRANSMISSION 04/07 — THE METHOD',
    narration:
      "We start with a Roadmap. We map your gift, your work, your purpose, and your brand identity. Then we build the ecosystem — modular, custom, scalable — that lets your vision live in the world.",
  },
  {
    label: 'TRANSMISSION 05/07 — THE WORK',
    narration:
      "Logos. Websites. Content engines. AI experiences. Books. Music. Video. Whatever your vision needs to be felt by the people it's meant for.",
  },
  {
    label: 'TRANSMISSION 06/07 — THE PROMISE',
    narration:
      "We build with you. Not just for you. Your team becomes our team. Your timeline becomes our timeline. Your win is our win.",
  },
  {
    label: 'TRANSMISSION 07/07 — THE INVITATION',
    narration:
      "If you're ready to build your ecosystem the right way — start with the Roadmap. Five minutes. Your vision. Your way forward. Tap below to begin.",
  },
] as const;

// ── EMAIL TEMPLATES ─────────────────────────────────────────
// Subject lines and HTML body templates for transactional emails
// sent by the Cloudflare Worker (src/worker.js). The worker.js file
// has the actual template inlined — these constants are for documentation
// and any future centralized email worker.
export const EMAIL_TEMPLATES = {
  roadmapResults: {
    subject: 'Your Roadmap is Ready — SWRV On The Go',
    fromName: 'Roadmap',
    fromAddress: 'onboarding@resend.dev', // override with EMAIL_FROM env var
  },
  bookingConfirmation: {
    subject: 'Your Booking with Zion SWRV Birdsong — Confirmed',
    fromName: 'SWRV',
    fromAddress: 'hello@swrvonthego.pro',
  },
} as const;

// ── ROADMAP AI SYSTEM PROMPT ────────────────────────────────
// Note: the Roadmap module (modules/roadmap/config.ts) has its own
// system prompt definition. This is a documentation-only mirror.
// Authoritative source: modules/roadmap/config.ts → ai.systemPrompt
//
// Keep this in sync if you edit the prompt. Or, in the future,
// refactor the Roadmap config to import from here.
export const ROADMAP_AI_DOC_NOTE = `
The Roadmap's AI system prompt lives in modules/roadmap/config.ts.
It instructs Llama-3.3-70b on Groq to:
  • Read the user's "day in the happily ever after" vision
  • Extract their gift, purpose, brand voice, and identity
  • Match them to SWRV services (the SERVICES catalog in site.config.ts)
  • Return structured JSON for the Roadmap UI to render

To edit the prompt or recommended-services logic, open modules/roadmap/config.ts.
`;
