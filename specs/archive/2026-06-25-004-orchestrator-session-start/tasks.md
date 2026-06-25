# Tasks: Orchestrator Skill Session Start

## Phase 1 — Update orchestrator skill

- [x] Add dashboard lifecycle section to `skills/orchestrator/SKILL.md`.
- [x] Ensure the section instructs the agent without adding executable code.
- [x] Run `python scripts/validate-skills.py`.

## Phase 2 — Enhance dashboard shim

- [x] Implement `getDefaultSkill(argv)` in `servers/dashboard/src/adapters/shim.ts`.
- [x] Support `CREWLOOP_DEFAULT_SKILL` environment variable fallback.
- [x] Update `buildEvent()` to attach default skill to `session_start` events only.
- [x] Update `runShim()` to read default skill and pass it to `buildEvent()`.

## Phase 3 — Update normalizers

- [x] Add `skill?: string` to `KimiHookPayload` in `servers/dashboard/src/adapters/kimi.ts`.
- [x] Forward `payload.skill` in `normalizeKimi()`.
- [x] Add `skill?: string` to `CodexHookPayload` in `servers/dashboard/src/adapters/codex.ts`.
- [x] Forward `payload.skill` in `normalizeCodex()`.

## Phase 4 — Update state store

- [x] In `servers/dashboard/src/state.ts`, apply `event.skill` to `session.active_skill` when `event.event_type === 'session_start'`.
- [x] Set `session.active_confidence = 'explicit'` in that case.
- [x] Ensure inference engine does not override an explicit session_start skill without a new explicit signal.

## Phase 5 — Coordinate with CLI hook generation

- [x] In `packages/cli/src/hooks.ts` (spec 003), append `--default-skill orchestrator` to generated hook commands.
- [x] Update unit tests for hook command generation.

## Phase 6 — Tests

- [x] Add shim default-skill tests.
- [x] Add normalizer skill-forwarding tests.
- [x] Add state store session_start skill test.
- [x] Run `npm test` in `servers/dashboard`.
- [x] Run `npm test` in `packages/cli`.

## Phase 7 — Verification

- [x] Manual test: `crewloop install` generates hooks with `--default-skill orchestrator`.
- [x] Manual test: new Kimi session with orchestrator shows `orchestrator` in dashboard before any tool call.
- [x] Manual test: first tool call does not reset skill to unknown.
