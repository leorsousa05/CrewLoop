# Tech Stack

> Versions, why, and links. Read when a spec touches a technology; never copy into specs — reference by link.

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Skills | Markdown + YAML frontmatter | — | Portable across agents; no runtime |
| CLI | TypeScript (Node.js) | Node ≥ 18 | Single installable binary `crewloop` |
| Dashboard | TypeScript (Node.js + WebSocket) | Node ≥ 18 | Real-time event server + SPA UI |
| Dashboard UI | React 19 + Vite | see `servers/dashboard/package.json` | Served statically by the dashboard server |
| Docs site | Vite + React 19 + Tailwind 3.4 | see `docs/package.json` | GitHub Pages SPA, hash-routed, markdown-driven |
| Scripts | Python 3 + Bash | — | Skill validation, packaging, publish dry-run |
| Telemetry store | SQLite | Node built-in `node:sqlite` | Local durable usage history |
| Tests (CLI) | Node built-in test runner | — | `npm test` in `packages/cli/` |
| Tests (dashboard) | Node built-in test runner | — | `npm test` in `servers/dashboard/` |
| Lint (docs) | oxlint | see `docs/package.json` | `npm run lint` |
| CI/CD | GitHub Actions | — | Publish on `v*.*.*` tags, skill validation |

## Canonical source

- Exact dependency versions: `package.json` (workspace root), `packages/cli/package.json`, `servers/dashboard/package.json`, `docs/package.json`.
- ADRs: `specs/shared/adrs/` for architecture decisions behind these choices.
- Runtime behavior contracts: `specs/shared/architecture-overview.md`.
