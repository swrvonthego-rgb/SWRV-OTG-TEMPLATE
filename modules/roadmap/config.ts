/**
 * Roadmap Module — Configuration
 * ─────────────────────────────────────────────────────────
 * This file is the ONLY place a new client ecosystem needs to edit
 * to rebrand the Roadmap experience. The component code is generic.
 *
 * To clone for a new client:
 *   1. Copy /modules/roadmap/ into the new client's repo
 *   2. Edit this file: brand name, services, AI prompt, copy
 *   3. Done.
 */

import { SERVICES, BRAND } from '../../site.config';

export interface RoadmapService {
  name: string;
  price: string;
  category?: string;
}

export type Theme = 'luxe' | 'cyberpunk' | 'earth' | 'street' | 'sonic';

export interface ThemeMeta {
  id: Theme;
  name: string;
  tagline: string;
  audio: { url: string; name: string } | null;
}

export interface RoadmapConfig {
  /** Brand identity for the AI to reference */
  brandName: string;
  brandUrl: string;
  founderName: string;
  founderTitle: string;

  /** Where the "Let's Build This Together" CTA points */
  ctaUrl: string;

  /** Copy that appears on each screen — overridable per client */
  copy: {
    introLogo: string;
    introTitle: { line1: string; emphasis: string; line3: string };
    introSub: string;
    videoLabel: string;
    videoUrl?: string;
    nameFieldLabel: string;
    namePlaceholder: string;
    introCta: string;

    disclaimerTitle: { line1: string; line2: string };
    disclaimerBody: Array<string>;
    disclaimerNote: string;
    disclaimerBack: string;
    disclaimerNext: string;

    visionPrompt: { line1: string; emphasis: string; line3: string };
    visionSub: string;
    visionPlaceholder: string;
    visionCta: string;

    emailTitle: { line1: string; line2: string };
    emailSub: string;
    emailCta: string;
    emailSkip: string;

    processingTitle: string;
    processingSteps: string[];

    resultsHeadline: { plain: string; emphasis: string };
    resultsCtaButton: string;
  };

  /** Service catalog the AI can recommend from. Use exact names + prices. */
  services: RoadmapService[];

  /** Default theme on first load (overridden by user's localStorage choice). */
  defaultTheme: Theme;

  /** Theme picker entries. Order = display order in the panel. */
  themes: ThemeMeta[];
}

// ══════════════════════════════════════════════════════════
// SWRV ON THE GO — DEFAULT CONFIG
// ══════════════════════════════════════════════════════════

// SWRV_SERVICES is derived from the master SERVICES catalog in site.config.ts.
// To edit: open site.config.ts and modify the SERVICES array. The Roadmap
// will reflect changes automatically. The exclude list below filters out
// the ones that don't fit the Roadmap's "post-vision recommended services" framing.
const ROADMAP_SERVICE_EXCLUDE = new Set<string>([
  'brand-planning',     // self-reference (the Roadmap IS this service)
  'consulting-call',    // standalone CTA, not roadmap-recommendable
]);
const SWRV_SERVICES: RoadmapService[] = SERVICES
  .filter((svc) => !ROADMAP_SERVICE_EXCLUDE.has(svc.id))
  .map((svc) => ({ name: svc.name, price: svc.price, category: svc.category, blurb: svc.blurb } as any));

export const SWRV_ROADMAP_CONFIG: RoadmapConfig = {
  brandName: BRAND.name,
  brandUrl: BRAND.url.replace('https://', ''),
  founderName: 'Swerve',
  founderTitle: 'Robert Birdsong',
  ctaUrl: BRAND.ctaUrl,

  copy: {
    introLogo: 'SWRV OTG · The Roadmap Experience',
    introTitle: { line1: 'Your Vision.', emphasis: 'Your Vehicle.', line3: 'Your Roadmap.' },
    introSub: "Before you build a brand, a business, a plan —\nyou have to know where you're actually going.",
    videoLabel: 'A word from Swerve',
    videoUrl: 'https://assets.swrvonthego.pro/The%20Roadmap%20App%20Assets/vcompress_1_j33pa2.mp4',
    nameFieldLabel: "What's your first name?",
    namePlaceholder: 'Your name',
    introCta: "I'm Ready",

    disclaimerTitle: { line1: 'Before you begin,', line2: 'there is one rule.' },
    disclaimerBody: [
      'In this space, **you have no family. No partner. No children.** No one who needs you. No one you owe anything to.',
      'You are **20 years old.** Just you, your gifts, and all the resources in the world. Not what someone raised you to want. Not what a role requires. **Just what lives inside you.**',
      "You don't need permission. You don't need a sign. **Trust yourself the way you want others to trust you.**",
      "You were made with intention. Everything good that's grown in you — you haven't had the time to sit with it, nurture it, pull it all the way out. **That's what this is for.**",
    ],
    disclaimerNote: 'No siblings. No parents. No spouse. No children.\nNo outside voices. Just you.',
    disclaimerBack: '← Go Back',
    disclaimerNext: "I Understand. Let's Begin.",

    visionPrompt: {
      line1: 'You are',
      emphasis: '50 years old.',
      line3: "Everything worked out exactly the way it should.\nWalk me through your day.",
    },
    visionSub:
      "Speak or type in the present tense — you are already there.\nMorning, afternoon, evening, night. What do you see? What's your work?\nWho is celebrating you, and what are they saying?",
    visionPlaceholder:
      "I'm waking up to the sound of... I can smell... Outside my window I see... My work today is... By night, people are celebrating me because...",
    visionCta: 'Reveal My Roadmap →',

    emailTitle: { line1: 'Your Roadmap is ready.', line2: "Don't let it disappear." },
    emailSub:
      "Send it to your inbox — and get first access when the SWRV community opens. Real people. Real momentum. No spam, no noise. Just builders moving.",
    emailCta: 'Send My Roadmap →',
    emailSkip: "I'll remember it myself",

    processingTitle: 'Reading your vision',
    processingSteps: [
      'Extracting your core gift from your words',
      'Reverse-engineering how you got here',
      'Building your full life blueprint',
      'Mapping your vision to what builds it',
      'Composing your personalized roadmap',
    ],

    resultsHeadline: { plain: 'Your', emphasis: 'Roadmap' },
    resultsCtaButton: "Let's Build This Together →",
  },

  services: SWRV_SERVICES,

  defaultTheme: 'luxe',

  themes: [
    {
      id: 'luxe',
      name: 'Luxe',
      tagline: 'gold, marble, expensive',
      audio: {
        url: 'https://assets.swrvonthego.pro/The%20Roadmap%20App%20Assets/ROADMAP_APP_-_LOFI_OCEAN_PIER_ndlqu8.mp3',
        name: 'Lofi Ocean Pier',
      },
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      tagline: 'neon, future, electric',
      audio: null,
    },
    {
      id: 'earth',
      name: 'Earth',
      tagline: 'zen, daylight, grounded',
      audio: {
        url: 'https://assets.swrvonthego.pro/The%20Roadmap%20App%20Assets/ROADMAP_APP_-_PEACEFUL_NATURE_SOUNDS_vnplxv.mp3',
        name: 'Peaceful Nature Sounds',
      },
    },
    {
      id: 'street',
      name: 'Street',
      tagline: 'graffiti, raw, urban',
      audio: null,
    },
    {
      id: 'sonic',
      name: 'Sonic',
      tagline: 'jazz, brass, velvet',
      audio: {
        url: 'https://assets.swrvonthego.pro/The%20Roadmap%20App%20Assets/ROADMAP_APP_-_PEACEFUL_NATURE_suii2m.mp3',
        name: 'Peaceful Nature',
      },
    },
  ],

};

// The AI system prompt (the proprietary "CRITICAL RULES" question-bank
// logic) used to live here and was built client-side by a now-removed
// renderSystemPrompt() — visible to anyone who opened DevTools. It now
// lives ONLY server-side in src/worker.js (ROADMAP_PROMPT_SKELETON /
// buildSystemPrompt), which also resolves per-tenant service catalogs for
// the multi-tenant Vision Portal. The frontend only ever sends a tenant
// slug and the visitor's answers to /api/roadmap.
