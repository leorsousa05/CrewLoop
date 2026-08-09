# Proposal: Agent-Specific Guard Tool & Command Matching

## Problem

Different AI coding agents use different tool naming conventions and input argument schemas for executing shell commands and file operations.
For instance:
- AGY (Antigravity) uses tool names like `run_command` with parameter `CommandLine` or `commandLine`.
- Kimi / Claude / Codex / OpenCode use `bash`, `execute_command`, `sh`, or `run_command` with `command`, `args`, or `cmd`.
- Path parameters also vary across agents (`AbsolutePath`, `TargetFile`, `path`, `file`, etc.).

Currently, CrewLoop Guard normalizes raw payloads into a standard `NormalizedGuardEvent`, but:
1. `commandMatches` rule matching relies on a single general `extractCommand` function that might fail to recognize agent-specific properties.
2. Guard policies defined in `guard.yml` need flexible tool alias matching so users can define rules against abstract actions (e.g. `run_command`) without breaking compatibility across different agent tool names.

## Goals

1. Enhance `normalizePayload` and `extractCommand` in `packages/cli/src/guard/` to reliably extract commands, scripts, and paths across AGY (`run_command`), Kimi, Claude, Codex, and OpenCode payload schemas.
2. Support agent-aware tool matching in `evaluator.ts` so policy rules can match exact tool names or standardized tool categories.
3. Add full unit test coverage for AGY `run_command` (including `CommandLine` argument extraction) in `packages/cli/src/tests/guard.test.ts`.

## Non-Goals

- Changing agent hook definitions in `agents.ts` (hooks already forward payloads).
- Adding new UI components to the dashboard (handled in existing Security view).

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unmatched tool inputs failing open in audit mode | Medium | Ensure fallback property inspection in `extractCommand` and `extractPaths`. |
| Breaking existing Kimi/Claude policy rules | Low | Maintain backward compatibility for standard `command` and `tool_name` fields. |
