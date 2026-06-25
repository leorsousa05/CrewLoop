# CrewLoop Dashboard

Real-time skill dashboard for CrewLoop agents. It shows which skill an agent is currently running, the tools it invokes, and a live event timeline — all in a browser.

## Features

- Live skill inference from agent tool usage.
- WebSocket updates with in-memory session state.
- Sanitized event stream: no commands, secrets, or file contents reach the UI.
- Dark/light mode and reduced-motion support.
- Session selector for multi-agent monitoring.
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

Agents send JSON events to `POST http://127.0.0.1:7890/event`. The included shim (`dist/adapters/shim.js`) normalizes Kimi and Codex hook payloads and forwards them.

See `config-examples/` for:
- `kimi-code-config.toml` — Kimi Code hook configuration.
- `codex-hooks.json` — Codex CLI hook configuration.
- `opencode-plugin/crewloop-dashboard.js` — OpenCode plugin example.

### Event schema

```typescript
interface DashboardEvent {
  id: string;
  timestamp: number;
  source: 'kimi' | 'codex' | 'opencode' | 'log-watcher';
  session_id: string;
  event_type: 'session_start' | 'session_end' | 'tool_start' | 'tool_end' | 'skill_change';
  skill?: string;
  tool?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
}
```

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
