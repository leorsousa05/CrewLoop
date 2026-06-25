# Tasks: CLI MCP Install Feedback

## Phase 1 — Extend MCP installer contract

- [x] Add `McpInstallStep` union type to `packages/cli/src/mcp.ts`.
- [x] Add `McpInstallProgress` interface to `packages/cli/src/mcp.ts`.
- [x] Add `onProgress?: (progress: McpInstallProgress) => void` to `McpInstallOptions`.
- [x] Add `durationMs?: number` to `McpInstallResult`.
- [x] Implement step emissions inside `installMcpServer`:
  - [x] `check_python`
  - [x] `create_venv`
  - [x] `install_package`
  - [x] `expose_binary`
  - [x] `complete`
- [x] Compute and return `durationMs`.

## Phase 2 — Update CLI output

- [x] In `packages/cli/src/cli.ts`, print header `Installing Obsidian MCP server...`.
- [x] Pass `onProgress` callback to `installMcpServer` that renders each step to `stderr`.
- [x] Render final result line (`Installed`, `Skipped`, or warning) after progress completes.

## Phase 3 — Tests

- [x] Add progress-order test to `packages/cli/src/tests/mcp.test.ts`.
- [x] Add dry-run progress test.
- [x] Add missing-Python progress test.
- [x] Add pip-failure progress test.
- [x] Add duration assertion.
- [x] Run `npm test` in `packages/cli`.

## Phase 4 — Verification

- [x] Manual test: `crewloop install` shows MCP progress steps.
- [x] Manual test: `crewloop install --dry-run` shows concise dry-run output.
- [x] Manual test: missing Python shows failing step.
- [x] Run `python scripts/validate-skills.py`.
