# Dashboard Spec: Event sources and normalization

## Purpose

The CrewLoop dashboard accepts normalized events from multiple agent hook sources and presents them as a unified session view.

## Supported sources

| Source | Config format | Hook events |
|--------|---------------|-------------|
| `kimi` | TOML array-of-tables (`~/.kimi/config/config.toml`) | `PreToolUse` / `PostToolUse` |
| `claude` | JSON flat object (`~/.claude/config.json`) | `before_tool_use` / `after_tool_use` |
| `codex` | JSON matcher-array groups (`~/.codex/hooks.json`) | `PreToolUse` / `PostToolUse` |
| `agy` | JSON matcher-array groups (`~/.gemini/config/hooks.json`) | `PreToolUse` / `PostToolUse` |

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

AGY may send the tool name at the top level or inside a `toolCall` object:

```typescript
interface AgyHookPayload {
  sessionId?: string;
  session_id?: string;
  hook_event_name?: 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'Stop';
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  skill?: string;
}
```

The adapter resolves:

- `event_type` from `hook_event_name`.
- `tool` from `toolName ?? toolCall?.name`.
- `session_id` from `sessionId ?? session_id`.

## Security

The shim runs the raw payload through `sanitize()` before forwarding. Dangerous keys and verbose content are stripped so that agent data does not leak to the dashboard UI.
