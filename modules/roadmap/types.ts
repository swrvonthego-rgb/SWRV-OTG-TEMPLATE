export interface BrandColor {
  hex: string;
  name: string;
  meaning: string;
}

export interface ServiceComponent {
  name: string;       // e.g. "Song Production"
  what: string;       // what it is and why it's needed
  note?: string;      // optional: if they don't have this yet, etc.
}

export interface RecommendedService {
  name: string;       // e.g. "Music Video"
  why: string;        // why their specific vision needs this
  components: ServiceComponent[];  // what it's made up of — NO prices
  phase?: 'Foundation' | 'Production' | 'Delivery' | 'Growth';
  order?: number;
}

export interface VisionElevation {
  elevated: string;           // their vision rewritten with depth and implication
  unseen_needs: string[];     // 3-5 things they didn't think about but will need
}


// ── NEW: Deep life blueprint derived from the vision ──────────────────
export interface Blueprint {
  reverse_engineering: string;  // what had to happen to arrive at this vision
  mindset: string;              // the mental framework this vision requires
  discipline: string;           // daily habits, routines, standards
  diet: string;                 // nutritional approach for this life
  fitness: string;              // physical practice for this level of output
  community: string;            // the people they need — and don't
  work_ethic: string;           // how they actually work at this level
}

// ── NEW: Vision element mapped to required services ───────────────────
export interface VisionServiceItem {
  name: string;
  price: string;
  connection: string;           // one sentence: exactly why this element needs this service
}

export interface VisionServiceMapping {
  vision_element: string;       // the specific goal/dream they stated
  quote?: string;               // their exact phrase if available
  services: VisionServiceItem[];
}

export interface RoadmapPhase {
  phase: string;           // Foundation / Building / Momentum / Arrival
  timeframe: string;       // e.g. "0–6 months"
  title: string;           // evocative name for this leg of the trip
  description: string;     // what this phase looks like in their life
  milestones: string[];    // specific things that mark progress
  challenges: string[];    // what they'll likely run into
  character_needed: string; // who they need to become to survive this phase
}

export interface QAReflection {
  question: string;
  answer: string;          // grammatically corrected version of what they said
}

export interface RoadmapResult {
  gift: string;
  work: string;
  purpose: string;
  evidence: string;
  vision_summary: string;
  blueprint: Blueprint;
  brand_colors: BrandColor[];
  business_name_idea: string;
  website_blueprint: string;
  vision_services_map: VisionServiceMapping[];
  recommended_services: RecommendedService[];
  closing_word: string;
  // The Route — Apple Maps for their life
  roadmap_timeline?: RoadmapPhase[];
  // Q&A Reflection — their answers, elevated not just corrected
  qa_reflection?: QAReflection[];
  // Vision Elevation — expanded beyond what they said
  vision_elevation?: VisionElevation;
}

export type ScreenId =
  | 'paywall'
  | 'intro'
  | 'email'
  | 'disclaimer'
  | 'duration'
  | 'vision'
  | 'phase2'
  | 'processing'
  | 'heart-note'
  | 'results';

export type Theme = 'luxe' | 'cyberpunk' | 'earth' | 'street' | 'sonic';

export interface ThemeMeta {
  id: Theme;
  name: string;
  tagline: string;
  audio: { url: string; name: string } | null;
}
