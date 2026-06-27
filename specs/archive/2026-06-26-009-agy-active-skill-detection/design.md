# Design: AGY Active Skill Detection

## Architecture

The change stays inside the dashboard's **event normalization** bounded context. Two existing components are extended:

1. **`servers/dashboard/src/adapters/agy.ts`** — owns AGY-specific payload knowledge.
2. **`servers/dashboard/src/adapters/shim.ts`** — owns generic source routing and default-skill fallback.

The **skill inference engine** (`servers/dashboard/src/skills/infer.ts`) does not need AGY-specific logic because it already preserves a known active skill across events.

### Patterns

- **Adapter pattern** — AGY-specific skill detection is isolated in the AGY adapter; other sources are unaffected.
- **Fallback pattern** — the shim applies `--default-skill` only when the adapter did not produce a skill, avoiding silent overrides of stronger signals.

## Contracts

### AGY adapter

```typescript
// servers/dashboard/src/adapters/agy.ts
export interface AgyHookPayload {
  hook_event_name?: string;
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolCall?: {
    name?: string;
    args?: Record<string, unknown>;
  };
  toolName?: string;
  stepIdx?: number;
  error?: string;
  workspacePaths?: string[];
  transcriptPath?: string;
  artifactDirectoryPath?: string;
}

export function normalizeAgy(payload: AgyHookPayload): DashboardEvent | undefined;
```

`normalizeAgy` now returns `skill` when:

- `event_type` is `tool_start` or `tool_end`.
- The normalized tool is `Read`.
- The input path matches `/skills/<name>/SKILL.md` (any directory separator, case-insensitive).

The helper is pure:

```typescript
function inferSkillFromReadPath(
  tool: string | undefined,
  args: Record<string, unknown> | undefined
): string | undefined;
```

### Shim fallback

```typescript
// servers/dashboard/src/adapters/shim.ts
export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>,
  defaultSkill?: string
): DashboardEvent | undefined;
```

After calling `normalizePayload`, `buildEvent` must:

1. If `base.event_type === 'session_start' && defaultSkill`, set `base.skill = defaultSkill` (existing behavior).
2. Else if `source === 'agy' && !base.skill && defaultSkill`, set `base.skill = defaultSkill`.

This keeps Kimi/Codex behavior unchanged while giving AGY a default skill for every event.

## Data Flow

1. AGY invokes `crewloop-shim agy --default-skill orchestrator`.
2. `buildEvent` calls `normalizeAgy`.
3. `normalizeAgy` maps `view_file` → `Read`, extracts `AbsolutePath`, and infers `orchestrator` from the path.
4. If no skill is inferred, `buildEvent` falls back to `orchestrator`.
5. `StateStore.applyEvent` sets `active_skill` with heuristic confidence.
6. `SkillInferenceEngine.infer` preserves the active skill for subsequent events.
7. The dashboard UI shows the active skill in the timeline, overview, and filters.

## File Structure

```
servers/dashboard/
└── src/
    ├── adapters/
    │   ├── agy.ts                    # MODIFY: add inferSkillFromReadPath
    │   ├── shim.ts                   # MODIFY: AGY default-skill fallback
    │   ├── shim.test.ts              # MODIFY: add AGY fallback tests
    │   └── tests/adapters.test.ts    # MODIFY: add AGY skill inference tests
    └── skills/infer.ts               # no change
specs/living/dashboard/spec.md        # MODIFY: document AGY skill behavior
```

## Key Trade-offs

- **Path-based inference vs. AGY `toolSummary`** — Path is stable across languages and does not require maintaining a list of skill display names. `toolSummary` may be localized, but the file path is not.
- **AGY-only fallback vs. generic fallback** — Limiting the default-skill fallback to AGY avoids changing Kimi/Codex semantics, where `skill` may be intentionally absent when no skill is active.
- **Heuristic confidence vs. explicit confidence** — Skill file reads are treated as heuristic because the dashboard cannot distinguish a user browsing a skill from the skill being active. This is sufficient for the UI and preserves the existing inference engine.

## Risks

- If AGY changes the skill file path convention, inference will stop working until the regex is updated.
- Skill names containing spaces or special characters in the directory name will be captured as-is; the skill registry must match them.
- The default skill fallback may mask a future AGY native `skill` field if one is added. The adapter's explicit `skill` takes precedence, so a native field would still win.
