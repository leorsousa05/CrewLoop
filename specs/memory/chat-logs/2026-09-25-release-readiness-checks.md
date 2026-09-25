# Release readiness checks

- Scope: run release checks after the dashboard acceptance matrix was marked complete.
- The first `npm run test:dashboard-acceptance` run failed 2/5 cases because tests assumed the real matrix remained incomplete.
- Updated checker tests to build deterministic complete and incomplete temporary fixtures.
- `npm run build --workspaces` passed.
- `npm test --workspaces` passed: 97 CLI, 357 dashboard server, 92 UI, and 5 preflight tests.
- `npm run test:dashboard-acceptance` passed 5/5; `npm run check:dashboard-acceptance` returned `COMPLETE` with 112/112 views and 12/12 interactions.
- Dataset and execution-record token benchmarks both passed with `adopt_candidate` on their checked-in fixtures.
- Python workflow validation passed 23 unit tests; `scripts/validate-skills.py` passed for all seven skills.
- Production server smoke returned HTTP 200 for `/` and `/api/skills`.
- Browser preflight initially passed 111/112, then passed 112/112 in two subsequent runs; interaction smoke passed 8/8 and contrast covered 574 text candidates with no unsupported styles.
- `npm run typecheck --workspaces` stalled without further output and was interrupted; workspace builds passed.
- Manual matrix run metadata still refers to 2026-09-03 and commit `a11f7a3`; assistive-technology product remains unspecified.
- Existing local edits to `servers/dashboard/package.json` and `package-lock.json` were included in tests but are excluded from this task commit.
- No runtime dashboard code changed in this task.
- Refresh the manual matrix run record against the exact release candidate before publishing.
