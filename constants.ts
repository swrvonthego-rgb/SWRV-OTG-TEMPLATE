// ════════════════════════════════════════════════════════════
// constants.ts — DEPRECATED
// ════════════════════════════════════════════════════════════
// All site content has moved to:
//   • site.config.ts          — main marketing data
//   • modules/*/config.ts     — module-specific data
//   • media.config.ts         — image URLs
//
// This file is kept only for legacy type definitions some old
// code paths may reference. New code should import from the
// config files directly.
//
// Safe to delete this file once any third-party tooling stops
// referring to it (no current SWRV component does).
// ════════════════════════════════════════════════════════════

export interface Service { title: string; description: string; icon: string; }
export interface NavItem { label: string; href: string; target?: string; }
export interface ExecutionService { name: string; price: string; category?: string; }
export interface Question { id: string; category: string; prompt?: string; }

// Re-exports from site.config for any legacy import that might still exist
export { SERVICE_CATEGORIES as SERVICES, HEADER as _HEADER, SERVICES as EXECUTION_SERVICES } from './site.config';
