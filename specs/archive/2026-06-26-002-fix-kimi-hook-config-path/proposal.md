# Proposal: Fix Kimi hook configuration file path

## Problem

The CrewLoop CLI writes Kimi Code hooks to `~/.kimi-code/config.toml`. According to the official Kimi CLI hooks documentation, Kimi Code reads hooks from `~/.kimi/config.toml`. Because the file path is wrong, Kimi Code never loads the hooks, so no tool-use events are forwarded to the CrewLoop dashboard.

## Root cause

`packages/cli/src/agents.ts` defines the Kimi hook config path as:

```ts
path.join(os.homedir(), '.kimi-code', 'config.toml')
```

The correct path is:

```ts
path.join(os.homedir(), '.kimi', 'config.toml')
```

## Scope

- Change Kimi config path in `packages/cli/src/agents.ts`.
- Update tests in `packages/cli/src/tests/hooks.test.ts` that reference the old path.
- Update `packages/cli/AGENTS.md` to document `~/.kimi/config.toml`.
- Update archived spec and living docs.

## Success criteria

1. `crewloop install --agent kimi` writes hooks to `~/.kimi/config.toml`.
2. Kimi Code loads the hooks from the correct file.
3. Tool-use events reach the dashboard when it is running.
4. All CLI tests pass.
