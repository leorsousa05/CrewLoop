# Design: Orchestrator Skill Session Start

## Architecture Overview

This change bridges the gap between "a Markdown skill is loaded" and "the dashboard sees an active session." Because skills cannot execute code, the signal must come from the agent's lifecycle hooks. The orchestrator skill provides the semantic intent, the CLI configures the hooks, and the shim normalizes the intent into a dashboard event.

### Patterns Used

- **Convention over configuration:** the default skill is `orchestrator` because it is the defined entry point of the workflow.
- **Explicit override:** adapters forward any explicit `skill` field, allowing future skills to opt into the same behavior.
- **Fail-silent instrumentation:** the shim never blocks the agent if the dashboard is unreachable.

## Directory Structure

```
skills/orchestrator/
└── SKILL.md                             # MODIFIED: add dashboard lifecycle section

servers/dashboard/src/adapters/
├── shim.ts                              # MODIFIED: parse --default-skill, attach to session_start
├── kimi.ts                              # MODIFIED: forward payload.skill
└── codex.ts                             # MODIFIED: forward payload.skill

servers/dashboard/src/
└── state.ts                             # MODIFIED: apply skill from session_start

packages/cli/src/
└── hooks.ts                             # MODIFIED (spec 003): append --default-skill orchestrator
```

## Core Components

### 1. Default skill resolver in shim

```typescript
// servers/dashboard/src/adapters/shim.ts

export function getDefaultSkill(argv: string[]): string | undefined {
  const idx = argv.indexOf('--default-skill');
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  const env = process.env.CREWLOOP_DEFAULT_SKILL;
  return env || undefined;
}
```

The resolver checks command-line args first, then falls back to the environment variable. This supports both CLI-generated hooks and manual configurations.

### 2. Event enrichment

```typescript
// servers/dashboard/src/adapters/shim.ts

export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>,
  defaultSkill?: string
): DashboardEvent | undefined {
  const base = normalizePayload(source, raw);
  if (!base) {
    return undefined;
  }

  if (base.event_type === 'session_start' && defaultSkill) {
    base.skill = defaultSkill;
  }

  // existing sanitization...
}
```

### 3. Adapter skill forwarding

The Kimi and Codex normalizers accept an optional `skill` field in the raw payload and copy it to the normalized event. This is forward-looking: future agent hooks may already know the active skill and can pass it explicitly.

### 4. State store precedence

```typescript
// servers/dashboard/src/state.ts

applyEvent(event: DashboardEvent): Session {
  let session = this.sessions.get(event.session_id);

  if (!session) {
    session = this.createSession(event.session_id, event.source);
  }

  session.source = event.source;
  session.last_event_at = event.timestamp;
  session.events.unshift(event);

  if (session.events.length > this.options.maxEventsPerSession) {
    session.events.length = this.options.maxEventsPerSession;
  }

  if (event.tool) {
    session.tool_counts[event.tool] = (session.tool_counts[event.tool] || 0) + 1;
  }

  // NEW: explicit skill from session_start
  if (event.event_type === 'session_start' && event.skill) {
    session.active_skill = event.skill;
    session.active_confidence = 'explicit';
  }

  if (event.skill && event.event_type === 'skill_change') {
    session.active_skill = event.skill;
    session.active_confidence = 'explicit';
  }

  session.status = deriveSessionStatus(event);

  this.sessions.set(event.session_id, session);
  return session;
}
```

The inference engine in `event.ts` will still run, but because `session.active_skill` is already set to an explicit value with `active_confidence = 'explicit'`, the engine should not override it unless another explicit signal arrives.

### 5. Hook command generation

The CLI hook writers (spec 003) generate commands like:

```toml
[hooks]
before_tool_use = "crewloop-shim kimi --default-skill orchestrator"
after_tool_use = "crewloop-shim kimi --default-skill orchestrator"
```

The default skill is hard-coded to `orchestrator` because the orchestrator is the mandatory entry point of the CrewLoop workflow.

## Data Flow

```
User starts session with orchestrator skill loaded
  ↓
Agent fires SessionStart hook
  ↓
crewloop-shim kimi --default-skill orchestrator
  ↓
shim normalizes payload to event_type: 'session_start', skill: 'orchestrator'
  ↓
POST /event
  ↓
StateStore.applyEvent creates session with active_skill = 'orchestrator'
  ↓
WebSocket broadcast
  ↓
Dashboard UI shows "ORCHESTRATOR" as active skill
```

## Contracts

```typescript
// servers/dashboard/src/adapters/shim.ts

export function getDefaultSkill(argv: string[]): string | undefined;

export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>,
  defaultSkill?: string
): DashboardEvent | undefined;
```

```typescript
// servers/dashboard/src/adapters/kimi.ts

export interface KimiHookPayload {
  hook_event_name: string;
  session_id: string;
  cwd: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: Record<string, unknown>;
  stop_reason?: string;
  usage?: unknown;
  skill?: string;
}
```

```typescript
// servers/dashboard/src/adapters/codex.ts

export interface CodexHookPayload {
  sessionId?: string;
  session_id?: string;
  turnId?: string;
  cwd?: string;
  transcriptPath?: string;
  model?: string;
  permissionMode?: string;
  callId?: string;
  toolName?: string;
  toolKind?: string;
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  hook_event_name?: string;
  stop_reason?: string;
  usage?: unknown;
  executed?: boolean;
  success?: boolean;
  durationMs?: number;
  skill?: string;
}
```

```typescript
// servers/dashboard/src/types.ts (no change, but usage note)

export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType;
  skill?: string;
  tool?: string;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
}
```

The `skill` field already exists on `DashboardEvent`; this spec starts using it for `session_start`.

## Test Plan

### Unit tests

- **Shim default skill:** `buildEvent('kimi', sessionStartPayload, 'orchestrator')` returns an event with `skill: 'orchestrator'`.
- **Shim no default:** `buildEvent('kimi', sessionStartPayload)` returns an event without a `skill` field.
- **Shim ignores default for tool events:** `buildEvent('kimi', toolStartPayload, 'orchestrator')` does not set `skill`.
- **Kimi normalizer skill:** `normalizeKimi({ ..., skill: 'architect' })` returns `skill: 'architect'`.
- **Codex normalizer skill:** `normalizeCodex({ ..., skill: 'engineer' })` returns `skill: 'engineer'`.
- **State store session_start skill:** `applyEvent({ event_type: 'session_start', skill: 'orchestrator', ... })` creates a session with `active_skill: 'orchestrator'` and `active_confidence: 'explicit'`.

### Manual tests

- Install hooks with `crewloop install` and verify the generated config contains `--default-skill orchestrator`.
- Start a Kimi session with the orchestrator skill and verify the dashboard immediately shows `orchestrator`.
- Execute a tool and verify the skill remains `orchestrator` until a `Skill` tool changes it.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent SessionStart hook may not fire reliably. | Medium | Fallback: dashboard still shows session after first tool event. |
| Hard-coding `orchestrator` as default may be wrong if another skill is loaded first. | Low | Orchestrator is the documented entry point; explicit `Skill` tool events override it. |
| Extra argv parsing in shim could break if agents pass additional args. | Low | Use strict `--default-skill <value>` parsing; ignore unknown args. |

## Deferred Items

- Per-skill default skill configuration is out of scope.
- OpenCode plugin direct session_start emission is out of scope.
- Dashboard UI changes for session lifecycle are covered by spec 005.
