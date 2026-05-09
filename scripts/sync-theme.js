#!/usr/bin/env node
// ════════════════════════════════════════════════════════════
// scripts/sync-theme.js
// ════════════════════════════════════════════════════════════
//
// Reads BRAND_TOKENS from site.config.ts and rewrites the
// `@theme { ... }` block in index.css. This keeps Tailwind v4's
// theme tokens in sync with the JS-side BRAND_TOKENS export
// (which other modules can import directly).
//
// Runs automatically before `npm run build` via the package.json
// "prebuild" hook. Also safe to run manually:  npm run sync-theme
// ════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE_CONFIG = path.join(ROOT, 'site.config.ts');
const INDEX_CSS = path.join(ROOT, 'index.css');

// ── 1. Extract the BRAND_TOKENS.colors object literal from site.config.ts ──
const config = fs.readFileSync(SITE_CONFIG, 'utf8');
const colorsMatch = config.match(/BRAND_TOKENS = \{[\s\S]+?colors:\s*\{([\s\S]+?)\}/);
if (!colorsMatch) {
  console.error('✗ Could not find BRAND_TOKENS.colors in site.config.ts');
  process.exit(1);
}
const colorsBlock = colorsMatch[1];

// Parse `'lion-orange': '#FF4D00',  // comment`
const colorEntries = [];
for (const line of colorsBlock.split('\n')) {
  const m = line.match(/'([^']+)':\s*'(#[^']+)'/);
  if (m) colorEntries.push([m[1], m[2]]);
}

if (colorEntries.length === 0) {
  console.error('✗ No color entries parsed');
  process.exit(1);
}

// ── 2. Build the new @theme block ──
const themeLines = [
  '@theme {',
  ...colorEntries.map(([k, v]) => `  --color-${k}: ${v};`),
  '',
  '  --font-sans: "Inter", "system-ui", "sans-serif";',
  '}',
];
const newThemeBlock = themeLines.join('\n');

// ── 3. Replace the existing @theme block in index.css ──
const css = fs.readFileSync(INDEX_CSS, 'utf8');
const themeRe = /@theme\s*\{[\s\S]*?\n\}/;
if (!themeRe.test(css)) {
  console.error('✗ Could not find @theme block in index.css');
  process.exit(1);
}
const updated = css.replace(themeRe, newThemeBlock);

if (updated === css) {
  console.log('✓ Tailwind theme already in sync with BRAND_TOKENS');
} else {
  fs.writeFileSync(INDEX_CSS, updated);
  console.log(`✓ Synced ${colorEntries.length} color tokens from site.config.ts → index.css`);
  for (const [k, v] of colorEntries) console.log(`    ${k.padEnd(14)} ${v}`);
}
