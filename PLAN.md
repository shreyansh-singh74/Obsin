# PocketVault — Build Plan

> Execution-ready plan derived from the [Readme](./Readme.md) and the architecture research.
> Work phase-by-phase. Each phase has: **Goal · Tasks · Files · Key decisions · Definition of Done · Risks**.
> Do not start a phase until the previous phase's DoD is met. A phase is "done" when its DoD passes and tests are green.

---

## 0. How to use this plan

- **Sequencing is intentional.** Phases 0–2 de-risk the architecture. Phases 3–7 build the real product. Phases 8–11 polish to shippable.
- **Each phase ends in a demonstrable state** that you can run and verify locally.
- **PAT (Personal Access Token) auth is used through Phase 8.** OAuth (Phase 9) replaces it. Don't build auth early — it's a distraction until the reading experience exists.
- **Decisions Log** lives at the bottom of this file. When you make/revise a call, update it.
- Status legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## 1. Tech Stack (locked)

| Layer | Choice | Rationale / notes |
|---|---|---|
| Language | **TypeScript** (strict) | Non-negotiable for a data-heavy app. |
| Runtime / pkg mgr | **Bun** | Fast installs & dev server. Lockfile committed. |
| Build / dev | **Vite** | SPA + PWA + fast HMR. |
| Framework | **React 18** | Component ecosystem (markdown). |
| Styling | **Tailwind CSS** | Utility-first, theme tokens map to Light/Dark/Sepia. |
| UI kit | **shadcn/ui** (Radix + Tailwind) | Copy-in components; no heavy dep. |
| State | **Zustand** | Small, ergonomic, no boilerplate. |
| Local DB | **Dexie** (IndexedDB) | Typed tables, indexes, reactive queries. |
| Search | **FlexSearch** | In-memory full-text, fast prefix matching. |
| Markdown | **react-markdown + remark-gfm + remark-math + rehype-raw + rehype-katex + gray-matter** | remark/rehype pipeline gives Obsidian compat via custom plugins. |
| Wiki/callout plugins | **Custom remark/rehype plugins** | Obsidian syntax isn't standard; we write small plugins. |
| GitHub API | **GraphQL** (tree/batch content) + **REST** (raw assets, contents PUT) | See §5 — batch by SHA to beat rate limits. |
| Auth | **GitHub OAuth → Cloudflare Worker** | Worker only exchanges code for token; secret never ships to browser. |
| Hosting | **Cloudflare Pages** | Free, global, git-integrated; Worker deployed alongside. |
| Asset cache | **Cache Storage API** | Keyed by SHA for automatic invalidation. |
| PWA | **vite-plugin-pwa (Workbox)** | Precache shell, manifest, install prompt. |
| Tests | **Vitest + React Testing Library + MSW** | Unit + component + API mocking. Optional E2E: Playwright. |
| Lint / fmt | **ESLint + Prettier** | Committed config. |
| CI / CD | **GitHub Actions → Cloudflare Pages (wrangler)** | lint, typecheck, test, build, deploy on `main`. |

---

## 2. Repository & Directory Structure

Single repo. App lives in `src/`; the OAuth proxy in `worker/`. Shared types in `src/types`.

```
PocketVault/
├─ src/
│  ├─ main.tsx                     # app entry
│  ├─ App.tsx                      # router + layout
│  ├─ pages/                       # route-level screens
│  │  ├─ StartPage.tsx             # connect repo (PAT, Phase 0–8) → OAuth (Phase 9)
│  │  ├─ ReaderPage.tsx            # main 3-pane reading UI
│  │  └─ SettingsPage.tsx
│  ├─ components/
│  │  ├─ folder-tree/              # Phase 3
│  │  ├─ markdown/                 # Phase 4 (renderers for wikilinks, embeds, callouts…)
│  │  ├─ search/                   # Phase 5
│  │  ├─ sync/                     # progress UI, last-sync badge, offline banner
│  │  └─ ui/                       # shadcn primitives
│  ├─ lib/
│  │  ├─ github/                   # api.ts, graphql.ts, contents.ts, rate-limit.ts
│  │  ├─ db/                       # dexie schema, migrations, repositories
│  │  ├─ sync/                     # engine: initial + incremental + diff
│  │  ├─ search/                   # flexsearch index build/serialize
│  │  ├─ markdown/                 # remark/rehype plugins (wikilink, embed, callout, tags)
│  │  ├─ slug/                     # slug + wikilink resolution
│  │  └─ asset-cache/              # Cache Storage wrapper
│  ├─ store/                       # zustand stores (auth, vault, ui, theme)
│  ├─ types/                       # shared TS types (Note, SyncMeta, WikiLinkMap, …)
│  ├─ hooks/
│  └─ styles/                      # tailwind config tokens, prose styles
├─ worker/                         # Cloudflare Worker (OAuth code→token exchange)
│  └─ index.ts
├─ public/                         # manifest, icons, offline fallback
├─ tests/                          # unit + component + msw handlers
├─ .env.example                    # VITE_GITHUB_TOKEN (dev PAT), OAuth client id, etc.
├─ vite.config.ts                  # pwa plugin, aliases
├─ tailwind.config.ts
├─ tsconfig.json
├─ bun.lockb
└─ package.json
```

---

## 3. Cross-Cutting Engineering Standards

**Code style**
- TS `strict`. No `any` without an inline justification comment.
- Feature folders group related code. Cross-feature imports go through `lib/` (no component→component deep coupling).
- All GitHub API calls go through `lib/github/*` — never call `fetch` to `api.github.com` from components.

**Error handling**
- Three error classes: `GitHubError` (API/network), `SyncError`, `ConflictError` (409 on edit).
- Surface user-facing errors via a toast (shadcn `sonner`). Never crash the app on a single note failure during sync — log, mark note as failed, continue.

**Rate limiting**
- Central `rate-limit.ts` reads `X-RateLimit-Remaining` / `Retry-After`. When near the limit, pause sync with a visible countdown; resume on reset. Batch content via GraphQL to minimize request count (see §5).

**Performance budgets (do not regress without noting it)**
- Cold app shell load (precache): **< 2s** to interactive.
- Open cached note from IndexedDB: **< 100ms**.
- Search query (10k notes): **< 50ms** to first result.
- Incremental sync, small vault: **< 3s** when nothing changed.

**Environment / config**
- `.env` for dev: `VITE_GITHUB_TOKEN` (PAT, dev only), `VITE_OAUTH_CLIENT_ID`.
- Secrets (OAuth client secret) live **only** in Worker via `wrangler secret`.
- `config.ts` validates and freezes env at startup.

---

## 4. Data Layer (Dexie schema) — foundational, locked here

Tables and indexes. This schema is referenced by Phases 1–6.

```ts
// src/types
interface Note {
  path: string;            // PK: "Programming/Docker.md"
  title: string;           // derived: basename minus ".md", or frontmatter title
  content: string;         // raw markdown (frontmatter stripped)
  sha: string;             // GitHub blob SHA — drives incremental sync
  tags: string[];          // from frontmatter + inline #tags
  aliases: string[];       // from frontmatter
  folder: string;          // parent dir: "Programming" (drives tree)
  frontmatter: Record<string, unknown> | null;
  outgoingLinks: string[]; // resolved target paths (drives backlinks via index)
  outgoingAssets: string[];// asset paths referenced
  size: number;
  syncedAt: number;        // epoch ms
}

interface SyncMeta {
  repoKey: string;         // PK: `${owner}/${repo}:${branch}`
  lastCommitSha: string;
  lastSyncTime: number;
  status: 'idle' | 'syncing' | 'error' | 'partial';
  error?: string;
}

interface WikiLinkEntry {
  slug: string;            // PK: lowercased key
  paths: string[];         // all notes matching this slug (disambiguation)
}
```

Dexie indexes:

```ts
db.version(1).stores({
  notes:      'path, sha, folder, *tags, *aliases, *outgoingLinks, title, syncedAt',
  syncMeta:   'repoKey',
  wikilinks:  'slug, *paths',
  settings:   'key',
});
```

> **Backlinks for free:** `*outgoingLinks` multiEntry index lets us query
> `db.notes.where('outgoingLinks').equals(currentPath)` → all notes linking *into* the current note. No separate backlink table.

> **Folder tree is derived**, not stored: build at runtime from `path.split('/')`. For very large vaults, memoize and recompute only when `syncMeta` changes.

---

## 5. GitHub API Strategy (critical efficiency decision)

**Three API patterns, by use:**

1. **Tree snapshot — REST, single call.**
   `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
   Returns every entry with `{ path, sha, type, size }`. Filter `type==='blob' && path.endsWith('.md')` for notes; non-md for assets (Phase 8).
   Handle `truncated: true` (very large repos) by falling back to per-directory GraphQL fetch — note in a decision when/if we hit it.

2. **Batch content — GraphQL, by SHA.**
   Fetch many blobs in one request using the `objects(oid: [...])` / `repository.commit.tree` shape:
   ```graphql
   query($owner:String!,$repo:String!,$oids:[GitObjectID!]!){
     repository(owner:$owner,name:$repo){
       objects(oid:$oids){
         ... on Blob { oid text isBinary byteSize }
       }
     }
   }
   ```
   Batch in chunks (e.g., 40 SHAs) to stay under response-size limits. This is what makes a full-vault fetch viable within rate limits.

3. **Raw assets & writes — REST.**
   - Read asset: `GET /repos/{owner}/{repo}/contents/{path}` with `Accept: application/vnd.github.raw` (Phase 8).
   - Write note: `PUT /repos/{owner}/{repo}/contents/{path}` with `{ message, content: base64, sha, branch }` (Phase 10). 409 → `ConflictError`.

**Incremental sync (Phase 6):** fetch the REST tree, diff by `sha` per path:
- path absent in new tree → delete from DB (ghost-note prevention)
- new path → add to fetch batch
- sha changed → add to fetch batch
- sha unchanged → skip
Then GraphQL-batch fetch only the changed/added set. Update `syncMeta.lastCommitSha`.

---

## 6. Phases

### Phase 0 — Architecture Validation `[ ]`
**Goal:** prove every risky assumption with minimal code. Output: one note rendered from GitHub, no real UI.

**Tasks**
- [ ] `bun create vite` (React + TS), swap to Bun scripts; add Tailwind + shadcn/ui base.
- [ ] `lib/github/api.ts`: REST `getTree(owner, repo, branch)` + raw `getContents(path)`.
- [ ] Build a tiny `pocketvault-test-vault` repo: 10 notes, nested folders, 2 images, wiki-links, tags, a callout, frontmatter w/ aliases.
- [ ] Fetch one note via REST raw, render with `react-markdown` in a throwaway page.
- [ ] Validate: REST tree works, raw fetch works, markdown renders, rate-limit headers parse.

**Files:** `src/lib/github/api.ts`, `src/pages/_scratch/Validate.tsx`, `.env.example`.

**Key decisions**
- Dev auth = PAT via `.env` `VITE_GITHUB_TOKEN`. (Replaced Phase 9.)
- REST recursive tree is the tree source of truth (§5.1).

**Definition of Done**
- Open app → one note fetched live from GitHub and rendered as HTML.
- No UI, no search, no DB yet. Console logs confirm tree + content fetch succeed.

**Risks**
- Token exposure in SPA (dev-only, accepted). Private repos need `repo` scope.

---

### Phase 1 — Repository Reader `[ ]`
**Goal:** connect to a repo and read the entire vault (notes only).

**Tasks**
- [ ] `store/auth.ts` (Zustand): hold dev PAT + `{owner, repo, branch}`; persist to Dexie `settings`.
- [ ] `StartPage`: input owner/repo/branch + PAT; "Connect".
- [ ] `lib/github/contents.ts`: batch-fetch md content via GraphQL by SHA (§5.2).
- [ ] `lib/markdown/frontmatter.ts`: `gray-matter` parse → split frontmatter / content / title.
- [ ] `lib/slug/slug.ts`: `slugify(title|basename)` → lowercase, trimmed.
- [ ] For each md file: fetch content, parse, produce a `Note` (tags, aliases, outgoing links extracted), write to Dexie `notes`.
- [ ] Build `wikilinks` map: for each note, record `{slug → paths}` (multiple paths allowed).

**Files:** `src/lib/github/{graphql,contents}.ts`, `src/lib/markdown/frontmatter.ts`, `src/lib/slug/slug.ts`, `src/store/auth.ts`, `src/pages/StartPage.tsx`.

**Key decisions**
- Title precedence: frontmatter `title` → H1 → basename.
- Wiki-link slug is **case-insensitive**; collisions keep an array of paths.

**Definition of Done**
- Connect → full vault pulled into IndexedDB. `db.notes.count()` matches md file count in the test repo. `wikilinks` resolves each `[[Link]]` slug.

**Risks**
- Large vaults exceed GraphQL response size → chunk fetching by SHA batches.

---

### Phase 2 — Local Database Layer `[ ]`
**Goal:** the app boots from IndexedDB; no network needed to read.

**Tasks**
- [ ] `lib/db/schema.ts`: Dexie DB + indexes per §4 (version 1).
- [ ] `lib/db/notes.ts`, `sync.ts`, `wikilinks.ts`: typed repositories.
- [ ] `store/vault.ts`: loads notes from DB on boot; selectors for current note, tags.
- [ ] `dexie-react-hooks` `useLiveQuery` for reactive views.
- [ ] Handle empty-DB state gracefully → route to `StartPage`.

**Files:** `src/lib/db/*`, `src/store/vault.ts`, `src/hooks/useNote.ts`.

**Definition of Done**
- After a one-time sync, kill network in DevTools → app still lists and opens every note from IndexedDB.

**Risks**
- Schema migration later → plan versions now; never mutate v1 in place after release.

---

### Phase 3 — Folder Navigation `[ ]`
**Goal:** collapsible tree mirroring vault structure.

**Tasks**
- [ ] `lib/folder-tree/build.ts`: turn `path[]` → nested `TreeNode[]` (folders + notes).
- [ ] `components/folder-tree/FolderTree.tsx`: recursive, collapsible, active-highlight, keyboard nav (arrow keys), virtualization for large vaults (e.g., `@tanstack/react-virtual`).
- [ ] Wire selection → `store/vault.openNote(path)`.
- [ ] Persist expanded-state per repo in settings.

**Files:** `src/lib/folder-tree/build.ts`, `src/components/folder-tree/*`.

**Definition of Done**
- Tree renders, expands/collapses, clicking a note opens it. Structure matches the GitHub repo.

**Risks**
- Vaults with thousands of folders → must virtualize and memoize tree build.

---

### Phase 4 — Markdown Engine `[ ]`
**Goal:** Obsidian-flavored markdown renders correctly.

**Tasks (each = one remark/rehype plugin + renderer)**
- [ ] **Wiki-links** `[[Target|alias]]` → resolve via `wikilinks` table; render as internal link (clickable) or broken-link style if unresolved.
- [ ] **Tags** `#tag` and inline tag detection → clickable chips (Phase 5 wires to search).
- [ ] **Embeds** `![[note]]` (note transclusion) and `![[image.png]]` (asset — placeholder now, full in Phase 8).
- [ ] **Frontmatter** rendered as a meta header (tags, aliases, dates).
- [ ] **Callouts** `> [!NOTE]`, `[!warning]`, `[!tip]`, `[!info]`, `[!quote]` → styled blocks.
- [ ] **Backlinks panel** using `*outgoingLinks` index (§4).
- [ ] **Code blocks** + syntax highlight (`rehype-highlight` or `shiki`).
- [ ] **Tables, task lists, footnotes** via `remark-gfm`.

**Files:** `src/lib/markdown/plugins/{wikilinks,embeds,tags,callouts}.ts`, `src/components/markdown/*`.

**Key decisions**
- Plugin pipeline order: `remark(wikilinks, embeds) → remark-gfm → rehype(highlight, callouts)`.
- Transclusion depth limit (e.g., 3) to prevent infinite loops.

**Definition of Done**
- Open the test-vault note set: all wiki-links resolve and navigate, callouts styled, embeds show, backlinks panel lists inbound links.

**Risks**
- Circular transclusions; ambiguous slugs (multiple paths) → show a disambiguation picker.

---

### Phase 5 — Search Engine `[ ]`
**Goal:** instant full-text search across the vault.

**Tasks**
- [ ] `lib/search/index.ts`: FlexSearch index over `{ title (high weight), aliases, tags, content }`. Build at end of every sync; rebuild on first boot from DB.
- [ ] `components/search/SearchBox.tsx`: debounced (≈30ms), keyboard-first (Cmd/Ctrl+K to open, arrows + Enter), result list with title + breadcrumb + snippet highlight.
- [ ] Exclude attachments/pdfs/images from index (notes only).
- [ ] Persist last-built `syncMeta` so we only rebuild when the vault changed.

**Files:** `src/lib/search/*`, `src/components/search/*`, global Cmd+K hotkey in `App.tsx`.

**Definition of Done**
- Typing "docker" returns the right note in < 50ms on the test vault; clicking opens it; clearing query is instant.

**Risks**
- Index rebuild cost on huge vaults → rebuild lazily, show a progress chip, allow cancel.

---

### Phase 6 — Sync Engine `[ ]`
**Goal:** reliable initial + incremental sync, no ghost notes.

**Tasks**
- [ ] `lib/sync/initial.ts`: REST tree → GraphQL batch fetch → write all notes + build wikilinks + rebuild search index → set `syncMeta`.
- [ ] `lib/sync/diff.ts`: given old DB SHAs and new tree → `{ added, changed, deleted, unchanged }`.
- [ ] `lib/sync/incremental.ts`: fetch only `added|changed` (batched), delete `deleted` (ghost prevention), update index incrementally.
- [ ] `lib/github/rate-limit.ts`: read headers, expose `waitForReset()`, surface in `store/vault`.
- [ ] `components/sync/SyncBar.tsx`: progress, last-sync time, "Sync now", error states.

**Files:** `src/lib/sync/*`, `src/store/sync.ts`, `src/components/sync/*`.

**Definition of Done**
- Add/edit/delete a note on GitHub → re-sync → local DB reflects exactly (added/updated/removed). No ghost notes after deletion.

**Risks**
- `truncated: true` tree → fallback path. Race conditions if user edits mid-sync → lock sync while editing.

---

### Phase 7 — Reader Experience `[ ]`
**Goal:** a premium, mobile-first reading surface.

**Tasks**
- [ ] Three-pane layout: FolderTree (left) · Search overlay · Reader (center) · Backlinks (right on desktop).
- [ ] **Themes**: Light / Dark / Sepia via Tailwind tokens; persisted; `prefers-color-scheme` default.
- [ ] Reading mode: hide chrome, centered column `max-width: 720px`, `line-height: 1.8`, comfortable type scale.
- [ ] Mobile-first: collapsible drawer for tree, swipe/ESC to close, sticky search, large tap targets.
- [ ] Reading progress bar, "scroll to top", "copy link to note".
- [ ] Empty/loading/error states for every async view.

**Files:** `src/App.tsx`, `src/components/layout/*`, `src/store/theme.ts`, `src/styles/prose.ts`.

**Definition of Done**
- On a phone-width viewport, the full flow (open → search → read → wiki-link → back) is smooth and legible. All three themes look correct.

**Risks**
- Theme flicker on load → set theme class on `<html>` before React mounts.

---

### Phase 8 — Asset System `[ ]`
**Goal:** images/PDFs referenced by notes fetch from GitHub and cache locally.

**Tasks**
- [ ] `lib/asset-cache/index.ts`: Cache Storage wrapper, key = `${owner}/${repo}/${sha}` (SHA-keyed = automatic invalidation on change).
- [ ] Resolver: `![[image.png]]` / `![alt](rel/path.png)` → asset path → fetch raw via REST → cache → render.
- [ ] Rewrite `<img src>` / `<a href>` in markdown to cached blob URLs; handle absolute vs. relative paths.
- [ ] Pre-fetch assets for a note on open (background) for offline.
- [ ] Fallback for missing assets (broken-image state, no crash).

**Files:** `src/lib/asset-cache/*`, `src/components/markdown/Asset.tsx`.

**Key decisions**
- Assets in **Cache Storage** (binary-friendly), never IndexedDB.
- Use `Accept: application/vnd.github.raw` for raw bytes.

**Definition of Done**
- Open a note with images → images render from cache; go offline → images still show.

**Risks**
- Large binary assets eating storage → show storage usage in Settings; tie into persistence (Phase 11).

---

### Phase 9 — OAuth `[ ]`
**Goal:** one-click GitHub login; remove PAT friction.

**Tasks**
- [ ] Create GitHub OAuth App; set callback to Worker URL.
- [ ] `worker/index.ts`: receives `?code=` → `POST github.com/login/oauth/access_token` with client id + **secret** → return `{ access_token }` as JSON with CORS headers. Worker does **nothing else**.
- [ ] `store/auth.ts`: OAuth branch — "Login with GitHub" → redirect → handle callback → store token in Dexie.
- [ ] Reconcile repo selection post-login: list user repos (REST `/user/repos`) or accept owner/repo input.
- [ ] Token refresh/logout flow.

**Files:** `worker/index.ts`, `wrangler.toml`, `src/store/auth.ts`, `src/pages/StartPage.tsx`.

**Key decisions**
- Token stored in Dexie (same XSS surface as localStorage; document in SECURITY note). Alternative: HttpOnly cookie via Worker proxy — out of scope for MVP.
- Scopes: `repo` (private repos) or `public_repo` (read-only public). Offer choice.

**Definition of Done**
- A brand-new user clicks Login → authorizes → vault loads → token never appears in client bundle/Network for the secret. Secret only in Worker.

**Risks**
- OAuth App vs. GitHub App (finer scopes) — start with OAuth App. Redirect URI mismatches — test both local & prod.

---

### Phase 10 — Micro Edit `[ ]`
**Goal:** quick fixes committed back to GitHub from the browser.

**Tasks**
- [ ] "Edit" toggle on a note → swap to a `<textarea>` (or `CodeMirror` lightweight editor) preloaded with raw content.
- [ ] `lib/github/contents.ts`: `putContents(path, b64, sha, message)` → REST PUT.
- [ ] **Conflict handling** on HTTP 409 (`ConflictError`): modal with **Copy My Changes / Reload Latest / Overwrite Remote**.
- [ ] On success: update local note content + sha in DB; refresh search index entry; show commit link.
- [ ] Disabled when offline; disabled for read-only tokens.

**Files:** `src/components/editor/*`, `src/lib/github/contents.ts` (extend), `src/lib/edit/conflict.ts`.

**Definition of Done**
- Fix a typo on mobile → save → re-open offline → change persists locally; verify on GitHub it committed.

**Risks**
- Concurrent edits by Obsidian client → conflict modal must not silently clobber. No merge engine (by design).

---

### Phase 11 — PWA `[ ]`
**Goal:** installable, offline-native app behavior.

**Tasks**
- [ ] `vite-plugin-pwa`: manifest (icons, name, theme color), precache app shell via Workbox.
- [ ] Offline fallback page; `beforeinstallprompt` → custom Install button.
- [ ] `navigator.storage.persist()` request after first successful sync; surface granted/denied.
- [ ] **Offline banner** + **last-sync time** when `navigator.onLine === false`.
- [ ] Background sync on reconnect (re-run incremental sync) — via simple `online` event listener for MVP (Background Sync API as enhancement).
- [ ] Storage usage UI in Settings.

**Files:** `vite.config.ts` (pwa plugin), `public/manifest.webmanifest`, `src/lib/pwa/*`, `src/store/network.ts`.

**Definition of Done**
- Install to home screen → launches fullscreen, works fully offline, syncs on reconnect.

**Risks**
- iOS PWA limitations (storage eviction) → prompt persist; warn users.

---

## 7. Testing Strategy

| Level | Tool | Scope |
|---|---|---|
| Unit | Vitest | `slug`, frontmatter parse, folder-tree builder, sync `diff`, conflict util, rate-limit math. |
| Component | React Testing Library | markdown renderers (wikilink/embed/callout), FolderTree, SearchBox, SyncBar. |
| API mocking | MSW | mock GitHub REST + GraphQL for sync & edit tests (incl. 409, 403 rate-limit, truncated tree). |
| E2E (optional, late) | Playwright | Connect → sync → search → open → wiki-link → edit → save. |
| Manual smoke | — | Per-phase DoD checklist against `pocketvault-test-vault`. |

Every phase ships its unit/component tests. CI fails on red.

---

## 8. CI / CD

**GitHub Actions on `main`:**
1. `bun install` (frozen lockfile)
2. `bun run lint` · `bun run typecheck` · `bun run test`
3. `bun run build`
4. Deploy SPA → Cloudflare Pages via `wrangler pages deploy`
5. Deploy Worker → `wrangler deploy` (secrets via `wrangler secret put`)

PRs run lint/typecheck/test/build only (no deploy).

---

## 9. Security Considerations

- OAuth client secret lives **only** in the Worker. Never bundled.
- Access tokens in Dexie (XSS-exposed by SPA nature) — accepted for MVP, documented.
- Scope least-privilege: prefer `public_repo` when user vaults are public.
- All GitHub calls over HTTPS; no third-party analytics in MVP.
- CSP via Cloudflare Pages headers; disallow inline scripts except Vite-injected (configure hash/nonce in prod).

---

## 10. Suggested Order & Rough Effort

| Phase | Focus | Size |
|---|---|---|
| 0 | Validate | S |
| 1 | Repo reader | M |
| 2 | DB layer | M |
| 3 | Folder tree | S–M |
| 4 | Markdown engine | **L** (most code) |
| 5 | Search | M |
| 6 | Sync engine | M |
| 7 | Reader UX | M |
| 8 | Assets | S–M |
| 9 | OAuth | M |
| 10 | Micro edit | S–M |
| 11 | PWA | S–M |

Milestones:
- **M1 — "It reads"** (Phases 0–5 done): you can sync, browse, search, and read your real vault offline.
- **M2 — "It feels like a product"** (6–8): reliable sync + assets + polish → daily-driver candidate.
- **M3 — "It's shippable"** (9–11): no PAT friction, edit anywhere, installable.

---

## 11. Decisions Log

| # | Decision | Date | Notes |
|---|---|---|---|
| D1 | Dev auth = PAT until OAuth (Phase 9) | 2026-07-04 | Avoid premature auth work. |
| D2 | REST recursive tree for structure, GraphQL for batch content | 2026-07-04 | Beats rate limits; see §5. |
| D3 | Backlinks via `*outgoingLinks` multiEntry index | 2026-07-04 | No backlink table. |
| D4 | Folder tree derived from paths, not stored | 2026-07-04 | Recompute on sync change. |
| D5 | Assets in Cache Storage, keyed by SHA | 2026-07-04 | Auto-invalidates on change. |
| D6 | No merge engine for edits (409 → user picks) | 2026-07-04 | Per MVP scope. |

---

## 12. Out of Scope (MVP, reaffirmed)

AI Chat · Graph View · Dataview Engine · Canvas · Plugin Marketplace · Collaboration/Multi-user · Note sharing.

---

## 13. Open Questions (resolve before/at the phase)

- [ ] Vault size upper bound to design for (1k? 10k? 50k notes?) — affects tree virtualization & index persistence. (Phase 3/5)
- [ ] Should we persist the FlexSearch index to disk, or always rebuild from DB? (Phase 5)
- [ ] GitHub OAuth App vs. GitHub App (finer scopes) — revisit at Phase 9.
- [ ] Editor: plain `<textarea>` vs. lightweight CodeMirror (Markdown-aware). (Phase 10)
