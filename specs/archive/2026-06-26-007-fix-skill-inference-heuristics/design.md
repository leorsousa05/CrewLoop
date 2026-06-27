# Design: Fix skill inference heuristics

## Architecture

The change keeps the existing `SkillInferenceEngine` Strategy but narrows the matching rules. The engine remains a pure function `(DashboardEvent, Session) -> SkillInferenceResult`, making it easy to unit test.

The UI already supports `activeSkill: undefined` in the `ClientSession` contract. We only need to adjust the fallback copy and styling in `ActiveSkillPanel` and `Overview`.

## Contracts

No type changes. Existing contracts:

```ts
interface SkillInferenceResult {
  skill: string | undefined;
  confidence: 'explicit' | 'heuristic' | 'unknown';
}

interface ClientSession {
  skill?: string;
  activeSkill?: { name: string; confidence: 'explicit' | 'heuristic' | 'unknown' };
}
```

When `skill` is `undefined`, `activeSkill` is `undefined`, and the UI must render a "no active skill" state.

## Data flow

1. Hook event arrives via `POST /event`.
2. `createEventHandler` calls `SkillInferenceEngine.infer(event, session)`.
3. Engine returns explicit/heuristic/unknown result.
4. `StateStore.setActiveSkill` stores `active_skill` and `active_confidence`.
5. `presentSession` converts `active_skill` to `activeSkill` or `undefined`.
6. UI components render skill name or fallback copy.

## File changes

```
servers/dashboard/
├── src/
│   ├── skills/
│   │   ├── infer.ts          # Remove inferFromTool heuristic
│   │   ├── mapping.ts        # Remove DEFAULT_TOOL_TO_SKILL_MAP
│   │   └── infer.test.ts     # Update expectations
│   └── state.ts              # No changes needed
└── ui/
    └── src/
        └── components/
            ├── ActiveSkillPanel.tsx   # Render no-skill fallback
            └── views/
                └── Overview.tsx       # Handle undefined skill in recent sessions / top skills
```

## Inference rules (final)

Priority order in `SkillInferenceEngine.infer`:

1. If session already has an explicit active skill and the current event is NOT a new explicit signal, preserve the explicit skill.
2. `event.event_type === 'skill_change'` with `event.skill` → explicit.
3. `event.tool === 'Skill'` with `event.detail` matching a known skill → explicit.
4. `event.tool === 'Bash'` with `event.detail` matching a git command → heuristic `shipper`.
5. Otherwise → `unknown` (`skill: undefined`).

## UI fallback copy

- `ActiveSkillPanel`: when no active skill, show "NO SKILL" as the large title and a subtitle like "Agent is running without an active role".
- `Overview` recent sessions: show "No active skill" instead of session id when `activeSkill` is missing.
- `Overview` top skills: unchanged; sessions without skill simply do not contribute to the count.

## Tests

- `infer.test.ts`:
  - Remove or invert tests that expect `Read` → `researcher` and `Bash` → `engineer`.
  - Add test: generic `Bash` without git command returns `unknown`.
  - Add test: generic `Read` returns `unknown`.
  - Keep tests for explicit skill, `Skill` tool, git command, explicit preservation, and unknown fallback.
