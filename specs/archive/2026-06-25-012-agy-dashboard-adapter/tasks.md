## Tasks: AGY dashboard adapter and hook config alignment

### Implementation
- [x] Update AGY metadata in `packages/cli/src/agents.ts` (config path, event names).
- [x] Create `AgyHookWriter` extending `CodexHookWriter` in `packages/cli/src/hooks.ts`.
- [x] Add `agy` to `AgentSource` in `servers/dashboard/src/types.ts`.
- [x] Create `servers/dashboard/src/adapters/agy.ts` with `normalizeAgy`.
- [x] Wire `agy` into `servers/dashboard/src/adapters/shim.ts` detection, normalization, and usage message.

### Testing
- [x] Add `servers/dashboard/src/adapters/agy.test.ts`.
- [x] Add AGY cases to `servers/dashboard/src/adapters/shim.test.ts`.
- [x] Update `servers/dashboard/src/tests/shim.test.ts` usage string assertion.
- [x] Add AGY matcher-array test to `packages/cli/src/tests/hooks.test.ts`.
- [x] Run full CLI and dashboard test suites.

### Documentation
- [x] Update `specs/living/cli/spec.md` with AGY hook path, event names, and payload notes.
- [x] Create `specs/living/dashboard/spec.md` documenting supported sources and normalization.

### Verification
- [x] Reinstall CLI globally.
- [x] Run `crewloop install` and verify `~/.gemini/config/hooks.json`.
- [x] Run `crewloop doctor` and confirm AGY shows as ok.

### Completion
- [x] Mark `.spec.yaml` status as completed and archive the spec folder.
