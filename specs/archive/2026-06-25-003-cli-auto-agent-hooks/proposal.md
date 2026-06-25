# Proposal: Auto-Configure Agent Hooks During Install

## WHY

The dashboard (`servers/dashboard/`) only shows agent sessions when an external hook posts events to `POST /event`. Today, after running `crewloop install`, users must manually edit agent configuration files to register `crewloop-shim` as a `before_tool_use` / `after_tool_use` hook. The examples live in `servers/dashboard/config-examples/`, but manual wiring is error-prone and easy to forget.

The user wants `crewloop install` to configure hooks automatically for Kimi, Claude, Codex, and AGY so that the dashboard works out of the box. This reduces onboarding friction and makes the dashboard useful without reading separate README sections.

## Scope

- Extend `packages/cli/src/agents.ts` with per-agent metadata: config file path, hook format, and whether lifecycle hooks are supported.
- Create a new `packages/cli/src/hooks.ts` module with an `AgentHookConfigWriter` interface and concrete writers for each supported agent.
- Add a `--hooks` / `--no-hooks` flag to `crewloop install` (default: enabled).
- Make hook configuration idempotent: running `crewloop install` twice should not duplicate entries.
- Back up existing config files before modifying them.
- Report per-agent results (configured, skipped, unsupported, error) in the CLI output.
- Update `AGENTS.md` to remove the obsolete `scripts/install.sh` reference and document that the CLI configures hooks automatically.

## Constraints

- Must not break manual installs or custom agent configs.
- Must not crash if an agent is not installed.
- Must keep hook commands fire-and-forget so the agent is never blocked.
- Must support `--dry-run` for hook configuration.
- Must be extensible: adding a new agent should only require a new writer implementation.
