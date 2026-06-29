# Design: Fix AGY Default Skill Fallback Override

## Architecture

The change touches three layers of the dashboard's event processing pipeline:

1. **Inbound adapter (`servers/dashboard/src/adapters/shim.ts`)** — decides whether a skill signal is explicit (session_start) or a fallback (AGY default skill).
2. **State store (`servers/dashboard/src/state.ts`)** — applies skill signals to session state, preserving stronger signals over fallback defaults.
3. **Skill inference engine (`servers/dashboard/src/skills/infer.ts`)** — computes the active skill for display, using `default_skill` only when no stronger signal exists.

### Patterns

- **Signal separation** — Explicit/inferred skills and default fallbacks travel in separate fields, preventing accidental overrides.
- **Fallback pattern** — `default_skill` is applied only when the session has no active skill.

## Contracts

### Type change

```typescript
// servers/dashboard/src/types.ts
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

### Adapter contract

```typescript
// servers/dashboard/src/adapters/shim.ts
export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>,
  defaultSkill?: string
): DashboardEvent | undefined;
```

Behavior:

- `session_start` + `defaultSkill` → `event.skill = defaultSkill`.
- AGY + `defaultSkill` + no inferred `skill` → `event.default_skill = defaultSkill`.

### State contract

```typescript
// servers/dashboard/src/state.ts
export class StateStore {
  applyEvent(event: DashboardEvent): Session;
}
```

Behavior:

- Explicit skill signals (`session_start`, `skill_change`, inferred skill) overwrite `active_skill`.
- `default_skill` is used only when `active_skill` is absent.

### Inference contract

```typescript
// servers/dashboard/src/skills/infer.ts
export class SkillInferenceEngine {
  infer(event: DashboardEvent, session: Session): SkillInferenceResult;
}
```

Behavior:

- `default_skill` is considered only after all explicit/heuristic signals are evaluated and the session has no active skill.

## Data Flow

1. AGY reads `architect/SKILL.md` → adapter infers `skill = 'architect'` → state sets active skill to `architect`.
2. AGY runs `run_command` with `--default-skill orchestrator` → adapter sets `default_skill = 'orchestrator'` (no `skill`).
3. State sees existing `active_skill = 'architect'` and ignores `default_skill`.
4. Inference engine preserves `architect`.
5. UI continues to show `architect`.

## File Structure

```
servers/dashboard/
└── src/
    ├── types.ts                      # MODIFY: add default_skill
    ├── adapters/
    │   ├── shim.ts                   # MODIFY: AGY fallback -> default_skill
    │   └── shim.test.ts              # MODIFY: assert default_skill
    ├── state.ts                      # MODIFY: apply default_skill conditionally
    ├── skills/
    │   ├── infer.ts                  # MODIFY: default_skill fallback
    │   └── infer.test.ts             # MODIFY: add fallback test
    └── tests/
        └── state.test.ts             # MODIFY or CREATE: regression test
```

## Key Trade-offs

- **Separate field vs. confidence marker** — A separate `default_skill` field is explicit and avoids coupling state logic to a specific confidence value. A confidence marker would be more compact but harder to reason about.
- **Applying default_skill in state vs. inference engine** — Applying it in state keeps the session record accurate even if the inference engine is bypassed. Adding it to the inference engine ensures the active skill computation is consistent with state.

## Risks

- If other adapters start using `default_skill`, the semantics must remain the same (fallback only when no active skill).
- Existing tests that assert `event.skill` on AGY fallback events will need updating.
