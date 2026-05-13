export interface BrandColor {
  hex: string;
  name: string;
  meaning: string;
}

export interface RecommendedService {
  name: string;
  why: string;
  price: string;
  phase?: 'Foundation' | 'Production' | 'Delivery' | 'Growth';
  order?: number;
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

export interface RoadmapResult {
  gift: string;
  work: string;
  purpose: string;
  evidence: string;             // NEW: how we arrived at each conclusion, quoting them
  vision_summary: string;
  blueprint: Blueprint;         // NEW: deep life analysis
  brand_colors: BrandColor[];
  business_name_idea: string;
  website_blueprint: string;
  vision_services_map: VisionServiceMapping[]; // NEW: vision element → services
  recommended_services: RecommendedService[];
  closing_word: string;
}

export type ScreenId =
  | 'paywall'
  | 'intro'
  | 'email'
  | 'disclaimer'
  | 'duration'
  | 'vision'
  | 'processing'
  | 'results'
  | 'qv-input'
  | 'qv-processing'
  | 'qv-result';

export type Theme = 'luxe' | 'cyberpunk' | 'earth' | 'street' | 'sonic';

export interface ThemeMeta {
  id: Theme;
  name: string;
  tagline: string;
  audio: { url: string; name: string } | null;
}
