# 🎙 Voice Fix — Read this first

## ⚠️ URGENT — Rotate your ElevenLabs API key

Your ElevenLabs API key was hardcoded in plain text inside `scripts/audition-voices.mjs`:

```
const API = 'sk_7a18bc9ad62fba27d2e7e7be12869ecabc97e242014d943e';
```

**If your repo is public on GitHub, this key has almost certainly been scraped.** Bots crawl GitHub continuously looking for exposed API keys. Anyone who has it can rack up charges on your account or use your voice quota.

**Do this first:**

1. Log into [elevenlabs.io](https://elevenlabs.io) → your profile → API Keys
2. **Revoke / delete** the key `sk_7a18bc9ad62...`
3. Generate a **new** key
4. Use the new key only via the `ELEVENLABS_API_KEY` environment variable — never paste it into a file

I've already removed the hardcoded key from `audition-voices.mjs` and replaced it with the env-var pattern that the other scripts already use.

---

## Why the voice keeps changing

The "Brand Transmission" 7-scene narrated video was set up to play pre-generated **ElevenLabs "Brian"** voice MP3s (deep, resonant, American narrator — exactly the trailer-voice you want). You'd already auditioned three voices (Brian / Adam / Bill) and chosen Brian — that's the right pick for the cinematic depth you described.

But the MP3s have **never been generated**. There's no `public/audio/` folder. So `brand-transmission.html` was always falling back to the **browser's built-in text-to-speech**, which is why every device sounds different:

- macOS hears "Daniel" or "Alex"
- iOS hears Siri's voice
- Windows hears "Microsoft David"
- Android hears Google's voice
- And none of them sound like a movie trailer narrator

Worse, the previous code on line 455 of `brand-transmission.html` had this comment baked in:

> *"Cloudinary audio assets are not available for these previews, so use browser speech synthesis instead."*

So even if you generated the MP3s, **the playback code wasn't even trying to use them**. Pure TTS, every time, on every device.

---

## What I fixed

**`public/brand-transmission.html`** — rewrote the `speak()` function so it:
1. **Tries the MP3 first** (`/audio/narration-${sceneIdx}.mp3`)
2. **Probes once on page load** — if `narration-0.mp3` 404s, it knows MP3s aren't ready and skips straight to TTS without spamming attempts
3. **Falls back to TTS gracefully** if any MP3 fails to load
4. **Improved the TTS fallback** — better voice priority list (now includes Microsoft Natural neural voices for Windows / Edge users, premium macOS voices, etc.) and lower pitch (0.35 instead of 0.45) for deeper sound across all devices

Until the MP3s are generated, you'll still hear browser TTS — but it'll be the deepest version each platform can produce. Once the MP3s exist, every visitor on every device hears the same Brian voice. That's the real fix.

---

## ✅ Generate the MP3s — pick one method

After rotating your API key, you have two clean ways to give it to the script. Both keep the key out of any committed file.

### Method A — `.env` file (recommended, set up once)

This is the right answer for repeat use. The `.env` file is gitignored, so the key never enters version control.

1. In the project root, copy the template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in any editor and paste your key:
   ```
   ELEVENLABS_API_KEY=sk_paste_your_new_key_here
   ```
3. Save. Then run the generator:
   ```bash
   node --env-file=.env scripts/generate-narration.mjs
   ```

The `--env-file=.env` flag is built into Node 20.6+ (no extra packages needed). Node reads the file, sets the env vars, runs your script, and exits — the key is never written anywhere else.

### Method B — One-shot inline (if you'd rather not save the key in a file at all)

Type the key directly on the command line:

```bash
ELEVENLABS_API_KEY=sk_paste_your_new_key_here node scripts/generate-narration.mjs
```

Caveat: this puts the key into your shell history (e.g. `~/.zsh_history` on Mac, `~/.bash_history` on Linux). If you use this method and want zero trace, clear that line afterward:

```bash
history -d $(history | grep ELEVENLABS_API_KEY | tail -1 | awk '{print $1}')
```

For Windows PowerShell:
```powershell
$env:ELEVENLABS_API_KEY="sk_paste_your_new_key_here"; node scripts/generate-narration.mjs
```

### Either way, ~30 seconds later you have 7 MP3s

```bash
ls public/audio/
# → narration-0.mp3 narration-1.mp3 ... narration-6.mp3
```

Total cost: ~1,800 characters from your monthly quota. ElevenLabs free tier is 10,000/month, so you have headroom to regenerate ~5 times.

### Commit them so production serves them

```bash
git add public/audio/
git commit -m "Generate Brian-voice narration MP3s for brand transmission"
git push
```

**Note:** I just fixed two bugs in your `.gitignore` that would have bitten you here:
- `.env` was **not** being ignored (so a key in `.env` would have committed)
- `public/audio/*` was being **fully ignored** (so the MP3s would have been skipped by `git add` and never reached production)

Both fixed in the version below. Now `.env` is ignored, but the production narration MP3s commit normally. Scratch files (`test-*.mp3`, `_bak/`, `_swap/`) stay ignored.

---

## Voice settings (already dialed in for trailer gravitas)

You don't need to touch these, but for reference — your `generate-narration.mjs` already has the cinematic voice settings locked:

| Setting | Value | Why |
|---------|-------|-----|
| Voice | **Brian** (`6F5Zhi321D3Oq7v1oNT4`) | Deep cinematic trailer voice, saved in your *SWRV OTG SITE* collection |
| Model | `eleven_multilingual_v2` | Higher quality than v1 |
| Speed | `0.72` | Slow, deliberate, weighted pacing |
| Stability | `0.22` | Low = expressive, dramatic — not robotic |
| Similarity boost | `0.92` | Stays true to Brian's natural deep timbre |
| Style | `0.60` | Maximum cinematic gravitas |
| Speaker boost | `true` | Punchier, more present |

Brian is already saved in your **SWRV OTG SITE** ElevenLabs collection, so your API key can call him directly — no extra dashboard step needed.

---

## If you want to try a different voice

Brian's the right pick for "deep narrator." But if you want to A/B test against alternatives, the audition script is set up for it. Edit `scripts/audition-voices.mjs` and add candidates from [ElevenLabs voice library](https://elevenlabs.io/app/voice-library):

```js
const CANDIDATES = [
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian-deep', desc: 'Brian — current pick' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam-deep',  desc: 'Adam  — deep American' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill-deep',  desc: 'Bill  — strong gentle American' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',     desc: 'George — deep British' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris',      desc: 'Chris — deep resonant' },
];
```

Run it: `ELEVENLABS_API_KEY=sk_xxx node scripts/audition-voices.mjs`. Listen to the test files in `public/audio/test-*.mp3`. If you want to switch, change the `VOICE_ID` constant in `generate-narration.mjs`, `regen-s2-s3.mjs`, and `regen-s8.mjs` to your pick, then regenerate.

---

## TL;DR

1. **Rotate your ElevenLabs API key NOW** (the old one is exposed)
2. `cp .env.example .env`, then paste new key into `.env`
3. `node --env-file=.env scripts/generate-narration.mjs`
4. `git add public/audio/ && git commit && git push`
5. Done. Brian's voice plays on every device.
