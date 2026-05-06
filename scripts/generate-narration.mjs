/**
 * SWRV Brand Transmission — Narration Generator
 * Uses ElevenLabs "Daniel" voice: deep British cinematic narrator
 *
 * Run once:
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-narration.mjs
 *
 * Outputs 7 MP3 files to: public/audio/narration-0.mp3 … narration-6.mp3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'audio');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('\n❌  Missing ELEVENLABS_API_KEY\n   Run: ELEVENLABS_API_KEY=sk_... node scripts/generate-narration.mjs\n');
  process.exit(1);
}

// Brian — Deep, Resonant and Comforting — American (free tier premade)
const VOICE_ID = 'nPczCjzI2devNBz1zQrb';
const MODEL_ID = 'eleven_multilingual_v2';

// Exact narration text matching the scenes in brand-transmission.html
// Period-separated fragments produce natural pauses with TTS
const NARRATIONS = [
  // 0 — Everyone Is An Artist
  `The world has changed. Content creation is how the world speaks now. Whether you're a musician, a chef, a pastor, a dancer, a coach, a developer, an athlete, a stylist, a realtor, or a business owner — you are an artist. And every artist needs a brand ecosystem built entirely around their vision.`,

  // 1 — Most Agencies Get A Job Done
  `Complete the transaction. Close the ticket. Move on. Most agencies get a job done. But you are not a transaction to us.`,

  // 2 — More Than A Service
  `You need more than a service. You need a guide who swerves with you — around every obstacle, every roadblock, every unexpected detour. We don't just build brands. We build with you.`,

  // 3 — We Swerve On The Go
  `We swerve on roadblocks. Every obstacle — met with creativity, intention, and heart. We don't stop. We Swerve On The Go.`,

  // 4 — Full Capabilities
  `Photography, videography, original music, jingles, commercials, radio shows, podcasts, and vision and mission statements. One full-service branding ecosystem built entirely around you.`,

  // 5 — 20+ Years Doing Amazing Things
  `Not software. Not shortcuts. Not automation. Over twenty years of real work, real care, and real results. We've been doing amazing things for over two decades — because genuine care is the foundation everything else is built on.`,

  // 6 — Swerve On Roadblocks / Let Love GPS
  `We navigate every challenge with patience. With purpose. With love. Because when love leads — nothing can stop the mission.`,
];

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

async function generate(i, text) {
  const idx = i;
  const outFile = path.join(OUT_DIR, `narration-${idx}.mp3`);

  console.log(`\n[${i + 1}/7] Generating: narration-${idx}.mp3`);

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
      speed: 0.72,             // slowed down — deliberate, cinematic pacing
      voice_settings: {
        stability:         0.22,  // dramatic, expressive — not robotic
        similarity_boost:  0.92,  // stay true to Brian's deep natural timbre
        style:             0.60,  // maximum cinematic gravitas
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
  console.log('\n🎙  SWRV Brand Transmission — Narration Generator');
  console.log('   Voice: ElevenLabs "Brian" (deep resonant American narrator)');
  console.log('   Speed: 0.72 — slow, deliberate, cinematic\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let i = 0; i < NARRATIONS.length; i++) {
    await generate(i, NARRATIONS[i]);
    if (i < NARRATIONS.length - 1) await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✅  All 7 files generated in public/audio/');
  console.log('   Open http://localhost:3002/brand-transmission.html\n');
})();
