# Proposal: Orchestrator Skill Starts a Dashboard Session

## WHY

The user expects the dashboard to show an active session as soon as the `orchestrator` skill is activated. Today, the dashboard only creates a session when it receives the first `POST /event`. Because skills are Markdown documents and cannot execute code, activating `orchestrator` does not emit any event by itself. The agent must be instrumented so that a session-start lifecycle event is sent to the dashboard with `orchestrator` as the initial active skill.

This change coordinates three layers:

1. The `orchestrator` skill instructions tell the agent that it is the entry point and that its activation should be visible.
2. The dashboard shim accepts a default skill and attaches it to `session_start` events.
3. The CLI hook configuration (from spec 003) invokes the shim with `--default-skill orchestrator`.

## Scope

- Update `skills/orchestrator/SKILL.md` with a short dashboard lifecycle section.
- Enhance `servers/dashboard/src/adapters/shim.ts` to accept `--default-skill <name>` and include it in `session_start` events.
- Enhance `servers/dashboard/src/adapters/kimi.ts` and `codex.ts` to forward an explicit `skill` field when present in the payload.
- Update `servers/dashboard/src/state.ts` to apply the `skill` field from `session_start` events.
- Ensure the CLI hook writers (spec 003) generate commands that pass `--default-skill orchestrator`.

## Constraints

- Skills remain Markdown; no executable code inside `SKILL.md`.
- The mechanism must work through agent hooks only.
- Must not break existing dashboard events that do not include a skill.
- Must remain compatible with manual hook configurations.
