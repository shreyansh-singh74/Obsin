# Contributing to Obsin

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/shreyansh-singh74/Obsin.git
cd Obsin
npm install
npm run dev
```

## Project Conventions

- **TypeScript** — Strict mode. Avoid `any` types; use proper type annotations.
- **Tailwind CSS** — Use CSS custom properties from `src/styles/tokens.css` for colors (e.g., `var(--text-primary)`, `var(--accent)`).
- **Components** — Functional components with hooks. Colocate related files.
- **State** — Zustand stores in `src/store/`. Keep stores focused and small.
- **Database** — Dexie repositories in `src/db/repository/`. Always use transactions.
- **Tests** — Write tests for new utilities and engine logic. Place in `__tests__/` directories.

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with clear, focused commits
4. Run tests: `npm test`
5. Run typecheck: `npm run typecheck`
6. Push and open a pull request

## Commit Messages

Use conventional commits:

- `feat: add graph view overlay`
- `fix: resolve image path for nested folders`
- `refactor: extract search engine into separate module`
- `docs: update README with architecture section`
- `test: add tests for slug utility`

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include a clear description of what changed and why
- Add tests for new functionality
- Ensure `npm run build` passes
- Update documentation if needed

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Mention your browser and device for UI issues

## Code of Be kind

Be respectful and constructive. We're building something cool together.
