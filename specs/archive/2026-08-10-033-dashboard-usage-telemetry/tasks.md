# Tasks: Durable Dashboard Usage Telemetry

> One task is one cohesive change set. Every task lists files, dependencies, verification, and completion evidence.

## Phase 1: Persistence Foundation

- [x] **T1: Add telemetry configuration and SQLite dependency**
  - **Files:** `servers/dashboard/package.json`, `package-lock.json`, `servers/dashboard/src/{types,config}.ts`
  - **Depends on:** Specs 029-031 implementation-complete
  - **Verification:** `npm run typecheck --workspace @archznn/crewloop-dashboard`
  - **Done when:** `better-sqlite3@11.10.0` and typings install, default/override paths and IANA timezone validate, and config tests cover invalid values.

- [x] **T2: Implement the transactional SQLite usage repository**
  - **Files:** `servers/dashboard/src/telemetry/{usage-repository,sqlite-usage-repository}.ts`, related tests
  - **Depends on:** T1
  - **Verification:** `npm run build:server && node --test dist/telemetry/sqlite-usage-repository.test.js`
  - **Done when:** Migrations, WAL, unique replay protection, cumulative cursors/resets, session/daily aggregates, DST/midnight grouping, rollback, reopen, and close-once tests pass.

- [x] **T3: Integrate durable usage with normalization and live state**
  - **Files:** `servers/dashboard/src/telemetry/token-usage.ts`, `servers/dashboard/src/state.ts`, related tests
  - **Depends on:** T2
  - **Verification:** `npm run build:server && node --test dist/telemetry/token-usage.test.js dist/state.test.js`
  - **Done when:** Accepted deltas update SQLite before live state, durable session totals survive restart, and failed writes cannot partially mutate token totals.

## Phase 2: APIs and Cost

- [x] **T4: Add bounded daily-query and confirmed-reset APIs**
  - **Files:** `servers/dashboard/src/api/{usage,daily-usage,reset-usage}.ts`, `servers/dashboard/src/server.ts`, related tests
  - **Depends on:** T3
  - **Verification:** `npm run build:server && node --test dist/tests/usage.test.js dist/server.test.js`
  - **Done when:** Default/explicit ranges, all product states, local Host policy, stable measurement IDs, 366-day cap, reset watermark, 503 rollback behavior, and safe errors are covered.

- [x] **T5: Add immutable estimated-cost snapshots**
  - **Files:** `servers/dashboard/src/telemetry/{pricing-catalog,cost-estimator}.ts`, related tests
  - **Depends on:** T2
  - **Verification:** `npm run build:server && node --test dist/telemetry/cost-estimator.test.js`
  - **Done when:** Reported cost wins, effective-dated exact model rates use micro-USD, unknown models return null, and mixed price coverage is explicit.

## Phase 3: Product Collectors

- [x] **T6: Harden Codex and Kimi durable collection**
  - **Files:** `servers/dashboard/src/adapters/{codex,kimi,kimi-session}.ts`, related fixtures/tests
  - **Depends on:** T3
  - **Verification:** `npm run build:server && node --test dist/adapters/codex*.test.js dist/adapters/kimi*.test.js`
  - **Done when:** IDs/cursor scopes are replay-stable and session-specific, every contained Kimi wire stream advances through an independent durable cursor without duplication, and partial coverage is explicit.

- [x] **T7: Add bounded Claude usage collection**
  - **Files:** `servers/dashboard/src/adapters/{claude,claude-session}.ts`, sanitized fixtures/tests
  - **Depends on:** T3
  - **Verification:** `npm run build:server && node --test dist/adapters/claude*.test.js`
  - **Done when:** Verified direct/transcript counters normalize with stable message identity; malformed, escaped, oversized, or counterless transcripts fail open without leaking raw lines.

- [x] **T8: Add OpenCode and AGY model-usage signals**
  - **Files:** `packages/cli/src/hooks.ts`, `servers/dashboard/src/adapters/{opencode,agy,shim}.ts`, related tests/config examples
  - **Depends on:** T3
  - **Verification:** `npm test --workspace @archznn/crewloop-cli && npm run build:server && node --test dist/tests/adapters.test.js`
  - **Done when:** OpenCode stable message/part usage and reported cost plus AGY final model usage are normalized once; absent/streaming partial counters remain unavailable rather than zero.

## Phase 4: Interface

- [x] **T9: Remove Skill Activity and register the seventh route**
  - **Files:** `servers/dashboard/ui/src/{App.tsx,lib/types.ts,lib/navigation.ts,lib/route.ts,lib/shortcuts.ts}`, `servers/dashboard/ui/src/components/{TopBar.tsx,views/Overview.tsx,ActivityGraph.tsx}`, related tests
  - **Depends on:** T4, approved `design-ui.md`
  - **Verification:** `npm run test:ui -- navigation route Overview TopBar`
  - **Done when:** ActivityGraph is deleted, Live reflows without a gap, `#/usage` round-trips, Usage/Settings use shortcuts 6/7, and session selection is hidden only on Usage.

- [x] **T10: Build the accessible product-usage comparison view**
  - **Files:** `servers/dashboard/ui/src/components/views/UsageView.tsx`, `servers/dashboard/ui/src/hooks/useDailyUsage.ts`, `servers/dashboard/ui/src/lib/usage.ts`, related tests
  - **Depends on:** T5, T9, approved `design-ui.md`
  - **Verification:** `npm run test:ui -- UsageView usage useDailyUsage`
  - **Done when:** Ranges, ranking, daily trend/table, token breakdown, estimated-cost coverage, reset, unavailable-vs-zero, loading/empty/error/stale/partial states, keyboard semantics, and text equivalents pass tests.

## Phase 5: Documentation and Verification

- [x] **T11: Reconcile dashboard documentation and active-spec assumptions**
  - **Files:** `servers/dashboard/README.md`, `specs/living/dashboard/spec.md`, `specs/changes/032-dashboard-quality-documentation/**`
  - **Depends on:** T6-T10
  - **Verification:** `rg -n "six views|1.?6|Skill Activity" servers/dashboard/README.md specs/living/dashboard specs/changes/032-dashboard-quality-documentation`
  - **Done when:** Documentation describes seven views, persistence/privacy, product coverage, estimate limitations, DB configuration/reset, and no stale Skill Activity claim remains.

- [x] **T12: Run the full quality gate**
  - **Files:** `servers/dashboard/**`, `packages/cli/**`, `specs/archive/2026-08-10-033-dashboard-usage-telemetry/**`
  - **Depends on:** T1-T11
  - **Verification:** `npm run typecheck --workspace @archznn/crewloop-dashboard && npm run build --workspace @archznn/crewloop-dashboard && npm test --workspace @archznn/crewloop-dashboard && npm test --workspace @archznn/crewloop-cli && python scripts/validate-skills.py`
  - **Done when:** All commands pass; desktop/mobile 7-view, timezone/DST, reset, restart, partial-cost, reduced-motion, keyboard, contrast, and secret-persistence checks are recorded for Reviewer.

## Verification record — 2026-08-10

- Dashboard: `npm run typecheck`, `npm run build`, and `npm test` passed; 301 server tests and 65 UI tests passed.
- CLI: `npm run build` and `npm test` passed; 97 tests passed. Test scripts now use Node discovery instead of shell-specific globs.
- Skills: all six bundled skills passed `scripts/validate-skills.py` with Python 3.12.
- Persistence/API: automated coverage records duplicate replay, cumulative cursor reset/stale handling, restart/reopen recovery, local midnight and DST attribution, confirmed reset watermarks, all-history and bounded queries, partial cost coverage, unavailable-vs-zero, and absence of synthetic secret/path sentinel values in SQLite text columns.
- Collectors: focused coverage records stable identities for Codex/Kimi/Claude/OpenCode/AGY, independent durable cursors for every Kimi wire plus partial coverage, bounded contained transcript reads, final-message/final-model signals, and malformed-counter fail-open behavior.
- UI/accessibility: navigation, route, TopBar, Overview, Usage view-model, fetch lifecycle, reset, loading/empty/error/stale/partial states, and semantic text equivalents are covered by UI tests. The Usage implementation uses the existing named color/type/motion tokens, patterns and labels in addition to color, and the global reduced-motion contract.
- Visual smoke: Chrome headless verified the empty Usage view in dark mode at 1440×1000 and at the effective mobile breakpoint of 500×900. The desktop sidebar showed all seven routes; mobile controls, summary, product rows, and unavailable labels fit without page overflow. The 390px Chrome-on-Windows capture was discarded because that executable enforces a 500px internal layout minimum and crops narrower screenshots.
- Dependency audit: `npm audit --omit=dev` reported zero production vulnerabilities. Development-only Vite/Vitest tooling retains 3 moderate, 3 high, and 1 critical advisory pending a separate major-version maintenance change.
