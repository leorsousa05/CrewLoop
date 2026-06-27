# Proposal: AGY Active Skill Detection

## Motivation

After the AGY hook integration fix, the dashboard receives AGY `PreToolUse`/`PostToolUse` events and shows tool invocations correctly. However, the active skill badge stays empty because:

1. AGY payloads do not contain a top-level `skill` field.
2. The `crewloop-shim --default-skill orchestrator` fallback only attaches to `session_start` events, and AGY never emits `session_start`.

This makes it impossible to see which CrewLoop skill is driving an AGY session in the dashboard timeline, network graph, and filters.

## Scope

In scope:

- Infer the active skill from AGY `view_file` (`Read`) invocations when the target path is a `SKILL.md` file inside a `skills/` directory.
- Use the CLI-provided `--default-skill orchestrator` as a fallback for AGY events that do not carry an explicit skill signal.
- Update tests and living documentation to describe the new behavior.

Out of scope:

- Changing the AGY hook config path or command (already correct).
- Adding new UI components; the dashboard already renders the active skill when present.
- Supporting AGY slash-command skill loading if it does not produce a `view_file` of `SKILL.md`.

## Constraints

- The dashboard must remain source-agnostic: AGY-specific inference lives in the AGY adapter.
- No breaking changes to Kimi, Codex, OpenCode, or log-watcher adapters.
- The existing skill inference engine must keep working without AGY-specific branches.

## Success Criteria

- Loading a skill in AGY (e.g., `orchestrator`) produces a `Read` event whose inferred skill is `orchestrator`.
- Subsequent AGY tool calls in the same session keep showing `orchestrator` as the active skill.
- AGY events that do not infer a skill still show `orchestrator` because of the `--default-skill` fallback.
- `npm test` passes for `servers/dashboard`.
