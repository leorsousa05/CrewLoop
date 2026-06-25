# Spec Delta: Make `crewloop-shim` Executable and Improve CLI Help/Output

## Current System State

### CLI help

`packages/cli/src/cli.ts` exports `printHelp()`, which returns:

```
crewloop <command> [options]

Commands:
  install              Install CrewLoop skills
  list                 List available skills
  dashboard            Start the real-time skill dashboard
  version              Show version
  help                 Show this help message

Options:
  --target <dir>       Install to a custom directory
  --skill <name>       Install only a specific skill (repeatable)
  --agent <agent>      Target agent convention (kimi, claude, codex, cursor, windsurf)
  --port <number>      Dashboard port (default: 7890)
  --host <address>     Dashboard host (default: 127.0.0.1)
  --symlink            Create symlinks instead of copying
  --force              Overwrite existing skills
  --dry-run            Print actions without installing
  --hooks              Configure agent hooks (default)
  --no-hooks           Skip agent hook configuration
  -v, --version        Show version
  -h, --help           Show help
```

The help text:

- Does not explain what agent hooks are or why they matter.
- Does not list the supported agents or the config files that will be edited.
- Does not provide usage examples.
- Under-describes `install` (it also installs the Obsidian MCP server and configures hooks).

### Hook binary

`packages/cli/src/agents.ts` defines the hook command for each supported agent as:

```typescript
beforeToolUseCommand: 'crewloop-shim kimi --default-skill orchestrator',
afterToolUseCommand: 'crewloop-shim kimi --default-skill orchestrator',
```

The same pattern is used for `claude`, `codex`, and `agy`. However:

- `crewloop-shim` is **not registered** in the root `@archznn/crewloop-skills` `package.json` `bin` field.
- `crewloop-shim` is **not registered** in `servers/dashboard/package.json`.
- There is **no** `servers/dashboard/bin/crewloop-shim.js` file.
- The shim implementation exists only as `runShim()` in `servers/dashboard/src/adapters/shim.ts`, which is compiled to `servers/dashboard/dist/adapters/shim.js` but never invoked from a CLI entry point.

Consequence: after `crewloop install`, the user's Kimi/Codex/Claude/AGY config contains a `before_tool_use` / `after_tool_use` hook that points to a non-existent command. The hooks fail silently because the shim is designed to be fire-and-forget.

### Install output

`handleInstall()` in `packages/cli/src/cli.ts` performs three sequential steps:

1. Copy skills.
2. Install the Obsidian MCP server.
3. Configure agent hooks (unless `--no-hooks`).

The Obsidian MCP step logs:

```
Installing Obsidian MCP server...
```

Even when the server is already installed, the word "Installing" is printed, which is misleading. The final message distinguishes "Installed ..." from "already installed ...", but the initial progress line dominates the output.

The hook step logs:

```
Configured agent hooks:
  ✓ kimi
  - claude (skipped)
  ...
```

This is reasonably clear, but it can be improved:

- The word "Configured" is inaccurate when every agent is skipped.
- There is no hint about what to do next (e.g., start the dashboard).

### Idempotency of backups

`installHooksForAgent()` in `packages/cli/src/hooks.ts` currently creates a backup whenever `options.backup` is true and a config file exists, even if the file is already up to date. Repeated installs therefore create a new timestamped backup on every run, which is technically safe but noisy and not fully idempotent.

## Changes

### ADDED: `servers/dashboard/bin/crewloop-shim.js`

A new Node.js binary wrapper that requires the compiled dashboard shim and calls `runShim()`.

```javascript
#!/usr/bin/env node
const { runShim } = require('../dist/adapters/shim');
runShim();
```

The file must be executable on Unix-like systems and must use only CommonJS so it runs without a build step.

### MODIFIED: Root `package.json` binary registration

Add `crewloop-shim` to the `bin` field of `package.json` (the `@archznn/crewloop-skills` bundle):

```json
"bin": {
  "crewloop": "packages/cli/bin/crewloop.js",
  "crewloop-shim": "servers/dashboard/bin/crewloop-shim.js"
}
```

This ensures that `npm install -g @archznn/crewloop-skills` places `crewloop-shim` on the user's PATH.

### MODIFIED: `servers/dashboard/package.json` binary registration

Add `crewloop-shim` to the dashboard workspace package for standalone installs:

```json
"bin": {
  "crewloop-dashboard": "bin/crewloop-dashboard.js",
  "crewloop-shim": "bin/crewloop-shim.js"
}
```

### MODIFIED: CLI help text

Update `printHelp()` in `packages/cli/src/cli.ts`.

- Change command description:
  ```
  install              Install CrewLoop skills and configure agent hooks
  ```
- Add a `Hooks:` block:
  ```
  Hooks:
    Supported agents: kimi, claude, codex, agy
    "crewloop install" registers before_tool_use and after_tool_use hooks in
    each agent's config file. The hooks send events to the CrewLoop dashboard
    so it can track the active skill and session state. Use --no-hooks to skip.
  ```
- Add an `Examples:` block:
  ```
  Examples:
    crewloop install
    crewloop install --skill architect --skill engineer
    crewloop install --agent claude --no-hooks
    crewloop install --dry-run
    crewloop list
    crewloop dashboard --port 8080
    crewloop --version
  ```

### MODIFIED: Install output messaging

In `handleInstall()`:

- Change the Obsidian MCP progress header to:
  ```
  Ensuring Obsidian MCP server is installed...
  ```
- Keep final "Installed ..." / "already installed ..." messages.
- Update the hook summary block:
  - If every supported agent is skipped (not installed), print:
    ```
    Agent hooks: no supported agents detected (skipped)
    ```
  - Otherwise print:
    ```
    Configured agent hooks:
      ✓ kimi
      - claude (skipped)
      ...
    ```
  - After a successful hook configuration, print a short hint:
    ```
    Run "crewloop dashboard" to start receiving hook events.
    ```

### MODIFIED: Backup idempotency

In `installHooksForAgent()`:

- Compute whether either `before_tool_use` or `after_tool_use` actually needs to change.
- Only create a backup when at least one hook will be written.
- When the config is already correct, return `status: 'configured'` with `configPath` but no `backupPath`.

### MODIFIED: `AGENTS.md`

Update the install section to state:

- `crewloop install` copies skills, ensures the Obsidian MCP server is installed, and registers `crewloop-shim` hooks for supported agents.
- `crewloop-shim` is installed globally as part of the bundle.
- `--no-hooks` disables hook registration.

## Acceptance Criteria

- After `npm install -g @archznn/crewloop-skills`, the command `crewloop-shim` is available on PATH.
- Running `crewloop-shim kimi --default-skill orchestrator` with a valid Kimi hook JSON payload on stdin exits 0 and posts an event to the dashboard (or fails silently if the dashboard is not running).
- `crewloop -h` contains a `Hooks:` section listing supported agents and explaining automatic hook registration.
- `crewloop -h` contains an `Examples:` section with at least one example per command.
- `crewloop install` prints "Ensuring Obsidian MCP server is installed..." instead of "Installing Obsidian MCP server...".
- `crewloop install` on a system with no supported agents prints "Agent hooks: no supported agents detected (skipped)".
- `crewloop install` twice in a row does not duplicate hook entries and does not create a second backup if the config was already correct.
- `AGENTS.md` accurately describes the install behavior and the `crewloop-shim` binary.
- All existing tests continue to pass; new tests cover help text examples, hook backup idempotency, and the new shim binary wrapper.
