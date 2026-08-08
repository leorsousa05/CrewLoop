> 🏗️ **CrewLoop Plan** → 🔧 **CrewLoop Code**

# 002 — Automatic Kimi token telemetry from wire logs

## Phase 1: Adapter implementation

- [x] **Task 1: Create `servers/dashboard/src/adapters/kimi-session.ts`**
  - **Files:** `servers/dashboard/src/adapters/kimi-session.ts`
  - **Depends on:** None
  - **Verification:** `npm run test:server` (after Task 2 tests exist)
  - **Done when:** The module exports `readKimiSessionTokenUsage` and `parseLatestKimiWireUsage` that:
    - Resolve the Kimi data dir from `options.kimiDataDir` or `KIMI_DATA_DIR` or home-dir defaults.
    - Discover the most recent `wire.jsonl` for a given `sessionId`.
    - Enforce path containment and reject symlink escapes.
    - Read a bounded tail and parse the latest `usage.record` line.
    - Map `inputOther` → input, `output` → output, `inputCacheRead` → cacheRead, `inputCacheCreation` → cacheWrite.
    - Return a `TokenUsageMeasurement` or `undefined`.

- [x] **Task 2: Create `servers/dashboard/src/adapters/kimi-session.test.ts`**
  - **Files:** `servers/dashboard/src/adapters/kimi-session.test.ts`
  - **Depends on:** Task 1
  - **Verification:** `npm run test:server`
  - **Done when:** Tests cover:
    - Normalizing the latest usage record from a JSONL tail.
    - Returning a stable measurement ID for duplicate reads.
    - Rejecting malformed and unsafe counters.
    - Not exposing raw wire content or unrelated fields.
    - Reading a valid wire file inside the data dir.
    - Rejecting paths outside the data dir and wrong filenames.
    - Rejecting symlink escapes.
    - Handling missing session directories gracefully.

## Phase 2: Integration

- [x] **Task 3: Wire the reader into `normalizeKimi`**
  - **Files:** `servers/dashboard/src/adapters/kimi.ts`, `servers/dashboard/src/adapters/shim.ts`, `servers/dashboard/src/config.ts`, `servers/dashboard/src/types.ts`
  - **Depends on:** Task 1
  - **Verification:** `npm run build:server && npm run test:server`
  - **Done when:**
    - `normalizeKimi` accepts an optional `KimiNormalizationOptions` with `kimiDataDir`.
    - When the hook payload carries no usable `usage`, `normalizeKimi` falls back to `readKimiSessionTokenUsage`.
    - `adapters/shim.ts` passes the configured Kimi data dir through to `normalizeKimi`.
    - `config.ts` exposes the resolved Kimi data dir in `ServerConfig`.

- [x] **Task 4: Regression and integration tests**
  - **Files:** `servers/dashboard/src/tests/adapters.test.ts`
  - **Depends on:** Task 3
  - **Verification:** `npm run test:server`
  - **Done when:**
    - Existing `normalizeKimi` tests still pass without a data dir.
    - A new test verifies that `normalizeKimi` falls back to the wire log when `usage` is absent from the payload.

## Phase 3: Verification

- [x] **Task 5: Full dashboard verification**
  - **Files:** `servers/dashboard/`
  - **Depends on:** Task 2, Task 3, Task 4
  - **Verification:** `npm run build:server && npm run typecheck && npm test`
  - **Done when:** Server tests (207+) and UI tests (48+) pass with 0 failures.

## Done when

- A Kimi Code session that writes a wire log shows `session.token_usage.quality === 'measured'` in the dashboard without manual ingestion.
- All dashboard tests pass.
- No raw wire content is ever stored or broadcast.
