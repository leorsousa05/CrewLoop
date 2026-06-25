# Design: Real-time Skill Dashboard

## Architecture overview

The dashboard is a local runtime server that ingests agent activity, infers the active CrewLoop skill, and broadcasts state to a web UI. The architecture follows an **event-driven pipeline** with clear boundaries:

```
Agent layer
  ├─ Kimi Code hooks ──→ crewloop-shim
  ├─ Codex CLI hooks ──→ crewloop-shim
  ├─ OpenCode plugin ──→ event server (direct)
  └─ Log watcher ──────→ event server

Shim / adapters
  └─ Normalize + filter sensitive data

Event server
  ├─ POST /event
  ├─ State aggregation
  ├─ Skill inference
  └─ WebSocket broadcast

Dashboard UI
  └─ React/Vanilla SPA consuming WebSocket events
```

### Patterns used

- **Observer pattern:** WebSocket clients observe the event server state.
- **Strategy pattern:** Each agent has its own adapter strategy (hooks vs plugin vs log watcher).
- **Pipeline pattern:** events flow through normalization → filtering → aggregation → broadcast.
- **Fail-silent adapters:** hooks must never block or crash the agent.

## Bounded context

The dashboard is a new bounded context called **Runtime Observability**. It lives under `servers/dashboard/` alongside `servers/obsidian-mcp/`. It does not own skills, specs, or memory; it only observes and displays transient agent state.

## Directory structure

```
servers/dashboard/
├── package.json
├── tsconfig.json
├── README.md
├── bin/
│   └── crewloop-dashboard.js          # CLI entry point
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js                         # vanilla JS dashboard UI
├── src/
│   ├── index.ts                       # server bootstrap
│   ├── server.ts                      # HTTP + WebSocket server
│   ├── state.ts                       # in-memory session state
│   ├── config.ts                      # env/port/safety allowlist config
│   ├── types.ts                       # shared TypeScript contracts
│   ├── event-bus.ts                   # internal event emitter
│   ├── api/
│   │   ├── event.ts                   # POST /event handler
│   │   └── skills.ts                  # GET /api/skills handler
│   ├── skills/
│   │   ├── registry.ts                # load skill metadata from SKILL.md
│   │   ├── infer.ts                   # active skill inference
│   │   └── mapping.ts                 # tool → skill heuristic map
│   ├── adapters/
│   │   ├── shim.ts                    # generic stdin-based shim
│   │   ├── kimi.ts                    # Kimi Code hook normalizer
│   │   ├── codex.ts                   # Codex CLI hook normalizer
│   │   ├── opencode.ts                // OpenCode plugin normalizer
│   │   └── log-watcher.ts             // fallback log tail
│   └── filters/
│       └── sanitize.ts                // sensitive data filter
├── config-examples/
│   ├── kimi-code-config.toml          // snippet for ~/.kimi-code/config.toml
│   ├── codex-hooks.json               // snippet for ~/.codex/hooks.json
│   └── opencode-plugin/
│       └── crewloop-dashboard.js      // plugin file
└── tests/
    ├── shim.test.ts
    ├── state.test.ts
    ├── infer.test.ts
    └── sanitize.test.ts
```

## Core components

### 1. Event server (`src/server.ts`)

Responsibilities:
- Start an HTTP server on a configurable port (default `7890`).
- Attach a WebSocket server to the same HTTP instance.
- Route `POST /event` to the event handler.
- Route `GET /api/skills` to the skills handler.
- Serve static files from `public/`.
- Maintain a set of connected WebSocket clients.

Constraints:
- Bind to `127.0.0.1` by default.
- Accept a `CREWLOOP_DASHBOARD_PORT` env override.
- Reject events with malformed JSON (return 400, do not crash).

### 2. State aggregation (`src/state.ts`)

Responsibilities:
- Store sessions in memory keyed by `session_id`.
- Each session holds:
  - `active_skill?: string`
  - `events: DashboardEvent[]` (last N, e.g., 200)
  - `tool_counts: Record<string, number>`
  - `started_at: number`
  - `last_event_at: number`
  - `source: AgentSource`
- Emit a `session:updated` internal event on every change.

Interface:

```typescript
interface Session {
  id: string;
  source: AgentSource;
  active_skill?: string;
  events: DashboardEvent[];
  tool_counts: Record<string, number>;
  started_at: number;
  last_event_at: number;
}

type AgentSource = 'kimi' | 'codex' | 'opencode' | 'log-watcher';

interface DashboardState {
  sessions: Record<string, Session>;
}

class StateStore {
  constructor(options: { maxEventsPerSession: number });
  applyEvent(event: DashboardEvent): void;
  getSession(id: string): Session | undefined;
  getAllSessions(): Session[];
  pruneInactive(maxAgeMs: number): void;
}
```

### 3. Skill inference (`src/skills/infer.ts`)

Responsibilities:
- Detect explicit skill changes from `Skill` tool invocations.
- Fall back to heuristic tool-to-skill mapping when no explicit skill is active.
- Return `undefined` when confidence is low.

Interface:

```typescript
interface SkillInferenceResult {
  skill: string | undefined;
  confidence: 'explicit' | 'heuristic' | 'unknown';
}

class SkillInferenceEngine {
  constructor(skillRegistry: SkillRegistry, mapping: ToolToSkillMap);
  infer(event: DashboardEvent, session: Session): SkillInferenceResult;
}
```

Heuristic mapping (initial):

| Tool(s) | Inferred skill |
|---------|----------------|
| `Skill` invocation | explicit from `tool_input.skill` |
| `Task`, `Agent` | orchestrator / architect |
| `Read`, `Grep`, `Glob`, `WebSearch`, `FetchURL` | researcher |
| `Edit`, `Write`, `Bash` with build/test | engineer |
| `Bash` with git commit/branch/push | shipper |
| `mcp__github__*` | shipper |
| `Skill` tool with `reviewer` | reviewer |

### 4. Sanitization filter (`src/filters/sanitize.ts`)

Responsibilities:
- Receive raw agent payload and produce a safe `detail` string.
- Never forward `command`, `content`, `text`, `code`, `prompt`, `api_key`, `token`, `password`, `secret`.
- Allow only: `path`, `file_path`, `skill`, `subagent_type`, `url` (domain only).

Interface:

```typescript
interface SanitizeInput {
  tool_name: string;
  tool_input?: Record<string, unknown>;
  tool_response?: Record<string, unknown>;
}

interface SafeDetail {
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
}

function sanitize(input: SanitizeInput, event: 'pre' | 'post'): SafeDetail;
```

### 5. Shim (`src/adapters/shim.ts`)

Responsibilities:
- Read JSON from stdin.
- Detect the agent source from `process.argv[2]` or env var.
- Call the appropriate normalizer (`kimi.ts`, `codex.ts`, etc.).
- Sanitize and POST to `http://127.0.0.1:7890/event`.
- Exit 0 immediately (fire-and-forget).

Usage from hook:

```bash
crewloop-shim kimi
```

### 6. Agent normalizers

#### Kimi Code (`src/adapters/kimi.ts`)

Input shape from `~/.kimi-code/config.toml` hook stdin:

```json
{
  "hook_event_name": "PreToolUse",
  "session_id": "...",
  "cwd": "...",
  "tool_name": "Read",
  "tool_input": { "path": "README.md" }
}
```

Mapping:
- `PreToolUse` → `tool_start`
- `PostToolUse` → `tool_end`
- `SessionStart` → `session_start`
- `SessionEnd`/`Stop` → `session_end`

#### Codex CLI (`src/adapters/codex.ts`)

Input shape from `~/.codex/hooks.json` hook stdin:

```json
{
  "sessionId": "...",
  "toolName": "Bash",
  "toolInput": { "command": "ls" },
  "toolResponse": { "success": true, "durationMs": 12 }
}
```

Mapping:
- Normalize snake_case field names to the common schema.
- `PreToolUse` → `tool_start`
- `PostToolUse` → `tool_end`
- `SessionStart` → `session_start`
- `Stop` → `session_end`

#### OpenCode (`src/adapters/opencode.ts`)

The OpenCode plugin connects directly to the event server via `fetch` or `WebSocket`. It emits already-normalized events.

Plugin interface (OpenCode):

```typescript
export default async function ({ project, client }) {
  const serverUrl = process.env.CREWLOOP_DASHBOARD_URL || 'http://127.0.0.1:7890';
  return {
    'tool.execute.before': async ({ tool, args }) => {
      await postEvent(serverUrl, { event_type: 'tool_start', tool, detail: safeDetail(tool, args) });
    },
    'tool.execute.after': async ({ tool, args, duration, success }) => {
      await postEvent(serverUrl, { event_type: 'tool_end', tool, detail: safeDetail(tool, args), status: success ? 'success' : 'error', duration_ms: duration });
    },
  };
}
```

### 7. Log watcher fallback (`src/adapters/log-watcher.ts`)

Responsibilities:
- Tail known agent log files (e.g., `~/.kimi-code/logs/...`, `~/.codex/logs/...`).
- Parse JSON lines or structured text.
- Emit synthetic `DashboardEvent`s to the server.
- Run as a separate background process started by `crewloop dashboard --watch-logs`.

This is intentionally a last-resort adapter because it is brittle and delayed.

## Data flow

1. Agent executes a tool.
2. Hook/plugin fires and invokes the CrewLoop adapter.
3. Adapter normalizes payload to `DashboardEvent`.
4. Sanitizer extracts only safe detail fields.
5. Event is sent to `POST /event`.
6. Server applies event to `StateStore`.
7. `SkillInferenceEngine` updates `active_skill` if needed.
8. Server broadcasts updated session to all WebSocket clients.
9. UI re-renders.

## WebSocket protocol

On connection, the server sends:

```json
{
  "type": "snapshot",
  "payload": {
    "sessions": [...]
  }
}
```

On each state change, the server sends:

```json
{
  "type": "update",
  "payload": {
    "session_id": "...",
    "session": { ... }
  }
}
```

Clients send only optional subscription messages (not required for v1):

```json
{ "type": "ping" }
```

Server responds:

```json
{ "type": "pong" }
```

## API contracts

### `POST /event`

Request body: `DashboardEvent` (JSON).

Response:
- `200 OK` — event applied.
- `400 Bad Request` — malformed event.
- `503 Service Unavailable` — server shutting down.

### `GET /api/skills`

Response: array of skill metadata from `SKILL.md` frontmatter.

```json
[
  { "name": "orchestrator", "description": "...", "icon": "🎯" },
  { "name": "architect", "description": "...", "icon": "🏗️" }
]
```

## State management

- Server-side in-memory state is the single source of truth.
- UI is a thin reactive layer; it does not maintain authoritative state.
- Sessions are pruned after 24 hours of inactivity.
- Events per session are capped (e.g., 200) to prevent unbounded memory growth.

## Performance considerations

- Hook commands must exit quickly. The shim should not wait for the HTTP POST to complete before exiting; it should use `req.destroy()` after sending or spawn a detached child.
- WebSocket broadcast is O(clients) and expected to be < 10 clients locally.
- Skill registry is parsed once at server startup and cached.
- Sanitization is synchronous and must complete in < 1ms per event.

## Error handling

- Hook failures are swallowed; the agent never sees an error.
- Server logs adapter errors to stderr but does not crash.
- WebSocket disconnects are handled gracefully.
- Malformed events return 400 and are dropped.

## Testing plan

### Unit tests (required)

- `sanitize.test.ts` — verify that dangerous fields are stripped and safe fields are preserved.
- `infer.test.ts` — verify skill inference for explicit skill changes and heuristic mappings.
- `state.test.ts` — verify session creation, event capping, and pruning.
- `shim.test.ts` — verify each normalizer produces valid `DashboardEvent`s.

### Integration tests (required)

- Start server, connect WebSocket client, POST events, assert broadcast.
- Test each adapter with sample stdin payloads.

### Manual tests

- Install Kimi Code hooks and run a real session.
- Install OpenCode plugin and run a real session.
- Install Codex hooks and verify Bash events appear; document file edit gaps.

## Security design

- Default bind address: `127.0.0.1`.
- No CORS headers needed because origin is same-host.
- Allowlist-based sanitization is enforced in the shim and duplicated in the server (defense in depth).
- The server rejects events containing suspicious keys (`command`, `content`, `text`, etc.) at the boundary.
- No persistent storage of events by default.

## Open questions

1. Should the dashboard reuse the Docusaurus site styling or be a standalone page?
2. Should we expose a read-only embedded view inside the docs site later?
3. Do we need a CLI installer (`crewloop dashboard install`) to write hook configs automatically?

These are deferred to implementation or subsequent specs.
