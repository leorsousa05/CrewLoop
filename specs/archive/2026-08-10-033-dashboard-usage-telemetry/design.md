# Design: Durable Dashboard Usage Telemetry

## Overview

Introduce a persistence port between normalized usage measurements and live session presentation. A `better-sqlite3` adapter performs durable idempotency, cumulative-delta calculation, cursor advancement, materialized session totals, and local-day aggregation in one transaction. The existing in-memory store continues to own live events, while SQLite becomes authoritative for usage history. Read APIs return aggregate product facts only; the browser owns presentation but never pricing logic.

## Assumptions & Defaults

- **Primary metric:** tokens are authoritative because every monetary estimate is model/provider dependent.
- **Product grouping:** group by coding product (`codex`, `kimi`, `claude`, `opencode`, `agy`), not account, installation, machine, or session.
- **Timezone:** pin the server's resolved IANA timezone at database creation; an environment override is allowed. Revisit only if remote dashboards are introduced.
- **Date attribution:** compute the cumulative delta first and attribute all of it to the newer snapshot's local capture date. Cross-midnight usage cannot be split without finer upstream events.
- **Default range:** today plus the previous 29 local dates; support 7d, 30d, 90d, and all history; cap explicit finite queries at 366 days.
- **Retention:** unlimited until explicit reset, as requested.
- **Currency:** USD only, labeled API-equivalent estimate; unknown or partial pricing is never rendered as zero or complete spend.
- **SQLite driver:** pin `better-sqlite3@11.10.0` plus compatible typings to preserve Node 18/20 while avoiding the Node 22.5+ built-in SQLite requirement. Revisit when the package raises its Node floor.
- **Collector coverage:** fail open and mark unavailable when a verified counter cannot be read; never estimate tokens from text.

## Proposed Directory & File Structure

```text
servers/dashboard/
├── package.json                              (Modified: pinned SQLite dependency)
├── README.md                                 (Modified)
├── src/
│   ├── types.ts                              (Modified: product/API contracts)
│   ├── config.ts                             (Modified: DB path/timezone)
│   ├── state.ts                              (Modified: durable usage merge)
│   ├── server.ts                             (Modified: repository/routes/shutdown)
│   ├── api/
│   │   ├── usage.ts                          (Modified: stable IDs/service)
│   │   ├── daily-usage.ts                    (New)
│   │   └── reset-usage.ts                    (New)
│   ├── telemetry/
│   │   ├── token-usage.ts                    (Modified: expose accepted delta/cursor scope)
│   │   ├── usage-repository.ts               (New: port)
│   │   ├── sqlite-usage-repository.ts        (New: adapter/migrations)
│   │   ├── pricing-catalog.ts                (New: effective-dated rates)
│   │   └── cost-estimator.ts                 (New)
│   └── adapters/
│       ├── {codex,kimi,kimi-session}.ts       (Modified)
│       ├── {claude,opencode,agy,shim}.ts      (Modified)
│       └── claude-session.ts                 (New)
└── ui/src/
    ├── App.tsx                               (Modified)
    ├── lib/{types,navigation,route,shortcuts}.ts (Modified)
    ├── lib/usage.ts                          (New)
    ├── hooks/useDailyUsage.ts                (New)
    └── components/
        ├── TopBar.tsx                        (Modified)
        ├── ActivityGraph.tsx                 (Deleted)
        └── views/
            ├── Overview.tsx                  (Modified)
            └── UsageView.tsx                 (New)
packages/cli/src/hooks.ts                     (Modified: OpenCode/AGY usage signals)
specs/decisions/010-durable-product-usage-telemetry.md (New)
```

Tests live beside each server/UI module and in the existing adapter, server, and CLI test suites.

## File-by-File Changes

| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `src/telemetry/usage-repository.ts` | Add | Persistence port, product/date/query/reset contracts | §Data Model |
| `src/telemetry/sqlite-usage-repository.ts` | Add | Schema migrations and atomic record/query/reset implementation | §SQLite Schema, §Write Flow |
| `src/telemetry/token-usage.ts` | Modify | Return accepted delta and stable cursor scope inputs | §Write Flow |
| `src/{state,server,config}.ts` | Modify | Inject repository, configure path/timezone, register routes, close once | §State Management |
| `src/api/{usage,daily-usage,reset-usage}.ts` | Add/Modify | Stable ingest, bounded aggregate read, confirmed reset | §API Contracts |
| `src/telemetry/{pricing-catalog,cost-estimator}.ts` | Add | Effective-dated exact model rates and immutable micro-USD result | §Cost Model |
| `src/adapters/*`, `packages/cli/src/hooks.ts` | Modify/Add | Verified per-product usage normalization and stable IDs | §Collector Contracts |
| `ui/src/lib/{navigation,types,route,shortcuts}.ts` | Modify | Seventh route, shortcut 1-7, range serialization | §UI Contract |
| `ui/src/components/views/UsageView.tsx` | Add | Aggregate comparison and all real states | §UI Contract |
| `ui/src/components/views/Overview.tsx` | Modify | Remove graph and make Live span available width | §UI Contract |
| `ui/src/components/ActivityGraph.tsx` | Delete | Remove redundant section | §UI Contract |

## Code Architecture & Design Patterns

- **Ports and Adapters:** `TokenUsageRepository` isolates SQLite from normalization, state, APIs, and UI.
- **Repository:** usage history is manipulated through product/session/date operations, not SQL outside the adapter.
- **Unit of Work:** measurement identity, delta, cursor, session total, and daily total commit atomically.
- **Idempotency Key:** `(product, sessionHash, measurementId)` protects replay across restart.
- **CQRS-lite:** transactional write model stores measurements/cursors; materialized daily rows serve bounded comparison queries.
- **Value Objects:** `CodingAgentProduct`, `LocalUsageDate`, `MicroUsd`, and `PricingVersion` constrain cross-provider semantics.
- **Graceful Degradation:** unsupported payloads leave telemetry unavailable without breaking tool-event ingestion.

## Data Model & Interfaces

```typescript
type CodingAgentProduct = 'kimi' | 'claude' | 'codex' | 'opencode' | 'agy';
type UsageAvailability = 'measured' | 'partial' | 'unavailable';
type CostQuality = 'reported' | 'estimated' | 'mixed' | 'unavailable';
type UsageWriteStatus = 'accepted' | 'duplicate' | 'stale' | 'invalid' | 'reset-filtered';

interface AcceptedUsageDelta extends TokenUsageCounts {
  product: CodingAgentProduct;
  model?: string;
  capturedAt: number;
  measurementId: string;
  sessionHash: string;
  cursorKey: string;
  quality: 'measured' | 'estimated';
}

interface PersistUsageInput {
  product: CodingAgentProduct;
  sessionId: string;
  cursorKey: string;
  measurement: TokenUsageMeasurement;
  reportedCostMicrousd?: number;
}

interface PersistUsageResult {
  status: UsageWriteStatus;
  delta?: TokenUsageCounts;
  sessionUsage?: ClientTokenUsage;
  localDate?: string;
}

interface ProductUsageRow {
  product: CodingAgentProduct;
  date: string | null;
  tokenUsage: TokenUsageCounts | null;
  availability: UsageAvailability;
  measurementCount: number;
  estimatedCostUsd: number | null;
  costQuality: CostQuality;
  pricedTokens: number;
  totalTokens: number | null;
  lastMeasurementAt: number | null;
}

interface UsageComparisonResponse {
  generatedAt: number;
  range: { from: string; to: string; timeZone: string };
  products: ProductUsageRow[];
  daily: ProductUsageRow[];
}

interface TokenUsageRepository {
  record(input: PersistUsageInput): PersistUsageResult;
  getSessionUsage(product: CodingAgentProduct, sessionId: string): ClientTokenUsage | undefined;
  queryDaily(query: { from: string; to: string }): UsageComparisonResponse;
  reset(products?: CodingAgentProduct[], at?: number): { deletedMeasurements: number };
  close(): void;
}
```

`tokenUsage: null` means no telemetry. A measured zero is represented by non-null zero counts. Session IDs are SHA-256 hashed with a product prefix before persistence; raw session IDs and workspace paths do not enter SQLite.

## SQLite Schema

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at_ms INTEGER NOT NULL
);

CREATE TABLE telemetry_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE token_cursors (
  product TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  cursor_key TEXT NOT NULL,
  captured_at_ms INTEGER NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER NOT NULL,
  cache_write_tokens INTEGER NOT NULL,
  reasoning_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  PRIMARY KEY (product, session_hash, cursor_key)
);

CREATE TABLE token_measurements (
  id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  measurement_id TEXT NOT NULL,
  cursor_key TEXT NOT NULL,
  model TEXT,
  captured_at_ms INTEGER NOT NULL,
  local_date TEXT NOT NULL,
  quality TEXT NOT NULL,
  delta_input_tokens INTEGER NOT NULL,
  delta_output_tokens INTEGER NOT NULL,
  delta_cache_read_tokens INTEGER NOT NULL,
  delta_cache_write_tokens INTEGER NOT NULL,
  delta_reasoning_tokens INTEGER NOT NULL,
  delta_total_tokens INTEGER NOT NULL,
  cost_microusd INTEGER,
  cost_quality TEXT NOT NULL,
  pricing_version TEXT,
  UNIQUE (product, session_hash, measurement_id)
);

CREATE TABLE session_usage (
  product TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER NOT NULL,
  cache_write_tokens INTEGER NOT NULL,
  reasoning_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  measurement_count INTEGER NOT NULL,
  last_measurement_at_ms INTEGER NOT NULL,
  PRIMARY KEY (product, session_hash)
);

CREATE TABLE daily_usage (
  local_date TEXT NOT NULL,
  product TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER NOT NULL,
  cache_write_tokens INTEGER NOT NULL,
  reasoning_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  measurement_count INTEGER NOT NULL,
  priced_tokens INTEGER NOT NULL,
  cost_microusd INTEGER NOT NULL,
  reported_cost_count INTEGER NOT NULL,
  estimated_cost_count INTEGER NOT NULL,
  last_measurement_at_ms INTEGER NOT NULL,
  PRIMARY KEY (local_date, product)
);

CREATE TABLE usage_reset_watermarks (
  product TEXT PRIMARY KEY,
  reset_at_ms INTEGER NOT NULL
);
```

Add indexes on `token_measurements(local_date, product)`, `(product, captured_at_ms)`, and `(product, session_hash, captured_at_ms)`. Enable foreign keys, WAL mode, and a bounded busy timeout. Migrations are transactional and advance only after all statements succeed.

## API Contracts

```typescript
// Existing endpoint, extended with caller-stable identity.
interface IngestUsageRequest {
  session_id: string;
  source: CodingAgentProduct;
  model?: string;
  timestamp?: number;
  measurement_id?: string;
  semantics?: 'delta' | 'cumulative';
  cost_usd?: number;
  usage: Record<string, unknown>;
}

// GET /api/usage/daily?from=YYYY-MM-DD&to=YYYY-MM-DD
// Missing dates default to the inclusive last 30 local dates.
type DailyUsageResponse = UsageComparisonResponse;

// POST /api/usage/reset
interface ResetUsageRequest {
  products?: CodingAgentProduct[];
  confirmation: 'RESET';
}
```

Daily requests reject invalid dates, inverted ranges, unknown parameters/products, or spans over 366 days with a typed 400. Reset requires same-origin loopback Host policy and exact confirmation. API errors never expose the database path, SQL, session hashes, or raw provider data.

## Write Flow

1. Adapter or ingestion API validates and normalizes a measurement.
2. Derive product, SHA-256 session hash, stable measurement ID, and counter-stream cursor key.
3. Start one immediate transaction and check reset watermark plus unique measurement identity.
4. For cumulative counters, load the durable cursor; reject older/equal timestamps, subtract a newer snapshot, or begin a new epoch when counters decrease.
5. Estimate/report cost from the accepted delta and capture the pricing version.
6. Insert the accepted delta, advance the cursor, and upsert session and daily aggregates.
7. Commit; only then update the live session aggregate and broadcast.
8. If a usage write fails, external ingestion returns 503; tool lifecycle events continue without token mutation and emit a sanitized diagnostic.

Midnight does not reset cursors. The accepted delta belongs to `capturedAt`'s pinned local date.

## Collector Contracts

| Product | Primary source | Semantics and stable identity | Unavailable behavior |
|---------|----------------|-------------------------------|----------------------|
| Codex | Direct hook usage or bounded session JSONL token-count record | Cumulative; session + provider record identity/captured time/count tuple | Preserve tool event; show unavailable |
| Kimi | Direct usage, all contained `wire.jsonl` streams, or external ingest | Cumulative per wire stream; include canonical wire identity | Mark partial if only a subset of streams can be read |
| Claude | Direct hook usage or bounded contained transcript tail with sanitized fixtures | Delta per assistant message; transcript message/request ID | Fail open; no text-based estimate |
| OpenCode | Generated plugin message/step completion events | Delta; stable session + message/part ID; prefer reported cost | Keep generic ingest fallback |
| AGY | `AfterModel`/model-response usage metadata | Delta per final response/step; conversation + step/response ID | Ignore chunks without positive final usage |

Every reader bounds file size/tail length, validates containment, skips malformed records, and returns only normalized numeric metadata. Raw lines and payloads are never returned, logged, or persisted.

## Cost Model

`pricing-catalog.ts` contains exact model aliases, effective dates, USD-per-million rates, cache rules, and a catalog version. Initial estimates cover only models verified from official provider pricing on 2026-08-10. OpenAI GPT-5.6 Sol/Terra/Luna and supported Anthropic model families are eligible; Kimi, Gemini, unknown aliases, subscription plans, and negotiated tiers remain unavailable unless the upstream event reports cost.

- Store integer micro-USD, round once per accepted measurement, and convert to decimal USD only at the API boundary.
- Prefer provider-reported cost over catalog estimation.
- Cache reads/writes use explicit rates only when the measurement category and provider rule match.
- Reasoning tokens are not charged separately when they are a detail subset of output.
- Persist cost and `pricingVersion` with the measurement so later catalog updates do not rewrite history.
- `pricedTokens < totalTokens` yields partial coverage; the UI must not label the sum complete.

## UI Contract

- Canonical order: Overview, Sessions, Timeline, Files, Skills, Usage, Settings; shortcuts become 1-7.
- `Usage` is aggregate across all sessions and ignores selected-session changes. Hide the TopBar session selector on this view while preserving selection for return.
- Default range is 30 local dates; non-default route state serializes `range=7d|90d|all`.
- Structure: visible `h1`, scope/timezone description, range and refresh controls, summary strip, ranked product comparison, per-product daily trend, exact accessible table, and manual reset action.
- Show total/input/output/cache read/cache write/reasoning where reported. Never derive total by summing overlapping categories.
- All five products appear. Products with telemetry rank by total; unavailable products follow with `No telemetry`, not zero.
- Cost labels read `Estimated API-equivalent USD`; unknown is `Unavailable`; mixed coverage is `Partial estimate` with coverage.
- Loading uses shape-matched skeleton and `aria-busy`; empty explains that no persisted measurement exists; initial error provides Retry; refresh error retains stale data; partial data renders with a non-blocking warning.
- Tables use captions/scoped headers and remain horizontally scrollable with date/product context. Charts use labels/markers in addition to color and have a text/table equivalent.
- Controls meet 44px mobile targets, status is announced appropriately, and effective reduced motion disables nonessential transitions.
- Remove Overview's ActivityGraph and let Live use the freed width; retain the Skills view and ActiveSkillPanel.

## Edge Case & Error Handling Matrix

| Scenario / Input | Expected Behavior | Result |
|------------------|-------------------|--------|
| Duplicate measurement after restart | Unique identity rejects replay without changing cursor/totals | `duplicate` |
| Older cumulative snapshot | Do not move cursor backward or aggregate | `stale` |
| Cumulative counter decreases | Start a new counter epoch and count the new snapshot once | `accepted` |
| Snapshot spans local midnight | Delta belongs to newer snapshot's capture date | `accepted`, documented attribution |
| Invalid/unknown timezone override | Fail startup with a safe configuration error | No database mutation |
| Unknown model price | Persist tokens with null cost | `costQuality: unavailable` |
| Mixed priced/unpriced measurements | Sum known micro-USD and expose partial coverage | `costQuality: mixed` |
| Product emits events but no tokens | Product remains `unavailable`, never zero | Non-error response |
| Measured zero counter | Return non-null zero counts | `measured` |
| SQLite busy/write failure | Roll back all usage tables; external request gets 503 | No partial aggregate |
| Reset followed by old cumulative snapshot | Watermark/cursor prevents pre-reset usage reappearing | History remains empty |
| Invalid date/range over 366 days | Reject before querying | Typed 400 |
| Refresh fails after success | Retain last data and mark stale | Retry available |

## State Management & Caching

SQLite is authoritative for usage identity and history; `StateStore` remains authoritative for live sessions/events. `daily_usage` is a transactionally maintained read model, not a browser cache. The Usage hook aborts superseded requests and retains the last successful response during refresh failures. No Usage response is stored in `localStorage`.

Server shutdown is idempotent: stop accepting HTTP, finish in-flight handlers, close WebSockets, checkpoint/close SQLite once, and share a single shutdown promise for explicit stop, SIGINT, and SIGTERM.

## Performance Considerations

- Daily queries read at most 366 × 5 materialized rows for finite ranges.
- Writes use prepared statements and one short transaction per accepted measurement.
- WAL and a bounded busy timeout support concurrent reads without hiding lock failures.
- Unlimited retention stores normalized numeric rows only; indexes support history/reset operations.
- Usage UI fetches only on route/range/refresh changes, never selected-session changes.

## Security Considerations

- Persist no prompt, response, command, tool input/output, transcript line, workspace path, API key, credential, or raw usage object.
- Hash session IDs before persistence and exclude hashes from API responses.
- Validate all counts as bounded safe non-negative integers and all costs as bounded non-negative finite values before converting to micro-USD.
- Apply ADR 005 Host/origin policy and bounded body limits to daily/reset APIs.
- Database errors are sanitized; schema and filesystem paths never reach clients.
- Repository tests insert sentinel secrets/paths into surrounding payloads and assert they do not appear in any SQLite text column.
