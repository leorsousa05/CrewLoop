# Dashboard Delta: AGY Active Skill Detection

## Current State

`servers/dashboard/src/adapters/agy.ts` normalizes AGY payloads into `DashboardEvent` but never sets the `skill` field:

```typescript
return {
  id: generateId(session_id, stepIdx),
  timestamp: Date.now(),
  source: 'agy',
  session_id,
  event_type,
  tool,
  detail: extractDetail(tool, args),
  input: args,
  output: ...,
};
```

`servers/dashboard/src/adapters/shim.ts` only applies `--default-skill` to `session_start` events:

```typescript
if (base.event_type === 'session_start' && defaultSkill) {
  base.skill = defaultSkill;
}
```

AGY does not emit `session_start`, so AGY sessions never report an active skill.

## Desired State

1. The AGY adapter must infer the active skill when AGY reads a skill file.
2. The shim must apply the default skill fallback to AGY tool events when the adapter did not infer a skill.
3. The existing skill inference engine must preserve the active skill across AGY events.

## AGY Skill File Payload

When AGY loads a skill, it reads the `SKILL.md` file with a payload similar to:

```json
{
  "hook_event_name": "PreToolUse",
  "conversationId": "d8b80a7e-...",
  "stepIdx": 3,
  "toolCall": {
    "name": "view_file",
    "args": {
      "AbsolutePath": "/home/arch/.agents/skills/orchestrator/SKILL.md",
      "IsSkillFile": true,
      "toolSummary": "Orchestrator skill"
    }
  }
}
```

The adapter must derive the skill name from `AbsolutePath` when the path matches a `skills/<skill-name>/SKILL.md` pattern.

## Skill Inference Rules

1. **Skill file read** — If `tool` is `Read` and the input path matches `.../skills/<name>/SKILL.md` (case-insensitive), set `event.skill = <name>`.
2. **Default skill fallback** — If the AGY adapter returns an event without `skill`, the shim must set `event.skill = defaultSkill` when `defaultSkill` is provided.
3. **Preserve active skill** — The existing `SkillInferenceEngine` already keeps a known active skill across events, so no change is required there.

## Impact

- `servers/dashboard/src/adapters/agy.ts` — add `inferSkillFromReadPath` helper and populate `skill`.
- `servers/dashboard/src/adapters/shim.ts` — apply default skill fallback for AGY events.
- `servers/dashboard/src/tests/adapters.test.ts` — add tests for skill inference.
- `servers/dashboard/src/tests/shim.test.ts` — add tests for AGY default skill fallback.
- `servers/dashboard/src/adapters/shim.test.ts` — add tests for AGY default skill fallback.
- `specs/living/dashboard/spec.md` — document AGY active skill behavior.
