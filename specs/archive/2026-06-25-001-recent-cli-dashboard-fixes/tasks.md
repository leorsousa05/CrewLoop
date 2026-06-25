# Tasks: Recent CLI and Dashboard Fixes

All tasks below are already implemented in commits `3829ba4` and `5ee7ec3`. This checklist documents the completed work for SDD traceability.

## CLI Fix (`3829ba4`)

- [x] Add `ws` to root `package.json` dependencies.
- [x] Bump root and CLI package versions to `0.4.2`.
- [x] Fix `resolvePackageRoot` bundled fallback path (`..` → `../..`).
- [x] Update package-root resolution error message to reference `@archznn/crewloop-skills`.
- [x] Implement `checkDashboardDependencies()` in `packages/cli/src/cli.ts`.
- [x] Wire dependency check into `handleDashboard()` before spawning the server.

## Dashboard Fix (`5ee7ec3`)

- [x] Bump root and CLI package versions to `0.4.3`.
- [x] Implement `formatListenError()` in `servers/dashboard/src/server.ts`.
- [x] Add one-time error listeners during `start()` and remove them on success.
- [x] Add `handleFatalError()` in `servers/dashboard/src/index.ts`.
- [x] Register `uncaughtException` and `unhandledRejection` handlers.
- [x] Add port-in-use integration test to `servers/dashboard/src/server.test.ts`.

## Verification

- [x] `npm test` passes in `packages/cli`.
- [x] `npm test` passes in `servers/dashboard`.
- [x] `python scripts/validate-skills.py` passes.
- [x] Manual test: `crewloop dashboard` starts successfully after clean install.
- [x] Manual test: second dashboard instance reports friendly port-in-use error.

## Post-merge

- [x] Mark `.spec.yaml` status as `completed`.
- [x] Archive this spec on merge to `main`.
