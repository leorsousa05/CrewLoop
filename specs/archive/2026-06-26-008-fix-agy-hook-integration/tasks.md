# Tasks: Fix AGY Hook Integration

## Analysis

- [x] Confirm AGY hook config path is `~/.gemini/config/hooks.json`.
- [x] Confirm current CLI writes to wrong path `~/.agy/config.json`.
- [x] Confirm dashboard shim does not support `agy` source.
- [x] Identify AGY payload schema and tool names.

## Implementation

- [x] Update `packages/cli/src/agents.ts`: change AGY `configPath` to `~/.gemini/config/hooks.json`.
- [x] Update `packages/cli/src/hooks.ts`: remove stale `crewloop` block from `~/.agy/config.json` during AGY install.
- [x] Update `servers/dashboard/src/types.ts`: add `'agy'` to `AgentSource`.
- [x] Update `servers/dashboard/src/adapters/shim.ts`: accept `'agy'` in `detectSource` and route in `normalizePayload`.
- [x] Create `servers/dashboard/src/adapters/agy.ts`: normalize AGY `PreToolUse` / `PostToolUse` payloads into `DashboardEvent`.
- [x] Update `servers/dashboard/src/lib/invocations.ts`: pair `tool_start` / `tool_end` by `event.id` first, then by tool name.
- [x] Update CLI help text to list `agy` as supported agent.

## Testing

- [x] Update `packages/cli/src/tests/hooks.test.ts`: assert AGY config path is `~/.gemini/config/hooks.json`.
- [x] Add CLI test for legacy `~/.agy/config.json` cleanup.
- [x] Add `servers/dashboard/src/tests/adapters.test.ts` tests for `normalizeAgy` covering PreToolUse, PostToolUse, tool mapping, and detail extraction.
- [x] Add `servers/dashboard/src/tests/shim.test.ts` tests for AGY source detection.
- [x] Add tests for id-based invocation pairing.
- [x] Run `npm test` in `packages/cli` and `servers/dashboard`.

## Verification

- [x] Run `crewloop install` and confirm `~/.gemini/config/hooks.json` contains the `crewloop` group.
- [x] Confirm `~/.agy/config.json` no longer contains a `crewloop` block (or is removed if empty).
- [x] Start dashboard, send AGY PreToolUse/PostToolUse via `crewloop-shim agy`, and confirm events appear in the dashboard.

## Documentation

- [x] Update `specs/living/cli/hooks.md` with correct AGY path.
- [x] Update `specs/living/dashboard/spec.md` with AGY source/adapter details.
- [x] Mark this spec as completed and archive it.
