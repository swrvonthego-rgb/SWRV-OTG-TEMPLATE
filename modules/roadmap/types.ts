export interface BrandColor {
  hex: string;
  name: string;
  meaning: string;
}

export interface RecommendedService {
  name: string;
  why: string;
  price: string;
}

export interface RoadmapResult {
  gift: string;
  work: string;
  purpose: string;
  vision_summary: string;
  brand_colors: BrandColor[];
  business_name_idea: string;
  website_blueprint: string;
  recommended_services: RecommendedService[];
  closing_word: string;
}

export type ScreenId =
  | 'intro'
  | 'disclaimer'
  | 'vision'
  | 'email'
  | 'processing'
  | 'results';

/**
 * Theme keys ("skins" in the source app). Each theme has its own
 * palette, typography, signature flourishes, and optional background
 * track. Defined in roadmap.css as `[data-theme="..."]` rules.
 */
export type Theme = 'luxe' | 'cyberpunk' | 'earth' | 'street' | 'sonic';

export interface ThemeMeta {
  /** localStorage value, CSS attribute value */
  id: Theme;
  /** Display name shown in the picker */
  name: string;
  /** Short tagline shown under the name */
  tagline: string;
  /** Optional background music URL — null = no music for this theme */
  audio: { url: string; name: string } | null;
}
