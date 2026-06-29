# Proposal: Fix AGY Default Skill Fallback Override

## Motivation

The AGY integration introduced a `--default-skill orchestrator` fallback so that AGY sessions would not appear as "NO SKILL" in the dashboard. The fallback was attached directly to every AGY `DashboardEvent.skill` field when the adapter did not infer a stronger skill signal.

This created a regression: after the AGY adapter correctly infers a skill from reading a `SKILL.md` file (e.g., `architect`), any subsequent AGY tool call receives the fallback `orchestrator` in `event.skill`. The dashboard's `StateStore` overwrites the active skill whenever `event.skill` is present, so the UI flips back to `orchestrator` even though the user is running `architect`.

## Scope

In scope:

- Separate the AGY default-skill fallback from explicit/inferred skill signals.
- Use the fallback only when the session has no active skill yet.
- Update tests to cover the regression scenario.

Out of scope:

- Changing Kimi/Codex default-skill behavior.
- Changing AGY skill file path inference.
- UI changes.

## Constraints

- The fix must keep the dashboard source-agnostic; AGY-specific logic stays in the AGY adapter/shim layer.
- No breaking changes to existing events or API consumers.
- Existing Kimi/Codex behavior remains unchanged.

## Success Criteria

- Loading `architect` in AGY shows `architect` as the active skill.
- Subsequent AGY tool calls keep `architect` as the active skill.
- An AGY session that never loads a skill still falls back to `orchestrator`.
- All dashboard tests pass.
