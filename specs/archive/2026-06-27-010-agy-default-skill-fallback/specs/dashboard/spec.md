# Dashboard Delta: Fix AGY Default Skill Fallback Override

## Current State

In `servers/dashboard/src/adapters/shim.ts`, the AGY default-skill fallback is written into `base.skill`:

```typescript
if (base.event_type === 'session_start' && defaultSkill) {
  base.skill = defaultSkill;
} else if (source === 'agy' && defaultSkill && !base.skill) {
  base.skill = defaultSkill;
}
```

Because `StateStore.applyEvent` overwrites `session.active_skill` whenever `event.skill` is present, every AGY event that does not carry an inferred skill ends up resetting the active skill to the fallback:

```typescript
if (event.event_type === 'session_start' && event.skill) {
  session.active_skill = event.skill;
  session.active_confidence = 'explicit';
} else if (event.skill) {
  session.active_skill = event.skill;
  session.active_confidence = event.event_type === 'skill_change' ? 'explicit' : 'heuristic';
}
```

## Desired State

1. Add an optional `default_skill` field to `DashboardEvent`.
2. The AGY shim fallback must populate `default_skill`, not `skill`.
3. `StateStore.applyEvent` must apply `default_skill` only when the session has no active skill.
4. `SkillInferenceEngine` must consider `default_skill` as a fallback signal when no active skill exists.

## Contracts

### `DashboardEvent`

```typescript
export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType;
  skill?: string;
  default_skill?: string; // NEW
  tool?: string;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}
```

### `buildEvent` behavior

```typescript
if (base.event_type === 'session_start' && defaultSkill) {
  base.skill = defaultSkill;
} else if (source === 'agy' && defaultSkill && !base.skill) {
  base.default_skill = defaultSkill;
}
```

### `StateStore.applyEvent` behavior

```typescript
if (event.event_type === 'session_start' && event.skill) {
  session.active_skill = event.skill;
  session.active_confidence = 'explicit';
} else if (event.skill) {
  session.active_skill = event.skill;
  session.active_confidence = event.event_type === 'skill_change' ? 'explicit' : 'heuristic';
} else if (!session.active_skill && event.default_skill) {
  session.active_skill = event.default_skill;
  session.active_confidence = 'heuristic';
}
```

### `SkillInferenceEngine.infer` behavior

After all other signals are evaluated, if no active skill is inferred and `event.default_skill` is a known skill, return it with heuristic confidence:

```typescript
if (!session.active_skill && event.default_skill && this.skillNames.has(event.default_skill)) {
  return { skill: event.default_skill, confidence: 'heuristic' };
}
```

## Impact

- `servers/dashboard/src/types.ts` — add `default_skill?: string`.
- `servers/dashboard/src/adapters/shim.ts` — populate `default_skill` instead of `skill` for AGY fallback.
- `servers/dashboard/src/state.ts` — apply `default_skill` only when no active skill exists.
- `servers/dashboard/src/skills/infer.ts` — consider `default_skill` as fallback.
- `servers/dashboard/src/adapters/shim.test.ts` — update AGY fallback tests to assert `default_skill`.
- `servers/dashboard/src/tests/state.test.ts` or new state tests — add regression coverage.
- `servers/dashboard/src/skills/infer.test.ts` — add default_skill fallback test.
