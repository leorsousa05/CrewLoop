# Design: AGY dashboard adapter and hook config alignment

## Overview

Make AGY a fully supported dashboard source by aligning its hook registration with the Antigravity docs and by teaching the dashboard shim how to parse the AGY payload.

## Directory & file structure

```
packages/cli/
├── src/
│   ├── agents.ts            (Modified: AGY config path, event names)
│   └── hooks.ts             (Modified: AgyHookWriter extends CodexHookWriter)
servers/dashboard/
├── src/
│   ├── types.ts             (Modified: AgentSource includes 'agy')
│   ├── adapters/
│   │   ├── agy.ts           (New: normalizeAgy)
│   │   ├── agy.test.ts      (New)
│   │   ├── shim.ts          (Modified: detectSource, normalizePayload, usage message)
│   │   ├── shim.test.ts     (Modified: AGY cases)
│   │   └── tests/shim.test.ts (Modified: usage string)
specs/
├── changes/012-agy-dashboard-adapter/
│   ├── .spec.yaml
│   ├── proposal.md
│   ├── design.md
│   ├── specs/
│   │   ├── cli/spec.md
│   │   └── dashboard/spec.md
│   └── tasks.md
└── living/
    ├── cli/spec.md          (Updated)
    └── dashboard/spec.md    (New)
```

## Code architecture

### CLI hook registration

- `agents.ts`: AGY metadata now points to `~/.gemini/config/hooks.json` and uses `PreToolUse` / `PostToolUse`.
- `hooks.ts`: `AgyHookWriter` extends `CodexHookWriter` so AGY gets the same matcher-array JSON format as Codex without duplicating writer logic.

### Dashboard normalization

- `adapters/agy.ts` exposes `normalizeAgy(payload)`.
- Event mapping:
  - `PreToolUse` → `tool_start`
  - `PostToolUse` → `tool_end`
  - `SessionStart` → `session_start`
  - `Stop` → `session_end`
- Tool resolution: `payload.toolName ?? payload.toolCall?.name`.
- Session id resolution: `payload.sessionId ?? payload.session_id`.
- `adapters/shim.ts`:
  - `detectSource` accepts `agy`.
  - `normalizePayload` dispatches to `normalizeAgy`.
  - Usage error lists all supported sources.

## Contracts

```typescript
export interface AgyHookPayload {
  sessionId?: string;
  session_id?: string;
  hook_event_name?: string;
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  skill?: string;
}

export function normalizeAgy(payload: AgyHookPayload): DashboardEvent | undefined;
```

## Testing plan

- Unit tests for `normalizeAgy` covering all event mappings, tool-name precedence, session-id fallback, and unknown events.
- Shim tests for AGY source detection and `buildEvent` with both `toolName` and `toolCall` envelopes.
- CLI hooks test for AGY matcher-array output.
- Full CLI + dashboard test suite.
- Manual verification: `crewloop install` writes `~/.gemini/config/hooks.json` correctly and `crewloop-shim agy` normalizes a sample payload.

## Risk assessment

- **Risk:** existing AGY config files may contain stale malformed entries from earlier installs.
- **Mitigation:** `crewloop install` appends the correct matcher group; users can manually remove stale entries, and the correct group is idempotent.
