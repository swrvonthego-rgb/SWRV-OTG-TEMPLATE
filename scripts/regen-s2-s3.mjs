/**
 * Regenerate ONLY narration-2.mp3 and narration-3.mp3
 *
 * These two scenes had mismatched text between the audio and the captions.
 * This script fixes S2 (We Swerve) and S3 (20+ Years) to exactly match
 * the white captions shown in brand-transmission.html.
 *
 * Run:
 *   ELEVENLABS_API_KEY=sk_... node scripts/regen-s2-s3.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'audio');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('\n❌  Missing ELEVENLABS_API_KEY');
  console.error('   Run: ELEVENLABS_API_KEY=sk_... node scripts/regen-s2-s3.mjs\n');
  process.exit(1);
}

const VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian — Deep, Resonant American
const MODEL_ID = 'eleven_multilingual_v2';

const TARGETS = [
  {
    idx: 2,
    label: 'S2 — We Swerve',
    text: `We swerve on roadblocks. Navigating every obstacle. With creativity. With intention. With heart. We don't stop. We swerve. On the Go.`,
  },
  {
    idx: 3,
    label: 'S3 — 20+ Years',
    text: `Twenty years. Of real world experience. Not software. Not shortcuts. Not automation. Genuine care. Lived experience. A deep passion for helping people fulfill the purpose God placed inside them.`,
  },
];

async function generate({ idx, label, text }) {
  const outFile = path.join(OUT_DIR, `narration-${idx}.mp3`);

  console.log(`\n[${label}] Generating narration-${idx}.mp3 ...`);
  console.log(`   "${text.slice(0, 60)}..."`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key':   API_KEY,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      speed: 0.72,
      voice_settings: {
        stability:         0.22,
        similarity_boost:  0.92,
        style:             0.60,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error [${response.status}]: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outFile, buffer);
  console.log(`   ✓  Saved → public/audio/narration-${idx}.mp3  (${(buffer.length / 1024).toFixed(0)} KB)`);
}

(async () => {
  console.log('\n🎙  SWRV — Regenerating S2 + S3 narration audio');
  console.log('   Voice: ElevenLabs "Brian"  |  Speed: 0.72\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const target of TARGETS) {
    await generate(target);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n✅  Done! narration-2.mp3 and narration-3.mp3 replaced.');
  console.log('   Hard-refresh http://localhost:3002/brand-transmission.html to verify.\n');
})();
