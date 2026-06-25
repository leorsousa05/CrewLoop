## Tasks: Add health checks for Codex Windows sandbox

### Implementation
- [x] Create `packages/cli/src/health.ts` with `HealthCheckResult` type and `checkAgentHealth` / `checkAllAgentsHealth` functions.
- [x] Add Windows-only Codex sandbox helper check that detects when `codex-windows-sandbox-setup.exe` exists in the standalone package but is not discoverable.
- [x] Add `doctor` command parsing in `packages/cli/src/cli.ts`.
- [x] Add `handleDoctor` that prints health results in a readable format.
- [x] Update `handleInstall` to run health checks for configured agents and print warnings.
- [x] Update `printHelp` to document `crewloop doctor`.

### Testing
- [x] Add `packages/cli/src/tests/health.test.ts` with tests for Codex helper discovery (Windows path handling).
- [x] Add `cli.test.ts` assertions for `doctor` command and help text.
- [x] Ensure existing `install` tests still pass and no regressions.

### Documentation
- [x] Update `specs/living/cli/spec.md` with a known-issue note about Codex Windows sandbox and the workaround.
- [x] Update built-in help text.

### Verification
- [x] Run `npm run build --workspaces`.
- [x] Run `npm test --workspaces`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Run `crewloop doctor` on Windows and confirm Codex warning appears when applicable.

### Completion
- [x] Mark `.spec.yaml` status as completed and archive the spec folder.
