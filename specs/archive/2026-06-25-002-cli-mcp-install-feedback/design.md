# Design: CLI MCP Install Feedback

## Architecture Overview

The MCP installer is already a standalone module (`packages/cli/src/mcp.ts`) with a clear contract. This change keeps the module self-contained and only adds an optional callback for observability. The CLI coordinator (`packages/cli/src/cli.ts`) decides how to render that observability.

### Patterns Used

- **Observer pattern:** `onProgress` callback lets callers react to installer state without changing installer logic.
- **Strategy pattern:** The CLI chooses human-friendly rendering; tests use a recording strategy.

## Directory Structure

```
packages/cli/
├── package.json                         # unchanged
└── src/
    ├── cli.ts                           # MODIFIED: pass onProgress, render steps
    ├── mcp.ts                           # MODIFIED: add McpInstallStep, onProgress, durationMs
    └── tests/
        └── mcp.test.ts                  # MODIFIED: progress callback tests
```

## Core Components

### 1. `McpInstallStep` union type

```typescript
export type McpInstallStep =
  | 'check_python'
  | 'create_venv'
  | 'install_package'
  | 'expose_binary'
  | 'complete';
```

Machine-readable identifiers let tests assert ordering without relying on user-facing messages.

### 2. `McpInstallProgress` payload

```typescript
export interface McpInstallProgress {
  step: McpInstallStep;
  message: string;
}
```

The payload is intentionally small. Future steps (e.g., `upgrade_pip`) can add new `McpInstallStep` values without breaking callers.

### 3. `McpInstallResult` extension

```typescript
export interface McpInstallResult {
  installed: boolean;
  skipped: boolean;
  binaryPath?: string;
  error?: Error;
  durationMs?: number;
}
```

`durationMs` is optional so that callers that do not need timing can ignore it.

### 4. `installMcpServer` with progress

The function signature becomes:

```typescript
export function installMcpServer(
  mcpSourceDir: string,
  options: McpInstallOptions = {}
): McpInstallResult
```

Inside the function:

1. Record `startTime = Date.now()`.
2. Emit `{ step: 'check_python', message: 'Checking Python installation...' }`.
3. If Python is missing, return `{ installed: false, error, durationMs: Date.now() - startTime }`.
4. If dry-run, emit `{ step: 'complete', message: 'Would install Obsidian MCP server at <path>' }` and return.
5. Emit and execute each remaining step.
6. Emit `{ step: 'complete', message: 'Obsidian MCP server ready.' }`.
7. Return result with `durationMs`.

### 5. CLI rendering

`handleInstall` passes:

```typescript
onProgress: (p) => console.error(`  ${stepIcon(p.step)} ${p.message}`)
```

Where `stepIcon` maps the final step to `✓` or `✗` based on whether an error occurred. The prefix `  ` keeps output aligned under the header `Installing Obsidian MCP server...`.

## Data Flow

```
crewloop install
  ↓
handleInstall()
  ↓
installSkills() prints skill results
  ↓
installMcpServer(mcpDir, {
  onProgress: (p) => console.error(...)
})
  ↓
emits check_python
  ↓
emits create_venv
  ↓
emits install_package
  ↓
emits expose_binary
  ↓
emits complete
  ↓
handleInstall prints final summary
```

## Contracts

```typescript
// packages/cli/src/mcp.ts

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

export interface McpInstallResult {
  installed: boolean;
  skipped: boolean;
  binaryPath?: string;
  error?: Error;
  durationMs?: number;
}

export function installMcpServer(
  mcpSourceDir: string,
  options?: McpInstallOptions
): McpInstallResult;
```

## Test Plan

### Unit tests in `packages/cli/src/tests/mcp.test.ts`

- **Progress order:** successful install emits all five steps in order.
- **Dry-run progress:** dry-run emits `check_python` and a `complete` dry-run message; does not emit `create_venv`, `install_package`, or `expose_binary`.
- **Missing Python:** emits only `check_python` and returns an error.
- **Pip failure:** emits through `install_package` and returns an error without reaching `complete`.
- **Duration:** returned `durationMs` is a positive number.

### Manual tests

- Run `crewloop install` and observe step-by-step MCP progress.
- Run `crewloop install --dry-run` and verify concise dry-run output.
- Run `crewloop install` with a missing Python command and verify the failing step is shown.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding callbacks makes tests more complex. | Low | Callback is optional; default behavior unchanged. |
| Progress messages could break scripted parsing. | Low | Progress goes to `stderr`; final result remains on `stdout`. |
| `durationMs` may be misleading on fast systems. | Low | Only used for informational output. |

## Deferred Items

- Animated spinners or progress bars are out of scope; text steps are sufficient.
- Verbose pip output is out of scope; pip continues to run with `-q`.
