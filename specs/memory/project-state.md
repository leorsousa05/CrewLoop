# Project State

> Always-read file. Updated at the end of every working session by `crewloop:ship` (or `crewloop:plan` during discovery).

**Last updated:** 2026-09-25

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

- 2026-09-25: Spec 059 fixes dashboard acceptance-checker tests that incorrectly assumed the checked-in matrix remained incomplete. Fixtures now normalize all run-record fields and both matrix states. Workspace build/tests, both token benchmarks, acceptance checks, Python skill validation, and two consecutive browser preflights passed. The first browser preflight was 111/112; the optional workspace typecheck stalled and was interrupted. Refresh the manual matrix run record to the exact release candidate before publishing.
- 2026-09-25: Spec 060 makes workspace test commands build their compiled output and uses a portable file-list runner so dashboard server discovery does not launch the runtime entry point. Static syntax and package-manifest checks passed; full test suites were not run in this session. Spec 060 remains active pending test execution; static review is complete.
- 2026-09-25: Specs 031 and 032 completed after the operator-confirmed dashboard manual acceptance matrix recorded all 112 view combinations and 12 interaction rows; the user-provided checker output was `COMPLETE`. The screen-reader walkthrough is confirmed, but its specific assistive technology was not recorded. No dashboard runtime code changed.
- 2026-09-03: Spec 051 makes measured cost per correctly completed task a required benchmark gate: a candidate with cheaper tokens but higher cost, or unavailable cost evidence, now returns `keep_baseline`. Dataset and execution-record fixtures both return `adopt_candidate` with 25% lower tokens and cost at 100% coverage; focused benchmark/CLI tests passed `34/34`, and the full dashboard passed typecheck, build, `353` server tests, `92` UI tests, and `4` preflight contract tests.
- 2026-09-03: Spec 052 synchronizes the cost gate across `references/continuous-optimization.md` and the Plan/Code/Review handoffs. The automated workflow contract test passed `6/6` and skill validation passed for all 7 skills; benchmark behavior remains centralized in `benchmark.ts`.
- 2026-09-03: Spec 054 stabilizes the dashboard rendered-contrast preflight by awaiting browser font readiness and two animation frames before interaction assertions. Commit `a11f7a3` passed the full dashboard suite (`354` server, `92` UI, `5` preflight contract tests) and a fresh isolated Chrome checkpoint (`112/112` combinations, `8/8` interactions, `574` rendered-text candidates, `0` unsupported styles). Spec 053 refreshed the acceptance matrix to this commit; human visual, keyboard, and screen-reader results remain pending.
- 2026-09-03: Spec 055 adds deterministic per-scenario token, duration, success-rate, and cost comparisons to the existing benchmark result and Markdown report. Aggregate adoption gates remain unchanged and recommendation-only. Focused benchmark/CLI tests passed `37/37`; the complete dashboard suite passed `357` server tests, `92` UI tests, and `5` preflight contract tests; typecheck and both fixed benchmarks passed. Python-based skill validation was unavailable because no interpreter is configured, and no `SKILL.md` file changed.
- 2026-09-03: Spec 056 reconciles the active dashboard documentation with the current feature-spec retention contract. Specs 021 and 022 remain completed under `specs/features/04-workflow/`; README, published Ship docs, Spec 032, and the acceptance evidence map no longer require archiving normal completed features. Only Specs 031 and 032 remain active because the manual dashboard matrix is still open; no runtime files changed.
- 2026-09-03: Spec 057 reconciles Spec 031's checklist with existing automated evidence. Focus, semantic-row, reduced-motion, and external-resource criteria are recorded as proven; visual hierarchy, complete event-state coverage, and full visual/contrast review remain manual. Specs 031 and 032 remain the only active specs, and no runtime files changed.
- 2026-09-03: Spec 058 adds the opt-in, read-only `check:dashboard-acceptance` helper. It validates the run record, all 112 view cells, and all 12 interaction rows without fabricating manual results. Checker tests passed `5/5`; workspace tests passed `97` CLI, `357` server, `92` UI, and `5` preflight tests. The real matrix correctly returns `INCOMPLETE` with exit code `1`; the manual dashboard gate remains open.
- Older decisions live in [decisions/decision-log.md](decisions/decision-log.md); read it only when a task touches a recorded topic.
- See `specs/shared/adrs/adr-001..010-*.md` for the architectural history.

## Blockers

- None. Docs-site `npm run build`/`npm run lint` require `npm install` in the workspace (node_modules absent in this environment) — pre-existing, not caused by spec 034.

## Next task suggested

- Before publishing, refresh the dashboard acceptance run record for the exact release candidate and record the assistive technology used. Keep both dataset and execution-record CI fixtures synchronized with optimizer-policy changes, and require a reviewed `adopt_candidate` result before adoption. Specs 031 and 032 are complete; completed feature specs stay in `specs/features/`, and future architecture changes go through `specs/changes/rfc-NNN-*.md` first.
