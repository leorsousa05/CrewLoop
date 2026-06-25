# Tasks: Make `crewloop-shim` Executable and Improve CLI Help/Output

## Phase 1 — Expose the shim binary

- [x] Create `servers/dashboard/bin/crewloop-shim.js` that requires `../dist/adapters/shim` and calls `runShim()`.
- [x] Add executable permission to `servers/dashboard/bin/crewloop-shim.js` on Unix-like systems.
- [x] Register `"crewloop-shim": "servers/dashboard/bin/crewloop-shim.js"` in root `package.json` `bin`.
- [x] Register `"crewloop-shim": "bin/crewloop-shim.js"` in `servers/dashboard/package.json` `bin`.
- [x] Verify `servers/dashboard/package.json` `files` includes `"bin/"`.
- [x] Verify root `package.json` `files` includes `"servers/dashboard/"`.

## Phase 2 — Improve CLI help text

- [x] Update `packages/cli/src/cli.ts` `printHelp()`:
  - [x] Change `install` description to "Install CrewLoop skills and configure agent hooks".
  - [x] Add `Hooks:` section listing supported agents and explaining automatic registration.
  - [x] Add `Examples:` section with at least one example per command.
- [x] Update `packages/cli/src/tests/cli.test.ts`:
  - [x] Assert help contains `Hooks:` section and supported agents.
  - [x] Assert help contains `Examples:` section and each example command.

## Phase 3 — Improve install output messaging

- [x] In `packages/cli/src/cli.ts` `handleInstall()`:
  - [x] Change Obsidian MCP progress header to "Ensuring Obsidian MCP server is installed...".
  - [x] Update hook summary: print "Agent hooks: no supported agents detected (skipped)" when no agent is configured.
  - [x] Print hint "Run \"crewloop dashboard\" to start receiving hook events." after successful hook configuration.

## Phase 4 — Tighten backup idempotency

- [x] In `packages/cli/src/hooks.ts` `installHooksForAgent()`:
  - [x] Track whether the config actually changes.
  - [x] Only create a backup when the config changes.
  - [x] Return `backupPath: undefined` when no backup is created.
- [x] Add a test in `packages/cli/src/tests/hooks.test.ts`:
  - [x] Run `installHooksForAgent()` twice on an already-correct Kimi config.
  - [x] Assert the second run returns `status: 'configured'` and no `backupPath`.
  - [x] Assert the config file content remains unchanged.

## Phase 5 — Add dashboard shim tests

- [x] Create `servers/dashboard/src/tests/shim.test.ts`:
  - [x] Assert `runShim` is exported.
  - [x] Test that `node bin/crewloop-shim.js kimi` exits 0 with empty stdin.
  - [x] Test that `node bin/crewloop-shim.js unknown` exits 1 and prints usage.
- [x] Add `servers/dashboard/src/tests/` to `servers/dashboard/tsconfig.json` `include` if necessary.

## Phase 6 — Update documentation

- [x] Update `AGENTS.md` install section to mention `crewloop-shim` is installed globally and is used by hooks.
- [x] Ensure `AGENTS.md` accurately describes the `--no-hooks` opt-out.

## Phase 7 — Verification

- [x] Run `npm run build` in `servers/dashboard`.
- [x] Run `npm run build` in `packages/cli`.
- [x] Run `npm test` in `packages/cli`.
- [x] Run `npm test` in `servers/dashboard`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Manual test: `crewloop -h` shows new sections.
- [x] Manual test: `crewloop install` on a system with Kimi installed configures hooks and does not duplicate them on rerun.
- [x] Manual test: `crewloop-shim` is callable after global install.
