# Proposal: Fix AGY Hook Integration

## Motivation

AGY (Antigravity CLI / Gemini CLI) is listed as a supported agent in `packages/cli/src/agents.ts`, but its hooks are not actually recognized by AGY. The CLI writes hook configuration to `~/.agy/config.json`, while AGY reads hooks from `~/.gemini/config/hooks.json`. Additionally, the dashboard shim does not accept `agy` as a valid source, so even if the hooks fired, events would be rejected.

This creates two visible problems:

1. Users running `crewloop install` see AGY as "configured", but AGY does not list or execute the CrewLoop hooks.
2. The dashboard never receives AGY events, so AGY sessions do not appear in the UI.

## Scope

In scope:

- Change the AGY hook config path in the CLI from `~/.agy/config.json` to `~/.gemini/config/hooks.json`.
- Clean up the legacy `~/.agy/config.json` CrewLoop block during install.
- Add `agy` as a valid dashboard source.
- Create a dashboard adapter that normalizes AGY payloads into `DashboardEvent`.
- Update invocation pairing so AGY `PreToolUse` / `PostToolUse` events match even though the post event does not repeat the tool name.
- Update tests and living documentation.

Out of scope:

- Support for AGY `PreInvocation`, `PostInvocation`, and `Stop` events.
- Moving AGY skill installation path (`~/.agy/skills`).
- UI redesign; the dashboard renders AGY events using existing components.

## Constraints

- The AGY hook schema documented by Antigravity must be respected: grouped JSON under a top-level name, with `PreToolUse` / `PostToolUse` arrays of `{ matcher, hooks }`.
- The dashboard must remain source-agnostic: AGY-specific knowledge lives in the adapter.
- No breaking changes to Kimi, Codex, or OpenCode adapters.

## Success Criteria

- After `crewloop install`, AGY lists the CrewLoop hooks from `~/.gemini/config/hooks.json`.
- Running an AGY session produces events in the CrewLoop dashboard.
- `npm test` passes for both `packages/cli` and `servers/dashboard`.
