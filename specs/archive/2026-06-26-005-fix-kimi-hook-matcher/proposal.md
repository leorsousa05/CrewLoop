# Proposal: Fix Kimi Code hook matcher regex

## Problem

CrewLoop installs Kimi Code hooks with `matcher = "*"` so every tool-use event is forwarded to the dashboard. However, Kimi Code's hook engine compiles the `matcher` field with `new RegExp(pattern)` and tests it against the tool name. A bare `*` is an invalid regular expression, so the engine catches the syntax error and treats the hook as non-matching. As a result, `PreToolUse` and `PostToolUse` hooks are registered but never fire, and the dashboard shows no tool activity.

Evidence from `MoonshotAI/kimi-code` source:

- `packages/agent-core/src/session/hooks/engine.ts` calls `new RegExp(hook.matcher)`.
- `packages/agent-core/src/session/hooks/types.ts` defines `matcher` as an optional string interpreted as a regex.
- Integration tests use regex matchers such as `"Shell"`, `"Shell|WriteFile"`, and `".*"` is not used, but the regex engine behavior is explicit.

## Goal

Make CrewLoop's Kimi hooks actually match all tools by emitting a valid regular expression (`.*`) instead of the invalid glob-style `*`.

## Scope

- Change the Kimi hook matcher in `packages/cli/src/hooks.ts` from `"*"` to `".*"`.
- Update `packages/cli/src/tests/hooks.test.ts` expectations.
- Update `packages/cli/AGENTS.md` to document that Kimi matchers are regexes and `".*"` matches all tools.
- Re-run `crewloop install` on this machine to repair `~/.kimi-code/config.toml`.

## Non-goals

- No changes to Codex, Claude, or AGY matchers; their grouped JSON format uses agent-specific matcher semantics.
- No new hook events.
