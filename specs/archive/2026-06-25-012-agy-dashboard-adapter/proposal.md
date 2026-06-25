# Proposal: AGY dashboard adapter and hook config alignment

## WHY

CrewLoop wants to support the Antigravity (AGY) agent as a first-class hook source for the real-time skill dashboard. Early attempts to configure AGY hooks used the wrong config path and event names, and the dashboard shim did not know how to normalize the AGY payload envelope.

The AGY hook contract (per Antigravity documentation):

- Config file: `~/.gemini/config/hooks.json`
- Hook events: `PreToolUse` / `PostToolUse`
- Format: matcher-array groups of command hooks, same shape as Codex
- Payload: may expose the tool name as `toolName` or nested inside `toolCall.name`

Without aligning the CLI hook writer and adding an AGY adapter, AGY events either fail to be registered or arrive at the dashboard as unrecognised payloads.

## Scope

1. Fix the AGY hook config path to `~/.gemini/config/hooks.json`.
2. Use `PreToolUse` / `PostToolUse` as AGY hook event names.
3. Reuse the Codex matcher-array writer for AGY via a dedicated `AgyHookWriter`.
4. Add an AGY adapter in `servers/dashboard/src/adapters/agy.ts` that maps AGY events to `DashboardEvent`.
5. Wire `agy` into the shim source detection and normalizer switch.
6. Add unit tests for the AGY adapter and shim integration.
7. Update `specs/living/cli/spec.md` and create `specs/living/dashboard/spec.md` to document the supported sources and payload normalization.

## Out of scope

- Auto-detecting AGY installation state beyond the config directory.
- Fixing the Obsidian MCP `pip install` warning on Windows.
- Changing the AGY hook protocol itself.

## Constraints

- Must not break Kimi, Codex, or Claude hook configuration.
- Must keep the CLI and dashboard tests passing.
- Must follow the existing matcher-array format used by Codex.
