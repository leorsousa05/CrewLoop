# Design: Make `crewloop-shim` Executable and Improve CLI Help/Output

## Architecture Overview

The fix spans three packages in the monorepo:

1. **`servers/dashboard/`** — owns the shim logic and now exposes it as a binary.
2. **`packages/cli/`** — owns argument parsing, help text, install orchestration, and hook writers.
3. **Root `@archznn/crewloop-skills` package** — owns the public npm distribution and the global binary registrations.

The architecture keeps the existing separation of concerns:

- The dashboard package remains the source of truth for hook normalization and event posting.
- The CLI package remains the source of truth for help text and install-time configuration.
- The root bundle remains the only artifact most users install globally.

### Patterns Used

- **Adapter pattern:** `servers/dashboard/src/adapters/shim.ts` already normalizes Kimi and Codex payloads into a common `DashboardEvent` before posting to the dashboard. The new binary is a thin adapter from CLI stdin to that function.
- **Strategy pattern:** `packages/cli/src/hooks.ts` uses per-agent writers. No changes to writer interfaces are required.
- **Idempotency pattern:** Hook insertion already checks for existing equivalent entries. This change extends idempotency to backup creation.
- **Command/Query separation:** `printHelp()` is a pure query (string). `handleInstall()` performs commands with visible side effects. The new messaging keeps this separation clear.

## Directory Structure

```
loop-engineering-agents/
├── package.json                                     # MODIFIED: add crewloop-shim bin
├── AGENTS.md                                        # MODIFIED: document shim binary
├── packages/cli/src/
│   ├── cli.ts                                       # MODIFIED: help text + install messages
│   ├── hooks.ts                                     # MODIFIED: conditional backups
│   └── tests/
│       ├── cli.test.ts                              # MODIFIED: help assertions
│       └── hooks.test.ts                            # MODIFIED: backup idempotency test
└── servers/dashboard/
    ├── package.json                                 # MODIFIED: add crewloop-shim bin
    ├── bin/
    │   ├── crewloop-dashboard.js                    # unchanged
    │   └── crewloop-shim.js                         # NEW
    └── src/
        └── adapters/
            └── shim.ts                              # unchanged (already exports runShim)
```

## Core Components

### 1. `servers/dashboard/bin/crewloop-shim.js`

Responsibilities:

- Load the compiled dashboard shim from `../dist/adapters/shim.js`.
- Call `runShim()` to parse stdin, detect the agent source, normalize the payload, and post it to the dashboard.

Implementation sketch:

```javascript
#!/usr/bin/env node
const { runShim } = require('../dist/adapters/shim');
runShim();
```

Requirements:

- Must be committed as a plain JavaScript file (not TypeScript) so it works without an additional build step.
- Must be included in `servers/dashboard/package.json` `files` (already covered by `"bin/"`).
- Must be included in the root `package.json` `files` (already covered by `"servers/dashboard/"`).

### 2. Root `package.json` binary registration

The root `@archznn/crewloop-skills` package is what users install globally. Its `bin` field currently maps only `crewloop`. Add the shim:

```json
{
  "bin": {
    "crewloop": "packages/cli/bin/crewloop.js",
    "crewloop-shim": "servers/dashboard/bin/crewloop-shim.js"
  }
}
```

When npm installs this package globally, it symlinks both commands into the user's PATH.

### 3. `servers/dashboard/package.json` binary registration

For consistency and for users who install the dashboard workspace directly:

```json
{
  "bin": {
    "crewloop-dashboard": "bin/crewloop-dashboard.js",
    "crewloop-shim": "bin/crewloop-shim.js"
  }
}
```

### 4. CLI help text (`packages/cli/src/cli.ts`)

The `printHelp()` function remains a pure string builder. It is extended to include three new sections.

Updated shape:

```
crewloop <command> [options]

Commands:
  install              Install CrewLoop skills and configure agent hooks
  list                 List available skills
  dashboard            Start the real-time skill dashboard
  version              Show version
  help                 Show this help message

Hooks:
  Supported agents: kimi, claude, codex, agy
  Running "crewloop install" registers before_tool_use and after_tool_use hooks in
  each agent's config file. The hooks send events to the CrewLoop dashboard so it
  can track the active skill and session state. Use --no-hooks to skip this step.

Options:
  --target <dir>       Install skills to a custom directory
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

Examples:
  crewloop install
  crewloop install --skill architect --skill engineer
  crewloop install --agent claude --no-hooks
  crewloop install --dry-run
  crewloop list
  crewloop dashboard --port 8080
  crewloop --version
```

### 5. Install output messaging

The `handleInstall()` function keeps the same three-phase structure, but with clearer wording.

#### Obsidian MCP step

Change the progress header from:

```typescript
console.error('Installing Obsidian MCP server...');
```

to:

```typescript
console.error('Ensuring Obsidian MCP server is installed...');
```

Keep the existing `onProgress` callback and final `console.log` messages for `installed` / `skipped`.

#### Hook step

After calling `installHooks()`, inspect the results:

```typescript
if (args.hooks !== false) {
  const hookResults = installHooks({ dryRun: args.dryRun, backup: true });
  const configuredCount = hookResults.filter((r) => r.status === 'configured').length;

  if (configuredCount === 0) {
    console.log('Agent hooks: no supported agents detected (skipped)');
  } else {
    console.log('Configured agent hooks:');
    for (const result of hookResults) {
      const symbol =
        result.status === 'configured' ? '✓' : result.status === 'error' ? '✗' : '-';
      const reason = result.error
        ? `error: ${result.error.message}`
        : `(${result.status})`;
      console.log(`  ${symbol} ${result.agent} ${reason}`);
    }
    console.log('Run "crewloop dashboard" to start receiving hook events.');
  }
}
```

### 6. Backup idempotency (`packages/cli/src/hooks.ts`)

In `installHooksForAgent()`, determine whether the config will change before creating a backup.

Algorithm:

```typescript
let config = writer.readConfig();
const beforeHook: HookEntry = {
  event: 'before_tool_use',
  command: agent.hooks.beforeToolUseCommand || `crewloop-shim ${agent.id}`,
};
const afterHook: HookEntry = {
  event: 'after_tool_use',
  command: agent.hooks.afterToolUseCommand || `crewloop-shim ${agent.id}`,
};

let needsWrite = false;

if (!config) {
  config = writer.buildDefaultConfig();
  needsWrite = true;
} else {
  if (!writer.hasHook(config, beforeHook)) {
    config = writer.addHook(config, beforeHook);
    needsWrite = true;
  }
  if (!writer.hasHook(config, afterHook)) {
    config = writer.addHook(config, afterHook);
    needsWrite = true;
  }
}

if (options.dryRun) {
  return { agent: agent.id, status: 'configured', configPath: config.path };
}

if (needsWrite && backupPath && fs.existsSync(config.path)) {
  fs.copyFileSync(config.path, backupPath);
}

if (needsWrite) {
  writer.writeConfig(config);
}

return {
  agent: agent.id,
  status: 'configured',
  configPath: config.path,
  backupPath: needsWrite ? backupPath : undefined,
};
```

This preserves the existing contract while avoiding unnecessary backups.

## Contracts / Interfaces

No public TypeScript interfaces change. The only new contract is the CLI surface of `crewloop-shim`.

```
crewloop-shim <source> [--default-skill <skill>]

source: "kimi" | "codex" | "opencode" | "log-watcher"
--default-skill: optional skill name to inject on session_start events
stdin: JSON payload matching the source agent's hook schema
stdout: none
stderr: error message only on invalid source
exit code: 0 on success, 1 on invalid source
```

This contract is already implemented by `runShim()` in `servers/dashboard/src/adapters/shim.ts`.

## Data Flow

```
user runs "crewloop install"
  ├─ skills copied to ~/.agents/skills
  ├─ Obsidian MCP server ensured/installed
  └─ installHooks()
       ├─ for each supported agent (kimi, claude, codex, agy)
       │    ├─ detect if agent is installed
       │    ├─ read agent config
       │    ├─ add before_tool_use / after_tool_use entries
       │    │    pointing to "crewloop-shim <agent> --default-skill orchestrator"
       │    ├─ backup config only if it changed
       │    └─ write config
       └─ return per-agent results

agent (e.g., Kimi) invokes hook on every tool use
  └─ "crewloop-shim kimi --default-skill orchestrator"
       ├─ reads JSON payload from stdin
       ├─ normalizes payload to DashboardEvent
       ├─ injects default skill on session_start
       ├─ sanitizes tool input/response
       └─ POSTs to http://127.0.0.1:7890/event
```

## Test Plan

### `packages/cli/src/tests/cli.test.ts`

- Assert `printHelp()` contains the `Hooks:` section.
- Assert `printHelp()` lists supported agents.
- Assert `printHelp()` contains the `Examples:` section.
- Assert `printHelp()` contains each example command.

### `packages/cli/src/tests/hooks.test.ts`

- Add a test that runs `installHooksForAgent()` twice against a Kimi config that already has the correct hooks.
- Assert the second run returns `status: 'configured'` and `backupPath` is `undefined`.
- Assert the config file still has exactly one `before_tool_use` and one `after_tool_use` entry.

### `servers/dashboard/src/tests/shim.test.ts` (new file)

- Assert `runShim` is exported from `../adapters/shim`.
- Spawn `node bin/crewloop-shim.js kimi` with an empty stdin and assert it exits with code 0.
- Spawn `node bin/crewloop-shim.js unknown` and assert it exits with code 1 and stderr contains "unknown source".

### Manual verification

- `npm run build` in `servers/dashboard`.
- `npm run build` in `packages/cli`.
- `crewloop -h` shows the new sections.
- `crewloop install` on a clean environment configures Kimi hooks and the shim binary is callable.
- `crewloop install` a second time does not create a new backup.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `crewloop-shim` still not on PATH if user installs only `@archznn/crewloop-cli` | Medium | High | Document that hooks require the full `@archznn/crewloop-skills` bundle; consider making CLI depend on dashboard in a future spec. |
| Existing users already have broken hooks pointing to missing binary | Low | Medium | After this fix, re-running `crewloop install` will correct the config (command string unchanged, binary now exists). |
| Help text line count grows and becomes hard to scan | Low | Low | Keep sections concise; use indentation and blank lines. |
| Backup idempotency change breaks tests that expect a backup on every run | Low | Low | Update tests to assert conditional backup behavior. |

## Trade-offs

- **Binary location:** The shim binary is placed in `servers/dashboard/bin/` because the normalization logic lives in the dashboard package. An alternative would be to move the shim into `packages/cli`, but that would couple the CLI to agent-specific payload formats. Keeping it in the dashboard preserves the current bounded context.
- **Root package `bin` vs. CLI package `bin`:** Registering the binary only in the root bundle means users who install `@archznn/crewloop-cli` directly will not get the shim. This is accepted because the documented install target is the skills bundle, and adding dashboard as a CLI dependency would increase CLI size and complexity.
