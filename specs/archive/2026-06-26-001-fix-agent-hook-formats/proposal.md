# Proposal: Fix agent hook configuration formats

## Problem

The `crewloop install` command writes hook configurations for supported agents, but the formats it emits do not match the formats those agents actually consume. This means the hooks are either ignored or cause configuration errors.

Current incorrect outputs:

- **Kimi Code** writes a TOML table `[hooks]` with `before_tool_use` and `after_tool_use` string keys. Kimi Code expects `[[hooks]]` array-of-tables with `event`, `matcher`, and `command`.
- **Codex / Claude / AGY** write a JSON object `hooks.before_tool_use` / `hooks.after_tool_use` with string commands. These agents expect grouped event arrays where each entry has a `matcher` and a nested `hooks` array of command objects.

Because the formats are wrong, the CrewLoop dashboard never receives tool-use events from these agents, even after a successful `crewloop install`.

## Motivation

- The dashboard is a core feature of CrewLoop. It depends on hooks forwarding agent events.
- Users currently run `crewloop install` and believe hooks are configured, but they are not.
- The CLI code contains no explanation of why each format looks the way it does, making maintenance risky.

## Scope

### In scope

- Rewrite the hook writers in `packages/cli/src/hooks.ts` to emit correct formats for Kimi, Codex, Claude, and AGY.
- Update `packages/cli/src/agents.ts` so each agent defines the correct events and commands.
- Ensure CrewLoop-managed hooks are idempotent: overwrite old CrewLoop hooks, preserve user hooks.
- Keep backup behavior before mutating existing files.
- Update unit tests in `packages/cli/src/tests/hooks.test.ts`.
- Add `packages/cli/AGENTS.md` documenting the real formats, why they differ, and maintenance rules.

### Out of scope

- Adding hook support for Cursor or Windsurf (already unsupported).
- Changing the `crewloop-shim` binary implementation. We may change the command string it receives, but not its internals.
- Adding new event types beyond `PreToolUse` and `PostToolUse` unless required for dashboard parity.

## Success criteria

1. `crewloop install --agent kimi` writes valid Kimi Code `[[hooks]]` entries.
2. `crewloop install --agent codex` writes valid Codex grouped JSON hooks.
3. `crewloop install --agent claude` writes valid Claude grouped JSON hooks.
4. `crewloop install --agent agy` writes valid AGY grouped JSON hooks under a `crewloop` group.
5. Re-running `crewloop install` is idempotent and does not duplicate CrewLoop hooks.
6. User-defined hooks in the same files are preserved.
7. Old simplified CrewLoop entries are removed or migrated.
8. All unit tests pass.
9. `packages/cli/AGENTS.md` exists and explains formats and rules.
