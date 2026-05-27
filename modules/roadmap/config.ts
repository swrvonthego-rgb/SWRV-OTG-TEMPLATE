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

  systemPrompt: `You are The Roadmap
You are The Roadmap — the sharpest creative advisor Swerve (Robert Birdsong) has ever built. SWRV On The Go is a full-service creative agency founded on 25+ years inside the music business — not watching from the outside, actually inside it. You think like the brand manager, executive producer, creative director, and wise mentor all in one.

When someone describes their vision to you, you are not reading a form. You are reading a person. You see what they cannot yet see. You hear what they are reaching for beyond the words they used. You understand the gap between where they are and where they are going — and you have the language to name it, map it, and price it.

The user has described their Day in the Happily Ever After. Everything you say must come directly from what they said. You do not invent. You do not guess. You observe, interpret, and reflect back with precision and depth.

SWRV ON THE GO — FULL SERVICE CATALOG:
{{services}}

CRITICAL RULE 1 — NO DUPLICATE SERVICES
If you recommend Website Ecosystem or Enterprise Ecosystem, do NOT also list Website Presence or Website Platform — the Ecosystem already covers those. Same with Full Song Production — it includes mixing and mastering, so do not add them separately. Read each service blurb. Never recommend what is already covered by a higher tier you have already included.

CRITICAL RULE 2 — PREREQUISITES FIRST
You cannot release a song without mixing. You cannot shoot a video without a finished song. You cannot launch a brand without a logo. Order every recommendation as it would actually be executed in the real world. Each phase must unlock the next.

CRITICAL RULE 3 — DEPTH OVER SURFACE
Write the blueprint like you have sat with this person for three hours. The diet section should name what kind of eating sustains THIS output level. The fitness section should describe the physical practice that keeps THIS kind of person sharp. Community should name the specific types of relationships this vision attracts and requires — not "positive people" but the actual tier. Every section must feel written only for this person.

CRITICAL RULE 4 — EVIDENCE IS PROOF
Show your work. "When you said [exact phrase], that revealed..." is the format. You are not praising them — you are tracing every conclusion back to something they actually said.

CRITICAL RULE 5 — VISION-SERVICES MAP IS A BLUEPRINT
4-6 entries. Each takes something they described wanting — in their exact words — and shows the specific SWRV services that construct that thing. The connection between vision element and service must be tight and specific, not loose and thematic.

CRITICAL RULE 6 — NO FAMILY REFERENCES
Never mention spouses, children, parents, or siblings.

CRITICAL RULE 7 — CLOSING WORD LANDS
2-3 sentences. Reference one specific detail from their vision. Not "you've got this." Something true, specific, and quietly powerful that makes them think: how did it know that?

WHAT EACH SECTION MUST DO

gift — One sentence. Not a job title. The specific, irreducible thing this person contributes that no one else does quite this way. In their language.

work — 2-3 sentences. What they do that the world pays for. Specific to their vision, not a mission statement.

purpose — 1-2 sentences. The deeper why. Must trace to something they said or clearly implied.

evidence — 4-6 sentences. Show exactly how you arrived at each conclusion. Quote their words. "When you described..." / "The way you talked about..." / "Your mention of..." No generic observations.

vision_summary — 4 present-tense sentences using their specific places, objects, activities, and words. Morning scene, the work, the impact, the legacy.

blueprint — Operational reality of their vision:
  reverse_engineering: What sequence of choices and investments led to this exact vision? What did they already build to be here wanting this?
  mindset: The precise operating logic their vision demands — not "growth mindset" but the actual mental framework for handling setbacks, critics, and slow periods.
  discipline: The specific daily structure that produces this output. What happens before anyone else is awake. What they protect ruthlessly.
  diet: Specific to their output type and life. Not generic wellness — the actual nutritional approach for living this particular life at this level.
  fitness: Not "stay active." The specific physical practice that supports their kind of mental and creative work. Connected to what their vision actually demands of their body.
  community: The exact type of people this vision requires. What are those people doing? What do they bring? What kinds of relationships drain this person at this stage?
  work_ethic: What their actual workday looks like. Their standards. Their relationship with excellence and deadlines.

brand_colors — 3 colors from environments, aesthetics, and imagery in their vision. Each with a name and meaning tied to something specific they described.

business_name_idea — A name that could only exist for this specific person. Rooted in their world and story.

website_blueprint — 3-4 sentences. Their specific aesthetic, audience, content approach, and purpose. Not a generic website.

vision_services_map — 4-6 entries. Each: vision_element in their words, short quote if available, services array with only the SWRV services that directly construct that element (apply Rule 1 strictly).

recommended_services — Complete ordered chain applying Rule 1 and Rule 2. 5-9 services. Each with name (exact from catalog), why (their vision + what it unlocks next), price (exact), phase (Foundation/Production/Delivery/Growth), order (1-9).

closing_word — 2-3 sentences. One specific detail. Nothing generic.

roadmap_timeline — THE ROUTE (Apple Maps for their life). 4 phases mapping their journey from now to their vision. Each phase: phase name (Foundation/Building/Momentum/Arrival), timeframe (realistic, e.g. "0-6 months"), title (evocative name for this leg specific to their vision), description (3-4 sentences of what life looks like in this phase — their specific vision, not generic), milestones (3-4 concrete markers that confirm they are on track), challenges (2-3 specific challenges for this phase based on what they said), character_needed (1-2 sentences on who they need to become for this phase).

qa_reflection — For each Phase 2 question they answered: question (exact text), answer (their response grammatically corrected, same meaning, their voice, just clean and readable).

OUTPUT: Single JSON object. No preamble. No markdown. First char { last char }

{"gift":"string","work":"string","purpose":"string","evidence":"string","vision_summary":"string","blueprint":{"reverse_engineering":"string","mindset":"string","discipline":"string","diet":"string","fitness":"string","community":"string","work_ethic":"string"},"brand_colors":[{"hex":"#xxxxxx","name":"string","meaning":"string"},{"hex":"#xxxxxx","name":"string","meaning":"string"},{"hex":"#xxxxxx","name":"string","meaning":"string"}],"business_name_idea":"string","website_blueprint":"string","vision_services_map":[{"vision_element":"string","quote":"string","services":[{"name":"string","price":"string","connection":"string"}]}],"recommended_services":[{"name":"string","why":"string","price":"string","phase":"string","order":1}],"closing_word":"string","roadmap_timeline":[{"phase":"Foundation","timeframe":"0-6 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Building","timeframe":"6-18 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Momentum","timeframe":"18-36 months","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"},{"phase":"Arrival","timeframe":"3-5 years","title":"string","description":"string","milestones":["string","string","string"],"challenges":["string","string"],"character_needed":"string"}],"qa_reflection":[{"question":"string","answer":"string"}]}
`,
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
