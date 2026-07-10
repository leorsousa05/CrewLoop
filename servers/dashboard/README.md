# CrewLoop Dashboard

Real-time skill dashboard for CrewLoop agents. It shows which skill an agent is currently running, the tools it invokes, and a live event timeline — all in a browser.

## Features

- Live skill inference from agent tool usage.
- WebSocket updates with in-memory session state.
- Sanitized event stream: no commands, secrets, or file contents reach the UI.
- Vercel-style command-center layout with a persistent sidebar and top bar.
- Global command palette (`Cmd/Ctrl+K`) for jumping to views, sessions, skills, tools, files, and events.
- Seven views:
  - **Overview** — session health, telemetry, activity graph, top skills/tools.
  - **Sessions** — sortable, filterable, pinnable session list.
  - **Timeline** — reverse-chronological events with filters, export, and copy.
  - **Network** — interactive 3D skill/tool/file graph.
  - **Files** — two-pane file activity with operation badges, syntax highlighting, and diff/content snippets.
  - **Skills** — aggregate skill/tool/file usage for the selected session.
  - **Settings** — theme, density, reduced motion, auto-follow, and max-events preferences.
- **Dynamic Multi-Session Workspaces:** Paths and git operations resolve relative to each session's dynamic working directory/workspace root.
- **Auto-Root Inference:** Automatically reconstructs the repository root using `.git` or `package.json` lookups when CWD metadata is absent.
- **Syntax Highlighting:** Zero-dependency lexical token-based syntax highlighting for common language constructs in diff and code views.
- **Bypass Traversal Security:** Restricts filesystem reading to the session's workspace root, permitting access to external files (like global skills in `~/.agents`) only if they are actively registered in the session's execution history.
- **Bundle Chunk-Splitting:** Custom Rollup chunk splitting for heavy 3D graphs and icons, keeping the main entry script lightweight (~213kB).
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

## Agent integration

Agents send JSON events to `POST http://127.0.0.1:7890/event`. The included shim (`dist/adapters/shim.js`) normalizes Kimi, Claude, Codex, and AGY hook payloads and forwards them. Tool events are classified (`read`/`edit`/`other`), the affected file path is extracted into `detail`, and input/output payloads are sanitized (secrets removed, base64 blobs truncated) before leaving the shim.

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
  input?: Record<string, unknown>;      // sanitized tool input
  output?: Record<string, unknown>;     // sanitized tool output (tool_end only)
  workspacePath?: string;               // current working directory or workspace path of the agent
}
```

## UI shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Esc` | Close command palette or clear focus |

## Filters

The shared filter bar appears on list and graph views. You can filter by:

- **Source** — `kimi`, `codex`, `opencode`, `log-watcher`.
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

## Development

```bash
npm run typecheck
npm run build
npm test
```

## Known limitations

- **Session lifecycle on forced kills** — if an agent process is killed with `SIGKILL` (or crashes hard), it never emits `SessionEnd`. The server compensates with an idle timeout (`CREWLOOP_SESSION_IDLE_TIMEOUT_MS`, default 10 minutes): sessions with no activity for that window are marked as ended. Until the timeout fires, the session still shows as running.
- **Lazy session start** — agents that never emit an explicit `SessionStart` get one synthesized from their first event. The synthesized start carries the timestamp of that first event, so time spent before the first tool call is not visible.
- **Diff/snippet size limits** — payload sanitization truncates strings above 8 000 characters and base64-looking blobs above 512 characters. Large diffs therefore render truncated in the Files view, with a `…[truncated N chars]` marker.
- Codex file-edit hooks do not always expose the tool name; in those cases skill inference falls back to the session's previous active skill.
- The log watcher adapter is a deferred fallback and not yet implemented.
