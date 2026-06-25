# Spec Delta: CLI MCP Install Feedback

## Current System State

`packages/cli/src/mcp.ts` exposes a single function:

```typescript
export function installMcpServer(
  mcpSourceDir: string,
  options: McpInstallOptions = {}
): McpInstallResult
```

The function performs the following steps silently:

1. Checks whether Python is available.
2. Creates or recreates a virtual environment at `servers/obsidian-mcp/.venv`.
3. Runs `pip install -q -e <mcpSourceDir>`.
4. Creates a symlink (Unix) or `.cmd` wrapper (Windows) in `~/.local/bin`.
5. Returns `McpInstallResult` with `installed`, `skipped`, `binaryPath`, and optional `error`.

`packages/cli/src/cli.ts` calls this function and prints one of three outcomes:

- `Installed Obsidian MCP server at <path>`
- `Obsidian MCP server already installed at <path>`
- `MCP install warning: <message>`

There is no intermediate feedback between the start of the call and the final result.

## Changes

### ADDED: Progress callback to `McpInstallOptions`

- **File:** `packages/cli/src/mcp.ts`
- **Change:** Add an optional `onProgress` callback to `McpInstallOptions`:

```typescript
export type McpInstallStep =
  | 'check_python'
  | 'create_venv'
  | 'install_package'
  | 'expose_binary'
  | 'complete';

export interface McpInstallProgress {
  step: McpInstallStep;
  message: string;
}

export interface McpInstallOptions {
  dryRun?: boolean;
  force?: boolean;
  pythonCmd?: string;
  localBinDir?: string;
  onProgress?: (progress: McpInstallProgress) => void;
}
```

### ADDED: Step-by-step progress emissions

- **File:** `packages/cli/src/mcp.ts`
- **Change:** Invoke `onProgress` at the start of each meaningful step:
  - `check_python`: `"Checking Python installation..."`
  - `create_venv`: `"Creating Python virtual environment..."`
  - `install_package`: `"Installing Obsidian MCP server package..."`
  - `expose_binary`: `"Exposing obsidian-mcp binary..."`
  - `complete`: `"Obsidian MCP server ready."`

If `options.dryRun` is true, emit `complete` with a dry-run message and skip the real work.

### ADDED: Duration tracking

- **File:** `packages/cli/src/mcp.ts`
- **Change:** Add `durationMs?: number` to `McpInstallResult`. The value measures the wall-clock time from the first progress emission to the return of the result.

### MODIFIED: CLI install output

- **File:** `packages/cli/src/cli.ts`
- **Change:** Pass an `onProgress` callback to `installMcpServer`. The callback prints each step to `stderr` using a consistent prefix:

```
Installing Obsidian MCP server...
  ✓ Python found
  ✓ Virtual environment ready
  ✓ Package installed
  ✓ Binary exposed at /home/user/.local/bin/obsidian-mcp
  ✓ Done (2.4s)
```

On failure, the failing step is marked with `✗` and the warning line is still printed.

### ADDED: Unit tests for progress callback

- **File:** `packages/cli/src/tests/mcp.test.ts`
- **Change:** Add tests that:
  - Record emitted steps and assert the order is `check_python`, `create_venv`, `install_package`, `expose_binary`, `complete`.
  - Assert that dry-run emits only the dry-run steps.
  - Assert that missing Python emits `check_python` followed by an error result without subsequent steps.

## Acceptance Criteria

- Running `crewloop install` shows progress messages for each MCP install sub-step.
- `--dry-run` prints a single dry-run MCP message without creating a venv.
- Progress output does not interfere with the final result printing.
- Existing tests continue to pass.
- New tests cover progress ordering and dry-run behavior.
