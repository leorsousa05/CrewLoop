> 🏗️ **CrewLoop Plan** → 🔧 **CrewLoop Code**

# 001 — Fix Kimi token telemetry

## Problem

The dashboard Telemetry panel shows **"Token usage was not reported by this agent"** for sessions originated by Kimi Code, even though the Kimi adapter attempts to normalize a top-level `usage` object.

## Investigation summary

- `servers/dashboard/src/adapters/kimi.ts` calls `normalizeTokenUsage()` with cumulative semantics and a broad alias set.
- `servers/dashboard/src/api/event.ts` re-validates every incoming `token_usage` with `validateTokenUsageMeasurement()` as defense-in-depth.
- The `normalizeKimi` test in `servers/dashboard/src/tests/adapters.test.ts` already exercises a payload with `usage: { input_tokens, output_tokens, cache_read_input_tokens, total_tokens }` and passes at the adapter level.
- A new boundary-validation test confirms that a Kimi `Stop` payload with that usage shape survives `validateTokenUsageMeasurement()`.
- The real root cause is that **Kimi Code hook payloads do not carry token usage**. Verified against Kimi Code CLI hook documentation and third-party integrations. The dashboard cannot display what the agent never sends.
- Fix: add an external ingestion endpoint and a small Kimi/Moonshot usage forwarder.

## Goals

1. Provide a dashboard endpoint that accepts a normalized Kimi/Moonshot usage payload and merges it into the matching session.
2. Ship a small helper script that forwards a Moonshot-style `usage` block to that endpoint.
3. Reuse existing token normalization, validation, and aggregation code.
4. Keep the change local-only and secure (same host/origin policy as `/event`).

## Non-goals

- Building a full Moonshot API client or correlating API requests with sessions automatically.
- Changing ingestion for Codex, Claude, AGY, or OpenCode.
- Modifying the dashboard UI beyond showing the now-populated telemetry.

## Tasks

### 1. Endpoint implementation

- [x] Create `servers/dashboard/src/api/usage.ts` with `createUsageHandler`.
  - Accepts `POST /ingest/usage`.
  - Validates `session_id` and `source`.
  - Normalizes the usage block with the Kimi alias set.
  - Creates/updates the session and merges usage via `StateStore`.
  - Broadcasts the update.
  - Returns typed error responses.
- [x] Register the handler in `servers/dashboard/src/server.ts`.
  - Add `/ingest/usage` to the sensitive-route list.
  - Route `POST /ingest/usage` to the handler.

### 2. Helper script

- [x] Create `servers/dashboard/src/ingest/kimi.ts`.
  - Reads JSON from stdin.
  - Validates required fields.
  - POSTs to the dashboard `/ingest/usage`.
  - Exits `0` on success, `1` on failure with stderr diagnostics.
- [x] Add `servers/dashboard/bin/crewloop-ingest-kimi.js` wrapper.
- [x] Add `crewloop-ingest-kimi` bin entry in `servers/dashboard/package.json`.

### 3. Tests

- [x] Create `servers/dashboard/src/tests/usage.test.ts`.
  - Test valid usage ingestion updates session telemetry.
  - Test missing `session_id` returns `400`.
  - Test invalid `source` returns `400`.
  - Test invalid token counts return `400`.
  - Test missing session is created and then updated.
  - Test duplicate ingestion is de-duplicated.
  - Test helper script forwards usage to the dashboard.
- [x] Keep the regression test in `servers/dashboard/src/tests/adapters.test.ts` passing.

### 4. Verification

- [x] Run `npm run build:server` in `servers/dashboard/` successfully.
- [x] Run `npm run test:server` in `servers/dashboard/` successfully.
- [x] Run `npm run typecheck` in `servers/dashboard/` successfully.

## Done when

- `POST /ingest/usage` with a Kimi usage payload results in `session.token_usage.quality === 'measured'`.
- `crewloop-ingest-kimi` forwards a stdin payload to the dashboard and exits `0`.
- All dashboard server tests pass.
