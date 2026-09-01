# Project State

> Always-read file. Updated at the end of every working session by `crewloop:ship` (or `crewloop:plan` during discovery).

**Last updated:** 2026-09-01

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
- 2026-09-01: Token optimization starts inside CrewLoop with `specs/features/04-workflow/spec-014-token-optimization-phase-0-1.md`. Reuse the existing dashboard token telemetry and benchmark contracts; do not fabricate provider metrics or add an external optimizer.
- 2026-09-01: Spec 014 completed. Phase 2 continues inside the Plan skill with deterministic local context selection; use task matches, modified files, imports/consumers, and associated tests before considering broader search.
- 2026-09-01: Spec 015 adds the portable context-selection contract to Plan. Phase 3 will apply the existing risk budgets and stop categories inside Code with task-local replay only.
- 2026-09-01: Spec 016 adds task-local execution control to Code: reuse unchanged inspection results, invalidate after mutations, stop bounded retries, and preserve mandatory validation.
- 2026-09-01: Spec 017 defines fail-closed automatic verification in Review, including required evidence, changed-file and secret scans, destructive-command detection, and one bounded correction round.
- 2026-09-01: Spec 018 defines provider-neutral model routing: risk takes precedence over change size, high-risk work uses capable routing, and every route retains verification.
- 2026-09-01: Spec 018 implementation adds provider-neutral routing guidance to Plan and Code; high-risk work remains capable and verification-required.
- 2026-09-01: Spec 019 defines task-local execution profiles: balanced by default, safe for high-risk conflicts, minimal only for low-risk work, and review for regression/quality impact.
- 2026-09-01: Spec 019 implementation adds the shared execution-profile contract to Plan, Code, and Review; high-risk explicit weaker profiles escalate to safe in the existing telemetry selector, with focused regression coverage. The spec passed the Review gate and is complete.
- 2026-09-01: Spec 020 completes the native optimization loop: benchmark datasets carry bounded policy identity, fixed baseline/candidate corpus coverage is enforced, quality-first comparison returns `adopt_candidate` or `keep_baseline`, and Plan/Code/Review require recommendation-only adoption evidence.
- 2026-09-01: Spec 021 adds the fixed token benchmark as a post-test CI gate and documents local reproduction. The workflow fails closed on invalid corpus or quality regression while preserving existing build, tests, and skill validation.
- 2026-09-01: Spec 022 removes Windows shell-glob dependence from the CLI and dashboard server test scripts by using Node's native recursive `node --test dist` discovery. Build, dashboard tests, UI tests, benchmark, YAML, skill validation, and scope review passed; one pre-existing environment-sensitive CLI doctor assertion remains a separate follow-up.
- 2026-09-01: Spec 023 isolates the CLI doctor test from the host home directory with an optional test-only override while preserving production defaults. CLI, workspace, dashboard, UI, benchmark, and security validation passed; the change is ready for Ship.
- See `specs/shared/adrs/adr-001..010-*.md` for the architectural history.

## Blockers

- None. Docs-site `npm run build`/`npm run lint` require `npm install` in the workspace (node_modules absent in this environment) — pre-existing, not caused by spec 034.

## Next task suggested

- Ship spec 023. Keep the CI benchmark fixtures synchronized with every future optimizer-policy change and require a reviewed `adopt_candidate` result before adoption. Future architecture changes go through `specs/changes/rfc-NNN-*.md` first.
