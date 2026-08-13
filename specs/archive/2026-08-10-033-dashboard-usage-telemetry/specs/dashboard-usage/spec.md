# Spec Delta: Dashboard Usage Telemetry

## Current State

Token measurements are merged into an in-memory session aggregate, with only 256 recent measurement IDs and non-durable cumulative cursors. Restart and 24-hour session pruning erase history. Overview contains a Skill Activity canvas, navigation has six routes, and no product-level daily comparison or monetary estimate exists. Only Codex and Kimi have verified automatic token readers.

## Changes

### ADDED

- A local SQLite repository containing normalized accepted measurements, durable cumulative cursors, session aggregates, daily product aggregates, reset watermarks, and schema migrations.
- A `CodingAgentProduct` boundary for `codex`, `kimi`, `claude`, `opencode`, and `agy`; `AgentSource` remains transport provenance.
- Local-only daily-query and reset APIs with bounded date validation and explicit unavailable/partial states.
- A seventh `Usage` view at `#/usage`, registered through `NAV_ITEMS`, with 7/30/90-day and all-history comparison ranges.
- Token breakdowns by total, input, output, cache read, cache write, and reasoning, without deriving total from overlapping categories.
- Optional immutable API-equivalent cost snapshots from provider-reported cost or an exact versioned model-price match.
- Verified best-effort collectors and a generic external ingestion fallback for all supported products.

### MODIFIED

- Token ingestion persists and deduplicates an accepted delta before updating live session telemetry.
- Codex and Kimi cursor scopes become durable and session/stream-specific; Kimi reads all verified session wire streams instead of only the newest matching file.
- Claude, OpenCode, and AGY adapters normalize verified native usage fields when present and otherwise report unavailable telemetry.
- Navigation, routing, shortcuts, command palette, TopBar behavior, tests, README, and living specifications describe seven views.
- The Usage view is aggregate across products and sessions and does not change when the selected session changes.

### REMOVED

- The Overview `Skill Activity` section and its now-unused `ActivityGraph` component.
- In-memory-only measurement identity as the authoritative deduplication mechanism.
- UI behavior that represents missing telemetry or unknown pricing as numeric zero.

## Migration Notes

- On first start, create the database at the configured telemetry path and pin its IANA timezone. Existing in-memory history is not backfilled.
- The default database path is `~/.crewloop/dashboard/telemetry.sqlite`; `CREWLOOP_TELEMETRY_DB_PATH` and `CREWLOOP_TELEMETRY_TIME_ZONE` override creation defaults.
- Existing session telemetry remains compatible, but accepted usage after migration is restored from durable session aggregates.
- Shortcut `6` moves from Settings to Usage; Settings becomes shortcut `7`.
- Manual reset deletes measurements and visible aggregates, retains cumulative cursor checkpoints, and advances reset watermarks.

## Backward Compatibility

Existing event and WebSocket clients remain accepted. `POST /ingest/usage` stays available and gains an optional caller-provided stable measurement ID. Hash routes for the original six views remain valid. The native SQLite dependency is pinned to preserve Node 18/20 compatibility. Monetary estimates are additive and nullable.
