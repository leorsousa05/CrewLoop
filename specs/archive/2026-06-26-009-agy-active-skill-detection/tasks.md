# Tasks: AGY Active Skill Detection

## Analysis

- [x] Capture real AGY payload and confirm skill context is in `toolCall.args.AbsolutePath` + `IsSkillFile`.
- [x] Confirm AGY does not emit `session_start`, so `--default-skill` never applies today.
- [x] Confirm Kimi/Codex behavior must remain unchanged.

## Implementation

- [x] Add `inferSkillFromReadPath` helper to `servers/dashboard/src/adapters/agy.ts`.
- [x] Populate `skill` in `normalizeAgy` when a skill file path is detected.
- [x] Update `buildEvent` in `servers/dashboard/src/adapters/shim.ts` to apply `defaultSkill` fallback for AGY events.
- [x] Update `specs/living/dashboard/spec.md` with AGY active skill behavior.

## Testing

- [x] Add adapter test: skill inferred from `/home/user/.agents/skills/orchestrator/SKILL.md`.
- [x] Add adapter test: no skill inferred for ordinary file reads.
- [x] Add adapter test: Windows-style path infers skill.
- [x] Add shim test: AGY event without inferred skill gets `--default-skill` fallback.
- [x] Add shim test: AGY event with inferred skill keeps the inferred value.
- [x] Run `npm test` in `servers/dashboard`.

## Verification

- [x] Dashboard tests pass: 69 server + 22 UI.
- [x] CLI tests pass: 58.

## Documentation

- [x] Update `specs/living/dashboard/spec.md`.
- [x] Mark this spec as completed and archive it after review.
