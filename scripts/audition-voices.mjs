import fs from 'fs';

const API  = 'sk_7a18bc9ad62fba27d2e7e7be12869ecabc97e242014d943e';
const TEXT = 'Every journey. Has roadblocks. They come for everyone. No matter how prepared. No matter how talented. No matter how driven you are. No exceptions.';

const CANDIDATES = [
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian-deep', desc: 'Brian — max depth + slowed' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam-deep',  desc: 'Adam  — max depth + slowed' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill-deep',  desc: 'Bill  — max depth + slowed' },
];

async function test(v) {
  console.log(`Generating ${v.name}...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': API, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: TEXT,
      model_id: 'eleven_multilingual_v2',
      speed: 0.78,               // slow, weighted trailer pacing
      voice_settings: {
        stability:         0.22,  // low = dramatic, expressive, not monotone
        similarity_boost:  0.92,  // stay true to the voice's natural deep timbre
        style:             0.60,  // high = cinematic gravitas & emotional weight
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) { console.log(`  FAIL [${res.status}]: ${(await res.text()).slice(0,200)}`); return; }
  const buf = Buffer.from(await res.arrayBuffer());
  const file = `public/audio/test-${v.name.toLowerCase()}.mp3`;
  fs.writeFileSync(file, buf);
  console.log(`  ✓  ${v.name}: ${v.desc}`);
  console.log(`     http://localhost:3002/audio/test-${v.name.toLowerCase()}.mp3`);
}

for (const v of CANDIDATES) {
  await test(v);
}
console.log('\nAudition links above — pick your favorite and I\'ll regenerate all 9 scenes.');
