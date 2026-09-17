# Hyperframes Composition Brief: Obsin

## Objective
Create a short launch-style brag video for Obsin — a clean product demo a new user can understand and act on.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `/home/shreyansh/coding/Dev/Projects/Obsin`
- Primary files read: `index.html`, `README.md`, `package.json`, `src/App.tsx`, `src/landing/LandingPage.tsx`, `src/styles/tokens.css`, `src/styles/themes.css`
- Product name: Obsin
- Tagline / strongest claim: "Your knowledge. Everywhere." / "Your Obsidian. Now in every browser."
- Key UI or visual moment to recreate: Safari mock at obsin.local/vault/daily-notes — 3-pane Obsidian-style reader ("Writing is telepathy" note with #evergreen, folder list, graph nodes) + Core Features cards + "Connect Vault" button + "Cached locally · Last sync: Just now" badge
- Copy that must appear verbatim:
  - "Your knowledge. Everywhere."
  - "Your Obsidian. Now in every browser."
  - "Start reading your vault today."
  - "Free and open source · Your notes stay in your repo."

## Creative Direction
- Tone preset: app-store
- Creative direction: clean product demo that teaches in 20 seconds
- Interpretation: Feature-card clarity, present-tense copy, smooth slides/wipes, restraint over hype; comfortable pacing with room to read each line.
- Angle: Show the job-to-be-done: Connect vault → GitHub syncs to browser → read/search/follow [[links]] offline. Recreate real Obsin UI, not abstract graphics.
- Hook: Full-screen "Your knowledge. Everywhere." on #0b0b0b with purple glow (first 2-3s).
- Outro / punchline: "Start reading your vault today." + Obsin wordmark + CTA buttons.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: #0b0b0b (hero) / #111 sections / #1e1e1e reader
- Text: #E5E7EB headline / #9CA3AF sub / #FFFFFF on accent
- Accent: #8A35F2 CTA / #A78BFA links / #7C3AED primitive
- Display font: Inter 600-700 tight (system fallback ok; do NOT remote-load Google Fonts at render — use local system stack to keep `check` clean)
- Body font: Inter 400-500; mono accents: ui-monospace/JetBrains Mono fallback
- Visual references from the project: dot-grid overlay, Safari browser chrome with obsin.local/vault/daily-notes URL, folder rows, #evergreen pill, wiki-link purple text, graph SVG nodes, green "Cached locally" badge, purple CTA buttons

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 3s — "Your knowledge. Everywhere." + sub, purple glow on black
2. Connect — 4s — cursor clicks "Connect Vault", GitHub repo → Browser chips light in sequence
3. Sync + Offline — 4s — progress 0→100%, "Cached locally" badge, GitHub → Vault → Browser chips
4. Read / Search / Links — 5s — 3-pane reader, search types "daily", [[Ideas]]→[[Telepathy]]→[[Projects]] chain
5. Outro CTA — 4s — "Start reading your vault today." + wordmark + CTAs (beat-locked near 17.02s cue)

## Audio
- Audio role: warm bed
- Audio arc: bed establishes under hook, clicks/ticks carry the middle, completion ding at sync, soft bell over fade at outro
- Music: happy-beats-business-moves-vol-1-by-ende-dot-app.mp3
- Music treatment: start 0.0s, volume 0.35, fade out last 1.5s; let final SFX ring
- Music cue guidance: preset `.opencode/skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md` (~120.19 BPM, 0.5s grid from 3.02s). 2 strong locks max: outro logo near 17.02s (±0.15s); chip/result sequences snap to consecutive beats ±0.10s, every other beat for readable text (~1.0s apart).
- Audio-reactive treatment: subtle; music RMS breathes hero glow + card presence. No waveform/equalizer visuals.
- Audio-coupled moments:
  - Hook title entrance — soft announcement accent
  - Connect button click — simulated cursor tap
  - Sync progress + badge — ticks + completion ding
  - Chip/card sequences — card-slide/place, one per item
  - Search typing — randomized keyboard ticks
  - Wiki-link chain — select/click per link
  - Outro logo — single deep bell over music fade
- SFX selection guidance: motion-matched, app-store restraint at 0.65-0.75; card gestures use card sounds, taps use click/mouseclick, reveals use drop/impactSoft_medium, payoff uses impactBell_heavy_000 once
- SFX analysis guidance: `.opencode/skills/brag/assets/sfx/sfx-analysis.md` + .json; prefer low/medium high-frequency-risk for repeated typing/card moments
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
