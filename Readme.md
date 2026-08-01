# Obsin

> A local-first web reader for your Obsidian vault — powered by GitHub, no subscription required.

Obsin lets you read, search, and lightly edit your Obsidian notes from any browser. Your notes stay in your GitHub repository. Obsin never touches a server of its own — it syncs directly to your browser's local storage.

---

## Why Obsin?

Obsidian is great on desktop, but reading notes on mobile or a shared machine usually means paying for Obsidian Sync or running your own server.

Obsin solves this without either:

| Problem | Obsin's answer |
|---|---|
| Notes only on one device | GitHub is the source of truth |
| Needs internet every time | IndexedDB stores everything locally |
| Slow to open a note | FlexSearch gives instant results |
| Obsidian Sync costs money | Free — you already have GitHub |
| Needs Obsidian installed | Runs in any modern browser |

---

## Core Principles

**GitHub is the source of truth.** Obsin reads your vault from a GitHub repository. GitHub handles storage, versioning, backup, and sync. Your notes never touch Obsin's infrastructure.

**The browser is the database.** On first open, Obsin syncs your vault into IndexedDB via Dexie. Every subsequent open is instant and works offline. Incremental sync only downloads what changed (by comparing file SHAs).

**Reading first.** The primary flow is: open → search → read → close — in seconds. Editing is supported but intentionally minimal (quick fixes only, not a replacement for Obsidian).

---

## Features

- **Full vault sync** — fetches all markdown files from a GitHub repository in batch
- **Offline access** — notes and assets cached locally, works without internet after first sync
- **Instant search** — full-text search across title, content, tags, and aliases via FlexSearch
- **Folder navigation** — collapsible tree mirroring your vault's folder structure
- **Obsidian markdown** — wiki-links, tags, embeds, frontmatter, callouts, and backlinks
- **Asset rendering** — images fetched from GitHub and cached in Cache Storage API
- **Incremental sync** — compares SHAs to only download new or changed files; deleted files are removed (no ghost notes)
- **Quick edit** — open a note, make a fix, save it back to GitHub via the Contents API
- **Themes** — Light, Dark, and Sepia reading modes
- **PWA** — installable, offline-first, behaves like a native app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Package manager | Bun |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Local DB | Dexie (IndexedDB) |
| Search | FlexSearch |
| Markdown | react-markdown + remark + rehype + gray-matter |
| Auth | GitHub OAuth via Cloudflare Worker |
| Hosting | Cloudflare Pages |
| Asset cache | Cache Storage API |

---

## Architecture

```
GitHub Repository
       │
       ▼
  Sync Engine          ← compares SHAs, batch-fetches changed files
       │
       ▼
   IndexedDB           ← notes, frontmatter, wikilink map, sync metadata
       │
  ┌────┼────────┐
  ▼    ▼        ▼
Notes Search WikiLinks
            │
            ▼
        Reader UI       ← markdown engine, folder tree, asset renderer
```

OAuth flow (for production):

```
GitHub OAuth
     ↓
Cloudflare Worker     ← exchanges OAuth code for access token only
     ↓
Access Token → Browser
```

---

## Data Models

```ts
interface Note {
  path: string;
  title: string;
  content: string;
  sha: string;
  tags: string[];
  aliases: string[];
}

interface SyncMeta {
  lastCommitSha: string;
  lastSyncTime: string;
}

interface WikiLinkMap {
  slug: string;   // lowercase, e.g. "docker"
  path: string;   // e.g. "Programming/Docker.md"
}
```

---

## Development Roadmap

| Phase | Goal | Status |
|---|---|---|
| 0 | Architecture validation — render one note from GitHub | 🔲 |
| 1 | Repository reader — connect to GitHub, fetch and store all notes | 🔲 |
| 2 | Local database layer — full offline-first architecture with Dexie | 🔲 |
| 3 | Folder navigation — collapsible tree from GitHub paths | 🔲 |
| 4 | Markdown engine — wiki-links, embeds, callouts, backlinks | 🔲 |
| 5 | Search engine — instant FlexSearch across full vault | 🔲 |
| 6 | Sync engine — incremental SHA-based sync, ghost note prevention | 🔲 |
| 7 | Reader experience — themes, typography, mobile-first layout | 🔲 |
| 8 | Asset system — images fetched from GitHub, cached locally | 🔲 |
| 9 | OAuth — one-click GitHub login via Cloudflare Worker | 🔲 |
| 10 | Micro edit — quick in-browser edits committed back to GitHub | 🔲 |
| 11 | PWA — installable, offline banner, storage persistence | 🔲 |

---

## Out of Scope (MVP)

The following are explicitly deferred and not part of the initial release:

- AI Chat / Copilot
- Graph View
- Dataview Engine
- Canvas Support
- Plugin Marketplace
- Collaboration / Multi-user editing
- Note sharing

---

## Success Criteria

A user should be able to:

1. Open Obsin in a browser
2. Search for a note (e.g. "docker")
3. Read it — with wiki-links, images, and callouts rendering correctly
4. Navigate offline after the initial sync
5. Click a wiki-link to jump to a related note
6. Fix a typo and sync the change back to GitHub

**Without** installing Obsidian and **without** paying for Obsidian Sync.

---

## License

MIT
