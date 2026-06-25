# Living Spec: CrewLoop Dashboard

## Purpose

The CrewLoop dashboard accepts normalized events from multiple agent hook sources and presents them as a unified real-time session view.

## Supported sources

| Source | Config format | Hook events |
|--------|---------------|-------------|
| `kimi` | TOML array-of-tables (`~/.kimi/config/config.toml`) | `PreToolUse` / `PostToolUse` |
| `claude` | JSON flat object (`~/.claude/config.json`) | `before_tool_use` / `after_tool_use` |
| `codex` | JSON matcher-array groups (`~/.codex/hooks.json`) | `PreToolUse` / `PostToolUse` |
| `agy` | JSON matcher-array groups (`~/.gemini/config/hooks.json`, fallback `~/.gemini/antigravity-cli/hooks.json`) | `PreToolUse` / `PostToolUse` |

The `crewloop-shim` binary dispatches on the source name passed as the first positional argument:

```bash
crewloop-shim <kimi|codex|agy|opencode|log-watcher> --default-skill orchestrator
```

For sources whose payloads do not include the event name (such as AGY), the event type can be forced with `--event-type`:

```bash
crewloop-shim agy --default-skill orchestrator --event-type tool_start
```

## Normalization

Each source adapter converts its native payload into `DashboardEvent`:

```typescript
export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType; // session_start | session_end | tool_start | tool_end
  tool?: string;
  skill?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
}
```

### AGY payload

AGY sends the tool name at the top level or inside a `toolCall` object. It does not include a `hook_event_name` field, so the shim uses the `--event-type` argument from the hook command:

```typescript
interface AgyHookPayload {
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  skill?: string;
}
```

The adapter resolves:

- `event_type` from the shim's `--event-type` argument (defaults to `tool_end`).
- `tool` from `toolName ?? toolCall?.name`.
- `session_id` from `sessionId ?? session_id ?? conversationId`.

## Security

The shim runs the raw payload through `sanitize()` before forwarding. Dangerous keys and verbose content are stripped so that agent data does not leak to the dashboard UI.

## Implementation notes

- Source adapters live in `servers/dashboard/src/adapters/`.
- Shared normalization and HTTP forwarding live in `servers/dashboard/src/adapters/shim.ts`.
- The dashboard server listens on `http://127.0.0.1:7890` by default and exposes `POST /event` plus a WebSocket for live updates.
