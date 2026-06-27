# Proposal: Revert Kimi hook config path to `~/.kimi-code/config.toml`

## Problem

The previous change (archived as `2026-06-26-002-fix-kimi-hook-config-path`) moved the Kimi hook configuration path from `~/.kimi-code/config.toml` to `~/.kimi/config.toml`. That decision was based on an unofficial documentation site (`kimi-cli.com`).

The official Kimi Code CLI documentation from Moonshot (`https://moonshotai.github.io/kimi-code/en/customization/hooks.html`) confirms that hooks are configured in `~/.kimi-code/config.toml`. Because the CLI currently writes to the wrong file, Kimi Code never loads the CrewLoop hooks and dashboard events are not forwarded.

## Goal

Revert the Kimi config path back to `~/.kimi-code/config.toml` and update all project documentation to match the official source.

## Scope

- Change one constant in `packages/cli/src/agents.ts`.
- Update `packages/cli/AGENTS.md`.
- Update `specs/living/cli/hooks.md`.
- Leave archived spec `2026-06-26-002-fix-kimi-hook-config-path` untouched for audit; this change supersedes it.

## Non-goals

- No changes to hook formats, writers, or other agents.
- No new features.

## Acceptance criteria

- `crewloop install` writes Kimi hooks to `~/.kimi-code/config.toml`.
- All tests pass.
- Documentation references only `~/.kimi-code/config.toml` for Kimi.
