import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio');
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) { console.error('Missing ELEVENLABS_API_KEY'); process.exit(1); }

const text = 'Swerve On the Go — a full-service branding ecosystem built entirely around you. We want the experience of building with you, the pleasure of serving you, and the joy of swerving in our gifts every step of the way.';

console.log('Regenerating narration-8.mp3 ...');
const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb`, {
  method: 'POST',
  headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
  body: JSON.stringify({
    text,
    model_id: 'eleven_multilingual_v2',
    speed: 0.72,
    voice_settings: { stability: 0.22, similarity_boost: 0.92, style: 0.60, use_speaker_boost: true }
  })
});
if (!res.ok) { console.error('API error', res.status, await res.text()); process.exit(1); }
const buf = Buffer.from(await res.arrayBuffer());
fs.writeFileSync(path.join(OUT_DIR, 'narration-8.mp3'), buf);
console.log(`✓  narration-8.mp3  (${Math.round(buf.length / 1024)} KB)`);
