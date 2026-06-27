---
sidebar_position: 2
---

# Dashboard

The CrewLoop Dashboard is a real-time browser UI that shows which skill an agent is currently running, the tools it invokes, and a live event timeline.

## Quick start

### Via the CLI (recommended)

```bash
crewloop dashboard
```

Open `http://127.0.0.1:7890`.

### From the source

```bash
cd servers/dashboard
npm install
npm run build
npm start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CREWLOOP_DASHBOARD_PORT` | `7890` | HTTP and WebSocket port |
| `CREWLOOP_DASHBOARD_HOST` | `127.0.0.1` | Bind address |

```bash
CREWLOOP_DASHBOARD_PORT=8080 crewloop dashboard
```

## Views

| View | What it shows |
|------|---------------|
| **Overview** | Session health, telemetry, activity graph, top skills and tools |
| **Sessions** | Sortable, filterable, pinnable session list |
| **Timeline** | Reverse-chronological events with filters and export |
| **Network** | Interactive 3D skill/tool/file relationship graph |
| **Files** | Two-pane file activity with operation badges and diff snippets |
| **Skills** | Aggregate skill/tool/file usage for the selected session |
| **Settings** | Theme, density, reduced motion, auto-follow, max-events |

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Esc` | Close command palette or clear focus |

## Agent integration

Agents send events to `POST http://127.0.0.1:7890/event`. The `crewloop-shim` binary normalizes hook payloads from each agent and forwards them automatically when installed via `crewloop install`.

### Event schema

```typescript
interface DashboardEvent {
  id: string;
  timestamp: number;
  source: 'kimi' | 'codex' | 'agy' | 'claude';
  session_id: string;
  event_type: 'session_start' | 'session_end' | 'tool_start' | 'tool_end' | 'skill_change';
  skill?: string;
  tool?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
}
```

## Security

- Binds to `127.0.0.1` by default.
- Strips dangerous keys (`command`, `content`, `token`, `api_key`) before storing or broadcasting events.
- Events containing dangerous top-level keys are rejected entirely.

## Development

```bash
cd servers/dashboard
npm run build:server   # compile the WebSocket backend
npm run dev            # Vite dev server for the UI
npm test               # run the test suite
```
