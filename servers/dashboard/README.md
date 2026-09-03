# CrewLoop Dashboard

Real-time skill dashboard for CrewLoop agents. It shows which skill an agent is currently running, the tools it invokes, and a live event timeline — all in a browser.

## Features

- Live skill inference from agent tool usage.
- WebSocket updates with in-memory live session state and durable SQLite usage history.
- Sanitized event stream: no commands, secrets, or file contents reach the UI.
- Vercel-style command-center layout with a persistent sidebar and top bar.
- Global command palette (`Cmd/Ctrl+K`) for jumping to views, sessions, skills, tools, files, and events.
- Seven views:
  - **Overview** — selected-session health, telemetry, live tool activity, and recent sessions.
  - **Sessions** — sortable, filterable, pinnable session list.
  - **Timeline** — reverse-chronological events with filters, export, and copy.
  - **Files** — two-pane file activity with operation badges, syntax highlighting, and diff/content snippets.
  - **Skills** — aggregate skill/tool/file usage for the selected session.
  - **Usage** — daily token and estimated API-equivalent cost comparison across coding-agent products.
  - **Settings** — theme, density, reduced motion, auto-follow, and max-events preferences.
- **Dynamic Multi-Session Workspaces:** Paths and git operations resolve relative to each session's dynamic working directory/workspace root.
- **Auto-Root Inference:** Automatically reconstructs the repository root using `.git` or `package.json` lookups when CWD metadata is absent.
- **Syntax Highlighting:** Zero-dependency lexical token-based syntax highlighting for common language constructs in diff and code views.
- **Bypass Traversal Security:** Restricts filesystem reading to the session's workspace root, permitting access to external files (like global skills in `~/.agents`) only if they are actively registered in the session's execution history.
- **Bundle Chunk-Splitting:** Custom Rollup chunk splitting keeps shared React and icon dependencies out of the main entry chunk.
- Advanced filters by source, skill, status, time window, tool, and operation type.
- Session pinning with localStorage persistence.
- JSON export of the visible timeline or file events.
- Copy a single event to the clipboard.
- Dark/light mode and reduced-motion support.
- `crewloop dashboard` CLI command.

## Quick start

### From the CrewLoop repository

```bash
cd servers/dashboard
npm install
npm run build
npm start
```

Open `http://127.0.0.1:7890`.

### UI and backend development mode (hot-reloading)

To run a full-stack development environment where both the frontend (Vite dev server) and the backend (TypeScript Node server) automatically rebuild and restart on changes, run these in separate terminals:

```bash
# Terminal 1: Watch compile the backend
cd servers/dashboard
npm run dev:server

# Terminal 2: Auto-restart backend server
cd servers/dashboard
npm run dev:start

# Terminal 3: Vite dev server for UI
cd servers/dashboard
npm run dev
```

In dev mode the backend runs on `CREWLOOP_DASHBOARD_PORT` (`7890` by default) and Vite serves the UI on its own port, proxying `/event` and `/ws` to the backend.

### From the CrewLoop CLI

```bash
crewloop dashboard
# or
crewloop dashboard --port 8080 --host 0.0.0.0
```

The CLI looks for the dashboard server inside the `@archznn/crewloop-skills` package under `servers/dashboard`. Build it first if it is not present.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CREWLOOP_DASHBOARD_PORT` | `7890` | HTTP/WebSocket port |
| `CREWLOOP_DASHBOARD_HOST` | `127.0.0.1` | Bind address |
| `CREWLOOP_TELEMETRY_DB_PATH` | `~/.crewloop/dashboard/telemetry.sqlite` | Path for the local SQLite usage database |
| `CREWLOOP_TELEMETRY_TIME_ZONE` | System IANA time zone | Calendar time zone used to assign measurements to days |

## Agent integration

Agents send JSON events to `POST http://127.0.0.1:7890/event`. The included shim (`dist/adapters/shim.js`) normalizes Kimi, Claude, Codex, AGY, and OpenCode payloads and forwards them. Tool events are classified (`read`/`edit`/`other`), the affected file path is extracted into `detail`, and input/output payloads are sanitized (secrets removed, base64 blobs truncated) before leaving the shim.

See `config-examples/` for:
- `kimi-code-config.toml` — Kimi Code hook configuration.
- `codex-hooks.json` — Codex CLI hook configuration.
- `opencode-plugin/crewloop-dashboard.js` — OpenCode plugin example.

### Event schema

```typescript
interface DashboardEvent {
  id: string;
  timestamp: number;
  source: 'kimi' | 'claude' | 'codex' | 'opencode' | 'log-watcher' | 'agy';
  session_id: string;
  event_type: 'session_start' | 'session_end' | 'tool_start' | 'tool_end' | 'skill_change';
  skill?: string;
  default_skill?: string;
  tool?: string;
  operationType?: 'read' | 'edit' | 'other';
  detail?: string;                      // affected file path for read/edit tools
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
  token_usage?: TokenUsageMeasurement; // normalized counters; raw provider data is not persisted
  input?: Record<string, unknown>;      // sanitized tool input
  output?: Record<string, unknown>;     // sanitized tool output (tool_end only)
  workspacePath?: string;               // current working directory or workspace path of the agent
}
```

## Usage telemetry

The **Usage** view compares Codex, Kimi, Claude, OpenCode, and AGY by product. It defaults to the current local day plus the previous 29 days and also offers 7-day, 90-day, and all-history ranges. Token totals are authoritative; missing telemetry is shown as unavailable rather than as zero.

Accepted measurements are written to SQLite before the live session total changes. The store de-duplicates replayed measurements, keeps cumulative-counter cursors across dashboard restarts, and attributes each accepted delta to the configured local calendar day. History has no automatic retention limit. Use the reset control in the Usage view to clear all products, or call the local API with exact confirmation:

```bash
curl -X POST http://127.0.0.1:7890/api/usage/reset \
  -H "Content-Type: application/json" \
  -d '{"confirmation":"RESET"}'
```

The daily query API is `GET /api/usage/daily`. With no query it returns 30 days; `from=YYYY-MM-DD&to=YYYY-MM-DD` accepts at most 366 inclusive days, and `range=all` returns all retained history. `POST /ingest/usage` accepts an optional stable `measurement_id`. Delta measurements without one must include a timestamp; otherwise they are rejected because a retry could be counted twice. Cumulative measurements without an explicit ID receive a deterministic identity derived from their normalized counters.

Monetary values are labelled **Estimated API-equivalent USD**. Provider-reported cost takes precedence; otherwise the server uses an effective-dated exact-model price catalog. The catalog records whether each model's input count includes or excludes cache categories, so provider-specific cache semantics are preserved. Unknown or partially priced models remain unavailable or partial, never `$0`. These estimates do not represent subscriptions, seats, negotiated discounts, taxes, or the provider invoice.

| Product | Usage source | Coverage behavior |
|---------|--------------|-------------------|
| Codex | Direct hook counters or bounded local session transcript tail | Stable cumulative measurement per session |
| Kimi | Direct counters or all contained `wire.jsonl` usage streams | Each wire has an independent durable cursor; unreadable discovered streams make coverage partial |
| Claude | Direct counters or bounded contained assistant transcript records | Exclusive cache categories are included in the normalized total; unavailable when no verified counters exist |
| OpenCode | Final assistant message event | Uses stable message identity and provider-reported cost when supplied |
| AGY | `AfterModel` response metadata | Unavailable when final positive usage metadata is absent |

## Continuous token benchmark

The fixed benchmark compares the baseline and candidate CrewLoop optimization policies across six synthetic scenarios. It validates policy identity, scenario coverage, token measurement quality, execution metrics, and required quality gates before returning `adopt_candidate` or `keep_baseline`.

Verified host execution records can be projected into the existing benchmark-run contract with the provider-neutral `projectTaskExecutionRecord` adapter. Records without verified token usage, duration, or tool-call measurements return a bounded unavailable result and are not converted into synthetic zeroes.

Use `buildTokenBenchmarkDatasetFromExecutionRecords` to collect a local batch of validated execution records into a benchmark dataset. The collector preserves input order, lets the existing dataset validator handle identical or conflicting duplicates, and returns every unavailable record index without exposing a partial dataset. Baseline/candidate coverage and adoption decisions remain the responsibility of the existing corpus comparator.

The CLI can consume those collections directly. Each `--baseline-records` or `--candidate-records` file must contain a `label`, a `{ "id", "version" }` policy, a known `source`, and a `records` array of `TaskExecutionRecord` values:

```json
{
  "label": "execution-candidate",
  "policy": { "id": "token-optimizer", "version": "candidate-v1" },
  "source": "codex",
  "records": []
}
```

Run the record mode from the repository root with:

```bash
npm run benchmark:tokens --workspace=@archznn/crewloop-dashboard -- \
  --baseline-records path/to/baseline-records.json \
  --candidate-records path/to/candidate-records.json \
  --format markdown
```

The two record files must be supplied together. Missing required measurements fail closed with record indexes and reason codes; no partial dataset or synthetic zero is compared.

Run the same gate used by CI from the repository root:

```bash
npm run benchmark:tokens --workspace=@archznn/crewloop-dashboard -- \
  --baseline src/telemetry/fixtures/baseline.json \
  --candidate src/telemetry/fixtures/candidate.json \
  --format markdown
```

A successful command exits with code `0` and reports `adopt_candidate`. To verify the negative path, replace `candidate.json` with `candidate-fail.json`; it must report `keep_baseline` and exit with code `1`. The benchmark only recommends adoption: it never activates or persists a policy automatically.

The database contains normalized numeric counts, product/model metadata, timestamps, immutable cost snapshots, and hashed session identifiers. It never stores prompts, commands, tool input/output, transcript lines, raw usage JSON, filesystem paths, or credentials.

## UI shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `1`–`7` | Switch to a view by sidebar position |
| `Esc` | Close command palette or clear focus |

## Filters

The shared filter bar appears on list and graph views. You can filter by:

- **Source** — `kimi`, `claude`, `codex`, `opencode`, `agy`, or `log-watcher`.
- **Skill** — active skill names observed in the selected session.
- **Status** — `running`, `success`, `error`.
- **Tool** — individual tool names.
- **Operation type** — `read`, `edit`, `other`.
- **Time range** — `1m`, `5m`, `15m`, `1h`, `24h`, `session`, or `all`.

The visible result count is shown next to the filter bar.

## Settings

Settings are persisted to `localStorage` under `crewloop-dashboard-settings`:

- **Theme** — `system`, `dark`, or `light`.
- **Density** — `comfortable` or `compact` list sizing.
- **Reduced motion** — disables animations (also respects OS preference).
- **Auto-follow active session** — automatically selects the running session.
- **Max events per session** — caps the event history kept in memory.

## Security

- The server binds to `127.0.0.1` by default.
- Secret-bearing keys (`token`, `api_key`, `password`, `authorization`, `credentials`, etc.) are recursively stripped from tool input/output payloads before storage and broadcast.
- Long base64 blobs and oversized strings are truncated; keys the UI renders (`content`, `diff`, `snippet`, file paths, queries) are preserved up to a hard length cap.
- Events containing dangerous top-level keys are rejected.
- Sanitization is applied both in the shim and again at the `/event` boundary (defense in depth for events posted directly).
- Usage history endpoints enforce the same local Host policy as other sensitive APIs.
- Persistent telemetry is minimized to normalized numeric facts and hashed correlation identifiers; raw agent content is never written to SQLite.

## Development

```bash
npm run typecheck
npm run build
npm test
```

To reproduce the automated browser checkpoint from the acceptance matrix, run the production server and connect the preflight to an already-running local Chrome CDP endpoint:

```bash
npm run acceptance:browser -- --url http://127.0.0.1:7890/ --cdp http://127.0.0.1:9229
```

The command creates an isolated browser target, emits one JSON result for each of the 112 supported combinations, and exits non-zero on render, overflow, or accessible-name failures. It is automated evidence only; the manual screen-reader and visual walkthrough remains required.

## Known limitations

- **Session lifecycle on forced kills** — if an agent process is killed with `SIGKILL` (or crashes hard), it never emits `SessionEnd`. The server compensates with an idle timeout (`CREWLOOP_SESSION_IDLE_TIMEOUT_MS`, default 10 minutes): sessions with no activity for that window are marked as ended. Until the timeout fires, the session still shows as running.
- **Lazy session start** — agents that never emit an explicit `SessionStart` get one synthesized from their first event. The synthesized start carries the timestamp of that first event, so time spent before the first tool call is not visible.
- **Diff/snippet size limits** — payload sanitization truncates strings above 8 000 characters and base64-looking blobs above 512 characters. Large diffs therefore render truncated in the Files view, with a `…[truncated N chars]` marker.
- Codex file-edit hooks do not always expose the tool name; in those cases skill inference falls back to the session's previous active skill.
- The log watcher adapter is a deferred fallback and not yet implemented.
- Token coverage depends on each product exposing verified usage counters. The Usage view labels missing or incomplete sources instead of inferring tokens from prompts or tool activity.
- Estimated API-equivalent USD is only available for provider-reported costs or exact models in the versioned price catalog; it is not an invoice or subscription-cost calculation.
