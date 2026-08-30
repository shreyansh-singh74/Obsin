# Obsin

**Your Obsidian vault, accessible from any browser.**

Obsin is a local-first web reader for Obsidian vaults powered by GitHub. It connects to your GitHub-hosted vault, syncs notes to IndexedDB, and gives you a native-feeling reading experience with full markdown support — offline.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Features

- **GitHub Sync** — Connect any public or private GitHub repo as a vault. Incremental SHA-based sync keeps things fast.
- **Offline First** — Notes are cached in IndexedDB via Dexie. Read anywhere, even without connectivity.
- **Full Markdown** — GFM, math (KaTeX), callouts, task lists, and code syntax highlighting.
- **Wiki Links** — `[[Obsidian-style wiki links]]` work out of the box with backlink tracking.
- **Instant Search** — Full-text search powered by FlexSearch across titles, content, tags, and headings.
- **Graph View** — Interactive force-directed graph (D3) visualizes connections between notes.
- **Table of Contents** — Auto-extracted heading navigation with scroll tracking.
- **Reading History** — Back/forward navigation through your reading path.
- **Tag Browser** — Browse and filter notes by `#tags`.
- **Favorites** — Star notes for quick access.
- **Responsive** — Works on mobile with bottom-sheet navigation and touch-optimized targets.
- **Dark/Light/Sepia Themes** — CSS custom properties with design tokens.
- **PWA** — Installable as a Progressive Web App with service worker caching.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Routing | React Router DOM v7 |
| State | Zustand |
| Database | Dexie (IndexedDB) |
| Search | FlexSearch |
| Markdown | react-markdown + remark/rehype plugins |
| Math | KaTeX |
| Graph | D3 force-directed layout |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Build | Vite |
| Testing | Vitest + React Testing Library |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
git clone https://github.com/shreyansh-singh74/Obsin.git
cd Obsin
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
```

### Build

```bash
npm run build
npm run preview     # Preview production build
```

## Architecture

```
src/
├── components/         # React UI components
│   ├── app/           # AppShell (root layout)
│   ├── auth/          # Authentication modal
│   ├── graph/         # D3 graph view
│   ├── layout/        # Sidebar, header, reading canvas
│   ├── reader/        # Markdown renderer, TOC, wiki links
│   ├── search/        # Search modal, tag browser
│   ├── sync/          # Sync status, offline banner
│   ├── tree/          # Folder tree navigation
│   └── ui/            # Shared UI primitives
├── db/                # Dexie database + repositories
│   └── repository/    # Data access layer (vaults, notes, backlinks, wiki map)
├── engine/            # Core logic
│   ├── cache/         # Cache Storage API for images
│   ├── github/        # GitHub API, auth, device flow, image resolver
│   ├── markdown/      # Custom remark plugins (wiki links, callouts, images)
│   ├── recovery/      # Resiliency utilities
│   └── search/        # FlexSearch engine
├── landing/           # Marketing landing page
├── store/             # Zustand stores (auth, vault, sync)
├── styles/            # CSS: tokens, themes, typography, animations
├── types/             # TypeScript interfaces
└── utils/             # Helpers (slug, tree, markdown)
```

## Key SDE Techniques

This project demonstrates several software engineering patterns:

| Technique | Implementation |
|-----------|---------------|
| OAuth 2.0 + PKCE + Device Flow | GitHub authentication with popup-based token handoff |
| SHA-based incremental sync | Only fetch changed blobs since last known commit |
| IndexedDB with composite keys | Dexie transactions for vaults, notes, backlinks, wiki maps |
| Full-text search indexing | FlexSearch Document index across multiple fields |
| Custom remark/rehype AST plugins | Wiki link parsing, callout blocks, image path resolution |
| Service Worker + Cache API | PWA offline support with cache-first strategy |
| React Error Boundaries | Graceful crash recovery with retry |
| D3 force-directed graph | Interactive note connection visualization |
| Content Security Policy | Hardened CSP headers in vercel.json |
| Design token system | CSS custom properties with multi-theme support |
| Test-Driven Development | Vitest + RTL for utilities and search engine |
| URL-based state sync | Hash routing for shareable note URLs |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © 2026 Obsin
