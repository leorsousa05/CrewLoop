# Project State

> Always-read file. Updated at the end of every working session by `crewloop:ship` (or `crewloop:plan` during discovery).

**Last updated:** 2026-09-02

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
- 2026-09-01: Spec 023 isolates the CLI doctor test from the host home directory with an optional test-only override while preserving production defaults. CLI, workspace, dashboard, UI, benchmark, and security validation passed; commit `01d72f5` is pushed to `origin/token/otimization`.
- 2026-09-01: Spec 029 shipped in commit `103d57e`, completing the dashboard event/session consistency foundation: canonical boundary validation, workspace-root preservation, stable invocation correlation, deterministic lifecycle/pruning/resume, typed remove messages, OpenCode contract propagation, and five adapter fixtures. Build/tests/benchmark/skill validation passed; review PASS.
- 2026-09-02: Spec 030 implementation and review PASS. The dashboard client now applies bounded maxEvents projection, complete filters, coalesced pause buffering, deterministic removal/deep-link fallback, reactive theme/reduced-motion settings, protocol-aware WebSocket URLs, versioned settings migration, and abortable identity-guarded file requests. Dashboard build, typecheck, 338 server tests, and 82 UI tests passed.
- 2026-09-02: Spec 031 dashboard responsive UI refinement implemented and Review PASS with a low-risk manual-validation warning. Added the responsive/accessibility design handoff, shared focus trap and overlay shortcut priority, modal mobile navigation/filter behavior, sibling Timeline/Sessions actions, live async states, 44px touch targets, responsive view headings, local-font-only shell, and reduced-motion-safe motion. Typecheck, production build, 338 server tests, and 86 UI tests passed; browser viewport/contrast walkthrough remains the next manual check before shipping.
- 2026-09-02: Spec 032 dashboard quality/documentation consolidation progressed. Root README, shared architecture, ADR 001 supersession notes, and the tests guide now describe the seven-view, five-product, localhost-only dashboard with minimized durable usage telemetry. Added `tests/dashboard-acceptance-matrix.md` with the requirement-to-evidence map and the full desktop/mobile × light/dark/system × compact/comfortable walkthrough. Typecheck, production build, 338 server tests, 86 UI tests, skill validation, and a live smoke test (HTML, Usage, Skills, deep link, and no external font references) passed; archive moves for specs 021/022 and the recorded browser matrix remain pending.
- 2026-09-02: Spec 034 fixed mobile empty-state wrapping by constraining the existing Overview guidance paragraph to the available width. The regression test, typecheck, build, 338 server tests, 87 UI tests, 112/112 route/theme/density preflight combinations, and focused desktop/mobile interaction checks passed; the complete manual accessibility/contrast matrix and Ship-only archive/close steps remain pending.
- 2026-09-02: Spec 035 fixed missing accessible names in Settings for the reduced-motion switch, auto-follow switch, max-events input, and theme select. The focused regression test, 22 UI files/88 tests, typecheck, production build, and post-reload Chrome probe passed; the probe reported zero unnamed controls, successful reduced-motion toggling, and primary/secondary contrast of 17.083:1/4.832:1 in light and 17.485:1/8.742:1 in dark. Global DOM and native Chrome accessibility-tree scans also passed all seven routes at desktop and mobile with zero unnamed interactive controls. The full manual screen-reader/contrast matrix and Ship-only archive/close steps remain pending.
- 2026-09-02: Spec 013 workflow automation completed implementation evidence: Plan now resolves unspecified discovery choices with repository-backed defaults without questionnaires, Design explicitly resolves missing visual preferences from surface/register defaults, and shared workflow docs agree with the non-blocking handoff. Added `scripts/tests/test_automated_workflow.py` and wired it into CI; the spec's acceptance criteria now have testable evidence. Status remains `in-progress` until Ship closes it.
- 2026-09-02: Spec 036 added a package-local Chrome CDP acceptance preflight. It covers exactly 112 dashboard combinations, checks render state, horizontal overflow, DOM/AX accessible names, and exits non-zero on setup or invariant failures. A live run passed `112/112` with the isolated target preserving the operator's page-tab count; it also exposed and fixed the shared FilterBar's missing accessible name. The manual screen-reader and visual matrix remains separate and pending.
- See `specs/shared/adrs/adr-001..010-*.md` for the architectural history.

## Blockers

- None. Docs-site `npm run build`/`npm run lint` require `npm install` in the workspace (node_modules absent in this environment) — pre-existing, not caused by spec 034.

## Next task suggested

- Complete and record the dashboard browser acceptance matrix, then use Ship to close Spec 013, archive specs 021/022, and close Specs 032/034/035. Keep the CI benchmark fixtures synchronized with every future optimizer-policy change and require a reviewed `adopt_candidate` result before adoption. Future architecture changes go through `specs/changes/rfc-NNN-*.md` first.
