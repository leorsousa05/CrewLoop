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
  - **Files** — two-pane file activity with operation badges and diff/content snippets.
  - **Skills** — aggregate skill/tool/file usage for the selected session.
  - **Settings** — theme, density, reduced motion, auto-follow, and max-events preferences.
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

### UI development mode

```bash
cd servers/dashboard
npm install
npm run build:server   # compile the WebSocket backend once
npm run dev            # Vite dev server (serves the UI and proxies API/WebSocket to the backend)
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

Agents send JSON events to `POST http://127.0.0.1:7890/event`. The included shim (`dist/adapters/shim.js`) normalizes Kimi, Codex, and AGY hook payloads and forwards them.

See `config-examples/` for:
- `kimi-code-config.toml` — Kimi Code hook configuration.
- `codex-hooks.json` — Codex CLI hook configuration.
- `opencode-plugin/crewloop-dashboard.js` — OpenCode plugin example.

### Event schema

```typescript
interface DashboardEvent {
  id: string;
  timestamp: number;
  source: 'kimi' | 'codex' | 'agy' | 'opencode' | 'log-watcher';
  session_id: string;
  event_type: 'session_start' | 'session_end' | 'tool_start' | 'tool_end' | 'skill_change';
  skill?: string;
  tool?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
}
```

## UI shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Esc` | Close command palette or clear focus |

## Filters

The shared filter bar appears on list and graph views. You can filter by:

- **Source** — `kimi`, `codex`, `agy`, `opencode`, `log-watcher`.
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
- Dangerous keys (`command`, `content`, `token`, `api_key`, etc.) are stripped before storage and broadcast.
- Events containing dangerous top-level keys are rejected.

## Development

```bash
npm run typecheck
npm run build
npm test
```

## Known limitations

- Codex file-edit hooks do not always expose the tool name; in those cases skill inference falls back to the session's previous active skill.
- The log watcher adapter is a deferred fallback and not yet implemented.
