# Contributing to Obsin

Thanks for your interest in contributing to Obsin. The goal is to make a fast, local-first web reader for Obsidian vaults stored in GitHub.

## Ways to contribute

You can help by:

- Reporting bugs with clear reproduction steps
- Testing Obsin with real Obsidian vault structures
- Improving markdown/wiki-link compatibility
- Improving accessibility, mobile UX, and reader polish
- Adding documentation, screenshots, and examples
- Fixing TypeScript issues or small sync/search bugs
- Proposing features through issues before large implementation work

## Development setup

Obsin uses **Bun**. `bun.lock` is the authoritative lockfile.

```bash
git clone https://github.com/shreyansh-singh74/Obsin.git
cd Obsin
bun install
cp .env.example .env.local
bun run dev
```

Open <http://localhost:3000>.

## Environment variables

For OAuth/device flow, configure a GitHub OAuth App and set:

```env
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

Optional:

```env
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback
GITHUB_OAUTH_SCOPE=repo read:user
```

Do not commit real `.env` files or secrets. `GITHUB_CLIENT_SECRET` must never use a `VITE_` prefix because `VITE_` variables are exposed to the browser.

## Useful commands

```bash
bun run dev          # Start Vite on port 3000
bun run typecheck    # Required correctness gate
bun run build        # Typecheck, then create production build
bun run preview      # Preview production build
bun run test         # Run available Vitest tests
bun run test:watch   # Watch mode for Vitest
```

## Project architecture

High-level data flow:

```text
GitHub REST API → sync engine → IndexedDB → Zustand stores → React UI
                                      └→ FlexSearch index
```

Important areas:

- `src/engine/sync/` — vault sync orchestration
- `src/engine/github/` — GitHub REST API integration
- `src/engine/markdown/` — Obsidian-flavored markdown plugins
- `src/db/` — Dexie schema and repository layer
- `src/store/` — Zustand auth/vault/sync stores
- `api/` — Vercel serverless auth/device-flow functions

## Coding guidelines

- Keep changes focused and minimal.
- Prefer existing patterns and dependencies.
- Use TypeScript strictly; avoid `any` unless there is a clear reason.
- Keep IndexedDB access inside `src/db/repository/` modules.
- Keep vault data isolated by `vaultId` when touching persistence.
- Update both markdown plugins and renderer mappings when adding markdown syntax.
- Do not hardcode secrets, personal vault paths, or private repository data.
- Add comments only for non-obvious behavior or tradeoffs.

## Before opening a pull request

1. Create a focused branch from the latest main branch.
2. Make your changes.
3. Run:

   ```bash
   bun run typecheck
   ```

4. If you changed tested utility/engine behavior, also run:

   ```bash
   bun run test
   ```

5. Update docs if behavior, setup, or configuration changed.
6. Open a PR with a clear description and screenshots/GIFs for UI changes.

## Pull request guidelines

A good PR includes:

- What changed
- Why it changed
- How you tested it
- Screenshots/GIFs for visual changes
- Any known limitations or follow-up work

Please keep PRs scoped. If you want to make a large architectural change, open an issue first so we can discuss the design.

## Reporting bugs

When reporting a bug, include:

- Browser and OS
- Whether the vault is public or private
- Auth method used: OAuth, device flow, or PAT
- Reproduction steps
- Expected behavior
- Actual behavior
- Console errors, if any
- A small markdown example if the issue is rendering/link-related

Do not share private tokens or private vault content in public issues.

## Feature requests

For feature requests, please describe:

- The Obsidian workflow you want to support
- Why the current behavior is not enough
- Any examples from Obsidian or related plugins
- Whether you are willing to help test or implement it

## Community expectations

Be kind, constructive, and specific. Assume good intent, help newcomers, and keep discussions focused on improving Obsin for users.
