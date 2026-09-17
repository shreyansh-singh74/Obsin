# Brag Plan: Obsin

## What is this app?
Obsin is a local-first web reader for Obsidian vaults stored in GitHub — connect a repo, sync to the browser, then read, search, and follow wiki-links from anywhere, even offline.

## The angle
A clean 20-second product demo: show the actual job-to-be-done, not marketing fluff. Hook with the promise ("Your knowledge. Everywhere."), then walk entry → key action → result: Connect vault → GitHub syncs to browser → read/search/follow [[links]] offline. Every scene recreates real Obsin UI (landing hero, Safari mock with "Writing is telepathy", feature cards).

## Hook (first 2-3 seconds)
Full-screen: "Your knowledge. Everywhere." on Obsin black (#0b0b0b) with purple (#8A35F2) glow. Sub-line: "Your Obsidian. Now in every browser." No UI yet — just the promise, held long enough to read.

## Key moments (the middle)
- Connect a GitHub vault in one click — simulated "Connect Vault" button press, repo → browser arrow.
- Sync engine does the work — GitHub → IndexedDB progress, "Cached locally · Last sync: Just now", incremental SHA-diff note.
- Read like Obsidian — recreated 3-pane reader ("Writing is telepathy", folders, #evergreen, graph nodes), then [[Ideas]] → [[Telepathy]] → [[Projects]] wiki-links chaining, instant search typing "daily", offline badge.

## Outro / punchline
"Start reading your vault today." + Obsin wordmark + "Free and open source · Your notes stay in your repo." CTA: "Connect your vault — it's free."

## User flow worth showing
Connect GitHub vault (/auth → Connect Vault) → sync engine downloads only changed markdown, rebuilds wiki-maps/backlinks/search index → read/search/follow wiki-links/graph offline in /app. Entry → key action → result.

## Tone
- Preset: app-store
- Creative direction: clean product demo that teaches in 20 seconds
- Interpretation: Feature-card clarity, present-tense copy, smooth slides/wipes, restraint over hype; pacing comfortable with room to read each line.

## Format: landscape — 1920x1080
## Duration: 20 seconds

## Visual identity (from the project)
- Background: #0b0b0b (hero) / #111 (sections) / #1e1e1e (reader)
- Accent: #8A35F2 (CTA) / #A78BFA (links, soft) / #7C3AED (primitive)
- Text: #E5E7EB (headline) / #9CA3AF (sub) / #FFFFFF on accent
- Display font: Inter (600-700, tracking-tight) — Google Fonts in index.html
- Body font: Inter (400-500); Mono accents: JetBrains Mono; Serif accent: Newsreader (unused in video)
- Strongest visual element: the Safari browser mock at obsin.local/vault/daily-notes with 3-pane Obsidian preview (folders + "Writing is telepathy" note + graph) + 6 Core Feature cards

## Share copy (draft)
Introducing Obsin: your Obsidian vault in any browser. GitHub sync, offline reading, instant search, [[wiki-links]] and graph — free and open source.

## Audio direction
- Role: warm bed
- Music: happy-beats-business-moves-vol-1-by-ende-dot-app.mp3 (upbeat, clean, corporate-adjacent; best for app-store)
- Music treatment: start at 0.0s, volume 0.35, fade out last 1.5s; let final logo/CTA ring
- Music cue guidance: preset `.opencode/skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md` (~120.19 BPM, 0.5s grid from 3.02s). Strong cues in window: 16.02, 17.02, 17.52, 18.02, 18.52, 20.02, 21.01, 22.01, 23.02, 23.52. Plan 2 strong locks: Reveal/reader moment → 7.02s grid, Outro logo → ~17.02s (within ±0.15s). Sequential cards snap to consecutive beats ±0.10s (every other beat for readable text, ~1.0s apart).
- Audio-reactive treatment: subtle; music RMS breathes hero glow and card presence, title gets soft treble glow. No waveform/equalizer visuals.
- SFX posture: moderate; motion-matched, professional restraint (app-store: light layer per feature card at 0.65-0.75)
- Audio-coupled moments:
  - Hook title entrance — soft announcement swell
  - Connect button click — simulated cursor tap (ui/mouseclick1 or interface/click)
  - Sync progress 0→100% — gentle ticks, completion ding (chips-collide or impactBell soft)
  - 3 feature cards arriving one by one — card-slide/place sequence
  - Search typing "daily" — randomized keyboard ticks
  - Wiki-link chain [[Ideas]]→[[Telepathy]]→[[Projects]] — soft select/click per link
  - Outro logo — one deep bell (impactBell_heavy_000) over music fade
- Restraint rule: music never above 0.5; SFX never stack loudly; no glitch/error sounds; silence is not the joke — keep the bed throughout

## Storyboard

### Scene 1 — Hook — 3s
Full-bleed #0b0b0b with subtle dot-grid + purple glow. "Your knowledge. Everywhere." (Inter 700, #E5E7EB) slams in fast, holds. Sub: "Your Obsidian. Now in every browser." (#9CA3AF) fades up. Small pill: "Obsin — Obsidian Client".
Sequential/interaction: none (title + sub staggered 0.4s apart)
Audio intent: warm bed establishes, soft announcement swell under title
Audio-coupled idea: title entrance with soft bell accent; no typing
Music: upbeat clean bed vol-1
Transition mood: clean slide → Scene 2

### Scene 2 — Connect — 4s
Recreated /auth moment: "Connect Vault" white pill button + GitHub icon, cursor clicks it. Arrow: GitHub repo → Browser. Text: "Connect your GitHub vault" / "Public or private repos. PAT supported."
Sequential/interaction: yes — cursor moves, clicks Connect Vault button at ~1s, repo chip → arrow → browser chip light up in sequence
Audio intent: inviting, click payoff
Audio-coupled idea: simulated cursor tap (mouseclick), switch/select for repo→browser chain
Music: bed continues
Transition mood: smooth wipe → Scene 3

### Scene 3 — Sync + Offline — 4s
Sync engine at work: progress bar 0→100% in ~1.2s, "Cached locally · Last sync: Just now" green dot badge pops. Small mono line: "SHA-diff · only changed files". Text: "Syncs to your browser" / "Offline-first. Reopens instantly."
Sequential/interaction: yes — progress fills, then badge pops, then 3 mini chips (GitHub → Vault → Browser) arrive one by one
Audio intent: build + satisfying completion
Audio-coupled idea: counter ticks on progress, success ding when badge lands; card-place sounds for chip sequence
Music: bed; beat-grid window 7.02–9.02 for chip sequence
Transition mood: clean wipe → Scene 4

### Scene 4 — Read / Search / Links — 5s
Centerpiece: recreated Obsin reader. Left: folder list (Daily, Ideas, Projects). Center: "Writing is telepathy" note with #evergreen tag + quote. Right: graph nodes. Then overlay: search box types "daily" → 4 results; [[Ideas]] → [[Telepathy]] → [[Projects]] chain lights up.
Sequential/interaction: yes — folders settle, search types character by character, results pop one by one, wiki-links highlight in order
Audio intent: the "aha" — product feels alive
Audio-coupled idea: keyboard ticks for typing, drop/click per result, select sounds per wiki-link
Music: bed continues; hold full set on screen after reveals for readability
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro CTA — 4s
"Start reading your vault today." + Obsin wordmark + buttons: "Get Started — It's Free" (purple #8A35F2) + "View on GitHub". Microcopy: "Free and open source · Your notes stay in your repo."
Sequential/interaction: none — full lockup holds
Audio intent: resolve; music fades last 1.5s, final soft bell rings over fade
Audio-coupled idea: final logo bell only
Music: fade out; beat-locked near 17.02s strong cue (±0.15s)
Transition mood: hold, cut to black

**Music mood for this video:** upbeat
**Audio summary:** Warm corporate bed throughout with motion-matched clicks, card, typing, and one completion ding, resolving in a soft logo bell over the fade.
