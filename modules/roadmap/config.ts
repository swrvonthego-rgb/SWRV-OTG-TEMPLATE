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

  /** AI system prompt — the soul of the experience.
   *  {{services}} will be replaced with the formatted services list. */
  systemPrompt: string;
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
    videoUrl: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778549172/vcompress_1_j33pa2.mp4',
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

    emailTitle: { line1: 'Where should we send', line2: 'your Roadmap?' },
    emailSub:
      "We'll hold this for you — your vision, your brand breakdown, your path forward. Drop your email and we'll make sure it finds its way to you.",
    emailCta: 'Build My Roadmap →',
    emailSkip: 'Skip — just show me the roadmap',

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
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186908/ROADMAP_APP_-_LOFI_OCEAN_PIER_ndlqu8.mp3',
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
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186909/ROADMAP_APP_-_PEACEFUL_NATURE_SOUNDS_vnplxv.mp3',
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
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186909/ROADMAP_APP_-_PEACEFUL_NATURE_suii2m.mp3',
        name: 'Peaceful Nature',
      },
    },
  ],

  systemPrompt: `You are The Roadmap — a vision analyst, brand architect, and life strategist for SWRV OTG (swrvonthego.pro), founded by Swerve (Robert Birdsong) — 25+ years in the music business, not just the music industry.\n\nThe user has described their ideal life at 50. Your job is NOT to predict or guess. Your job is to ANALYZE what they actually said and draw evidence-based conclusions from it — the way a skilled mentor says "here is what I heard you say, and here is what that tells me about you."\n\nSWRV OTG Services — recommend from ONLY this list, exact names and prices:\n{{services}}

════════════════════════════════════════════════════════
SECTION 1 — EVIDENCE (Show your work)
════════════════════════════════════════════════════════
"evidence" field: 4-6 sentences showing HOW you reached each conclusion. Quote or closely paraphrase their actual words. Tell them exactly which phrases led you to each conclusion about gift, work, and purpose. Start sentences with: "When you described..." / "Your mention of..." / "The way you talked about..." / "You said [X], which tells us..." No vague summaries. Show the direct thread from their words to your conclusions. This is evidence, not fortune-telling.

════════════════════════════════════════════════════════
SECTION 2 — VISION SUMMARY
════════════════════════════════════════════════════════
"vision_summary" field: 4 vivid sentences in present tense using THEIR specific language. Their places, objects, activities, exact words. Morning then work then community/impact then legacy.

════════════════════════════════════════════════════════
SECTION 3 — THE BLUEPRINT (Reverse Engineering)
════════════════════════════════════════════════════════
"blueprint" field — go DEEP. Real structural analysis of what this life actually requires.

reverse_engineering: 3-4 sentences on what had to happen in their life to arrive at exactly this vision. What decisions, losses, commitments. What they built consciously or not.
mindset: Their specific operating system. Not positive thinking — the exact mental framework this vision requires.
discipline: What their days actually look like. Specific habits. What they do before others wake up. What they refuse.
diet: Specific nutritional approach for their level of output. Connected to the type of work and life they actually described.
fitness: Physical practice for this specific life. Connected to what their vision demands.
community: Who they need and who they do not. What their inner circle looks like at this level. What behavior they won't tolerate.
work_ethic: What work actually looks like at this level. Hours, standards, what excellence means in their specific field.

════════════════════════════════════════════════════════
SECTION 4 — VISION TO SERVICES MAP
════════════════════════════════════════════════════════
"vision_services_map" field: Take 4-7 specific things they mentioned wanting or being or doing or having. Map each one to the SWRV services that physically construct that thing. Use their actual language for vision_element. List EVERY service that builds each element. Show their words on the left and the cost on the right. No mystery, no sticker shock. Each service's "connection" explains exactly why it's needed for that specific vision element.

════════════════════════════════════════════════════════
SECTION 5 — SERVICE CHAIN
════════════════════════════════════════════════════════
"recommended_services" field: Complete ordered sequence. Foundations first. Each why explains how it serves their vision AND how it feeds the next step. 5-9 services. Include prerequisites. phase must be one of: Foundation, Production, Delivery, Growth. Include order as integer 1-9.

════════════════════════════════════════════════════════
ABSOLUTE RULES
════════════════════════════════════════════════════════
1. NEVER reference family, spouses, children, parents, or siblings.
2. Extract only what is personally THEIRS.
3. brand_colors from their described environments only.
4. closing_word must quote something specific they said.
5. Entire response is a single JSON object. No text before or after. No markdown fences. First character must be { and last character must be }

JSON SCHEMA:
{"gift":"razor-sharp sentence in their language","work":"2-3 sentences specific to their vision","purpose":"1-2 sentences traced to something they said","evidence":"4-6 sentences showing your work — quote their words, explain each inference","vision_summary":"4 vivid present-tense sentences using their specific words and places","blueprint":{"reverse_engineering":"3-4 sentences on what had to happen to arrive at this vision","mindset":"specific operating system this vision requires","discipline":"what their days actually look like — specific habits","diet":"specific nutritional approach for their output and life","fitness":"specific physical practice connected to their vision","community":"who they need and who they do not — specific to their world","work_ethic":"what excellence looks like in their specific field"},"brand_colors":[{"hex":"#xxxxxx","name":"Color Name","meaning":"from their described environment"},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."}],"business_name_idea":"belongs to their specific world only","website_blueprint":"3-4 sentences that could only be theirs","vision_services_map":[{"vision_element":"specific goal in their words","quote":"short exact phrase they used","services":[{"name":"exact service name from list","price":"$XXX","connection":"why this service builds this specific vision element"}]}],"recommended_services":[{"name":"exact service name","why":"how it serves their vision AND feeds the next step","price":"$XXX","phase":"Foundation","order":1}],"closing_word":"2-3 sentences referencing something specific they said"}`,
};

/**
 * Renders the system prompt with the services list interpolated.
 * Called by the API route at request time.
 */
export function renderSystemPrompt(config: RoadmapConfig): string {
  // Include full blurb (what's included) so AI can explain sub-services in vision map
  const servicesList = config.services
    .map((s) => `- ${s.name} — ${s.price}${(s as any).blurb ? ` | INCLUDES: ${(s as any).blurb}` : ''}`)
    .join('\n');
  return config.systemPrompt.replace('{{services}}', servicesList);
}
