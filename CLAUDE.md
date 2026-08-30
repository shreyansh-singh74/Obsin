# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (`bun.lock` is authoritative; a `package-lock.json` also exists but prefer Bun).

- `bun install` — install dependencies
- `bun run dev` — Vite dev server on port 3000, host exposed to LAN (`host: true`)
- `bun run build` — type-checks (`tsc`) then builds (`vite build`)
- `bun run typecheck` — `tsc --noEmit`
- `bun run preview` — serve the production build

There is **no test runner and no ESLint config**. `bun run typecheck` (or `bun run build`) is the only correctness gate — run it after changes. TypeScript is strict, including `noUnusedLocals`/`noUnusedParameters`, so unused symbols fail the build.

## Big Picture

Obsin is a **local-first, read-first web reader for an Obsidian vault stored in a GitHub repo**. GitHub is the source of truth; the browser's IndexedDB is the working database. There is no backend of its own beyond thin serverless auth proxies.

Core data flow:

```
GitHub REST API → sync engine → IndexedDB (Dexie) → Zustand stores → React UI
                                      │
                                      └→ FlexSearch index (in-memory, rebuilt from IndexedDB)
```

Routes (`src/App.tsx`): `/` landing, `/auth`, `/app` (gated by `ProtectedRoute` on the auth token). Path alias `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### The sync engine is the heart of the app

`src/engine/sync/index.ts` (`executeVaultSync`) orchestrates everything and drives `useSyncStore` through named stages:

1. Fetch the recursive git tree; auto-discover the default branch if the configured one fails (`engine/github/tree.ts`).
2. **SHA-diff** remote blobs against local notes in IndexedDB — only changed/new files are downloaded.
3. **Ghost-note prevention**: local notes whose path is absent from the remote tree are deleted.
4. Batch-download changed markdown with bounded concurrency (`engine/github/batch.ts`), parsing frontmatter + headings per file.
5. Rebuild the wiki-link map and precomputed backlink table in IndexedDB.
6. Rebuild the in-memory FlexSearch index.
7. Write `syncMeta`.

`AppShell` triggers this automatically whenever the active vault (or token) changes.

### Layers

- **`src/engine/github/`** — GitHub REST client. `api.ts` is the base `fetch` wrapper (bearer auth, rate-limit header parsing, typed `GitHubApiError`); everything else builds on it. **`contents.ts` is read-only** — see "Not yet implemented" below.
- **`src/engine/markdown/`** — custom remark plugins: `remarkWikiLinks` turns `[[Note#heading|alias]]` into `<span class="wikilink-item" data-*>` nodes; `remarkCallouts` turns Obsidian callouts into `<div class="obsidian-callout">`. `components/reader/MarkdownRenderer.tsx` wires these together with `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-slug`, and maps the emitted nodes to the `WikiLink`/`Callout` React components.
- **`src/engine/search/`** — one FlexSearch `Document` index per vault, held in a `Map`, **in-memory only** (never persisted). Must be rebuilt on load/sync.
- **`src/db/`** — `index.ts` defines the Dexie schema (`ObsinDB`); `repository/*` are the only modules that touch tables. **Every table uses a composite key prefixed with `vaultId`** (`[vaultId+path]`, `[vaultId+slug]`, …) so multiple vaults stay isolated in one database.
- **`src/store/`** — Zustand stores: `useAuthStore` (token + GitHub user, persisted to `localStorage`), `useVaultStore` (active vault, loaded notes, active note path), `useSyncStore` (sync stage/progress/errors).
- **`src/utils/`** — `markdown.ts` parses frontmatter with **`js-yaml`** + a regex (not `gray-matter`); `slug.ts` normalizes wiki-link targets and paths to lowercase slugs used as map/backlink keys.

Notes store **body markdown only** — frontmatter is stripped at parse time and its `tags`/`aliases`/`title` promoted onto the `Note` record. Wiki-links and backlinks resolve through the slug tables (`wikiMapRepo` slug→path, `backlinksRepo` targetSlug→sources) for O(1) lookup rather than scanning content at render time.

### Auth (`api/` — Vercel serverless functions)

Files under `api/` export `default { async fetch(request): Response }` (Web-standard handler). The browser never sees the client secret — only the resulting access token, which is stored in `localStorage` (`obsin_gh_token`). Three mechanisms coexist:

1. **OAuth web flow with PKCE** — `api/auth/login.ts` builds the authorize URL and sets `state`/`verifier`/`nonce` HttpOnly cookies → GitHub → `api/auth/callback.ts` verifies state, exchanges `code` + `code_verifier`, and stashes the token in a **one-time HttpOnly handoff cookie** (never in the redirect URL) → the `/auth` page calls `api/auth/token.ts` to read-and-clear it.
2. **Device flow** — `engine/github/deviceAuth.ts` on the client. In **dev** it hits GitHub through the Vite proxy (`/github-oauth/*`, see `vite.config.ts`); in **prod** through the CORS proxies `api/github/device-code.ts` and `api/github/access-token.ts`.
3. **PAT** — users can paste a Personal Access Token directly (needed for private repos and higher rate limits).

## Conventions & Gotchas

- **Env vars**: only `VITE_`-prefixed vars reach the browser bundle (`envPrefix` in `vite.config.ts`). `GITHUB_CLIENT_SECRET` must **never** be `VITE_`-prefixed. `VITE_GITHUB_CLIENT_ID` is required for auth to work; server functions accept `GITHUB_CLIENT_ID` as a fallback. See `.env.example`.
- **Dev auth depends on the Vite proxy**; prod auth depends on the Vercel `api/` functions. A change to one usually needs the mirror change in the other.
- Deployment target is **Vercel** (`vercel.json` — SPA rewrite to `index.html`, strict CSP that only allows `connect-src https://api.github.com`, and `no-store` on `/api/*`).
- When adding markdown syntax, the plugin (remark, in `engine/markdown/`) and the React renderer mapping (in `MarkdownRenderer.tsx`) must be updated together.

## Documentation Notes

`README.md` is the canonical public documentation. `Readme.md` is intentionally just a pointer to avoid duplicate README content drifting out of date.

## Not Yet Implemented

GitHub write-back / quick edit support does not exist yet — `engine/github/contents.ts` only reads. Implementing it means a new Contents-API `PUT` (base64-encode body, pass the current blob SHA) plus UI.
