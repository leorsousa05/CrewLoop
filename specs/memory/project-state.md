# Project State

> Always-read file. Updated at the end of every working session by `crewloop:ship` (or `crewloop:plan` during discovery).

**Last updated:** 2026-08-15

## Module status

| Module | Status | Last chat |
|--------|--------|-----------|
| Skills (6 core + docs) | ✅ Complete | 2026-08-14 |
| CLI (`packages/cli/`) | ✅ Complete | 2026-07-15 |
| Dashboard (`servers/dashboard/`) | ✅ Complete | 2026-08-10 |
| Docs site (`docs/`) | ✅ Complete | 2026-07-15 |
| Specs system | ✅ Complete | 2026-08-14 |
| Helper scripts | ✅ Complete | 2026-07-06 |

## Recent decisions

- 2026-08-14: Specs system restructured — `features/` (one spec = one task), `memory/` (project state, chat-logs, decisions, incidents), `shared/` (glossary, tech-stack, conventions, ADRs), `changes/` (RFCs only). Completed feature specs stay in `features/` as source of truth; RFC lifecycle: approved → `shared/adrs/`, rejected → `archive/` + reason.
- 2026-08-15: `crewloop:design` rewritten with Anthropic Frontend Design principles — distinctive studio stance, two-pass token-system process, anti-default clause, references library demoted to optional (spec-039, completed).
- See `specs/shared/adrs/adr-001..010-*.md` for the architectural history.

## Blockers

- None. Docs-site `npm run build`/`npm run lint` require `npm install` in the workspace (node_modules absent in this environment) — pre-existing, not caused by spec 034.

## Next task suggested

- Adopt the new workflow for the next task: read `specs/memory/project-state.md` + one feature spec from `specs/features/<domain>/`, implement, mark Done When, ship.
- Future architecture changes go through `specs/changes/rfc-NNN-*.md` first.
