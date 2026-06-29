# Tasks: Fix AGY Default Skill Fallback Override

## Analysis

- [x] Confirm that `event.skill` fallback overrides inferred skill in `StateStore.applyEvent`.
- [x] Confirm that AGY skill file reads correctly infer `architect`/`engineer`/etc.
- [x] Decide on separate `default_skill` field approach.

## Implementation

- [x] Add `default_skill?: string` to `DashboardEvent` in `servers/dashboard/src/types.ts`.
- [x] Update `buildEvent` in `servers/dashboard/src/adapters/shim.ts` to set `default_skill` for AGY fallback.
- [x] Update `StateStore.applyEvent` in `servers/dashboard/src/state.ts` to apply `default_skill` only when `active_skill` is absent.
- [x] Update `SkillInferenceEngine.infer` in `servers/dashboard/src/skills/infer.ts` to use `default_skill` as fallback.

## Testing

- [x] Update `shim.test.ts`: AGY fallback sets `default_skill`, not `skill`.
- [x] Update binary `tests/shim.test.ts`: AGY event carries `default_skill`.
- [x] Add state test: `default_skill` is ignored when `active_skill` already exists.
- [x] Add state test: `default_skill` is used when `active_skill` is absent.
- [x] Add inference test: `default_skill` returns heuristic skill only with no active skill.
- [x] Run `npm test` in `servers/dashboard`.

## Verification

- [x] Dashboard tests pass: 74 server + 22 UI.

## Documentation

- [x] Update `specs/living/dashboard/spec.md` to describe `default_skill` fallback behavior.
- [ ] Archive this spec after review.
