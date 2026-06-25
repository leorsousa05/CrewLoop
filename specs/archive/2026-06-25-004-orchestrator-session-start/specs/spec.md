# Spec Delta: Orchestrator Skill Session Start

## Current System State

The dashboard creates a session in `StateStore.applyEvent()` when any event with a new `session_id` arrives. The session's `active_skill` is initially `undefined` until the inference engine derives it from a tool event.

The `orchestrator` skill (`skills/orchestrator/SKILL.md`) contains instructions for discovery and routing, but it does not mention dashboard lifecycle. When a user starts a conversation with the orchestrator skill loaded, no event reaches the dashboard until the agent executes its first tool.

The shim (`servers/dashboard/src/adapters/shim.ts`) reads agent payloads from stdin and forwards normalized events. It currently ignores any explicit `skill` field in the payload and relies entirely on the dashboard inference engine.

## Changes

### MODIFIED: Orchestrator skill includes dashboard lifecycle instruction

- **File:** `skills/orchestrator/SKILL.md`
- **Change:** Add a short section near the top of the skill body instructing the agent that it is the entry point of the CrewLoop workflow and that its activation should be reflected in the CrewLoop dashboard. The section will not contain executable code; it is a behavioral instruction for the consuming agent.

Example addition (to be refined by the implementer):

```markdown
## DASHBOARD LIFECYCLE

When this skill is loaded at the start of a session, the CrewLoop dashboard should display an active session named `orchestrator`. If the agent supports lifecycle hooks, ensure the first event sent to the dashboard marks `orchestrator` as the active skill.
```

### ADDED: Default skill argument to shim

- **File:** `servers/dashboard/src/adapters/shim.ts`
- **Change:** Parse an optional `--default-skill <name>` argument from `process.argv`. When present, store it in a module-level constant.

```typescript
export function getDefaultSkill(argv: string[]): string | undefined {
  const idx = argv.indexOf('--default-skill');
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  return process.env.CREWLOOP_DEFAULT_SKILL;
}
```

### ADDED: Skill field on session_start events

- **File:** `servers/dashboard/src/adapters/shim.ts`
- **Change:** In `buildEvent`, when the normalized `event_type` is `session_start` and a default skill is configured, add `skill: defaultSkill` to the event.

```typescript
if (base.event_type === 'session_start' && defaultSkill) {
  base.skill = defaultSkill;
}
```

### MODIFIED: Adapters forward explicit skill

- **Files:** `servers/dashboard/src/adapters/kimi.ts`, `servers/dashboard/src/adapters/codex.ts`
- **Change:** If the incoming payload contains a `skill` field, copy it to the normalized `DashboardEvent`.

```typescript
export interface KimiHookPayload {
  hook_event_name: string;
  session_id: string;
  cwd: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: Record<string, unknown>;
  stop_reason?: string;
  usage?: unknown;
  skill?: string;          // ADDED
}
```

```typescript
return {
  id: generateId(),
  timestamp: Date.now(),
  source: 'kimi',
  session_id: payload.session_id || 'unknown',
  event_type,
  tool: payload.tool_name,
  skill: payload.skill,    // ADDED
};
```

### MODIFIED: State store applies skill from session_start

- **File:** `servers/dashboard/src/state.ts`
- **Change:** In `applyEvent`, if `event.event_type === 'session_start'` and `event.skill` is present and known to the registry, set `session.active_skill` and `session.active_confidence = 'explicit'`.

```typescript
if (event.event_type === 'session_start' && event.skill) {
  session.active_skill = event.skill;
  session.active_confidence = 'explicit';
}
```

This happens before the inference engine runs, so the explicit value takes precedence.

### MODIFIED: Hook commands include default skill

- **File:** `packages/cli/src/hooks.ts` (specified in spec 003)
- **Change:** When generating hook commands, append `--default-skill orchestrator`. For example:
  - Kimi: `crewloop-shim kimi --default-skill orchestrator`
  - Codex: `crewloop-shim codex --default-skill orchestrator`

This change is implemented as part of spec 003 but is driven by the requirement in this spec.

### ADDED: Tests

- **File:** `servers/dashboard/src/tests/shim.test.ts` or existing test file
- **Change:** Add tests for:
  - Shim attaches default skill to `session_start` when `--default-skill` is provided.
  - Shim does not attach skill to `tool_start` / `tool_end` events.
  - Kimi/Codex normalizers forward the `skill` field.
  - `StateStore.applyEvent` sets `active_skill` from `session_start`.

## Acceptance Criteria

- Running `crewloop install` configures agent hooks that include `--default-skill orchestrator`.
- Starting a new agent session with the orchestrator skill loaded sends a `session_start` event with `skill: orchestrator`.
- The dashboard shows `orchestrator` as the active skill immediately, before any tool is executed.
- Existing events without a `skill` field continue to work as before.
- The `orchestrator` skill instructions mention dashboard lifecycle.
