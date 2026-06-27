# Tasks: Fix Kimi hook configuration file path

## Implementation

- [x] Change Kimi config path in `packages/cli/src/agents.ts` from `~/.kimi-code/config.toml` to `~/.kimi/config.toml`.
- [x] Update `packages/cli/src/tests/hooks.test.ts` to use the new Kimi path in test setups.
- [x] Update `packages/cli/AGENTS.md` Kimi section to reference `~/.kimi/config.toml`.
- [x] Update `specs/archive/2026-06-26-001-fix-agent-hook-formats/specs/hooks.md` to reference the correct path.
- [x] Update `specs/living/cli/hooks.md` to reference the correct path.

## Testing

- [x] Run `npm run build && npm test` in `packages/cli`.
- [x] Verify all tests pass.

## Verification

- [x] Confirm `crewloop install --agent kimi` writes to `~/.kimi/config.toml`.
