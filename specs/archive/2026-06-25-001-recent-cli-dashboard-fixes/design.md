# Design: Recent CLI and Dashboard Fixes

## Architecture Overview

The changes reinforce two existing boundaries:

1. **CLI coordinator (`packages/cli/src/cli.ts`)** — responsible for validating prerequisites before spawning the dashboard child process.
2. **Dashboard server (`servers/dashboard/src/`)** — responsible for graceful startup failure and clear error reporting.

No new components were added. The fixes are localized improvements to error handling and dependency wiring.

## Directory Structure

```
loop-engineering-agents/
├── package.json                         # ADDED ws dependency
├── packages/cli/
│   ├── package.json                     # version bump
│   └── src/
│       └── cli.ts                       # ADDED checkDashboardDependencies, fixed resolvePackageRoot
└── servers/dashboard/
    ├── package.json                     # unchanged
    └── src/
        ├── index.ts                     # ADDED handleFatalError + global handlers
        ├── server.ts                    # ADDED formatListenError + one-time error listener
        └── server.test.ts               # ADDED port-in-use test
```

## Core Components

### 1. `checkDashboardDependencies(packageRoot: string): string[]`

- Reads `servers/dashboard/package.json`.
- Iterates over `dependencies` keys.
- Attempts to resolve each dependency from the dashboard directory.
- Returns a list of missing package names.

This is a pure validation step with no side effects.

### 2. `formatListenError(err: NodeJS.ErrnoException): Error`

- Maps well-known error codes to human-readable messages.
- Falls back to the original error message for unknown codes.
- Keeps the original `code` property on the returned error for programmatic use.

### 3. `handleFatalError(err: unknown): void`

- Normalizes unknown errors to a string message.
- Prints to `stderr`.
- Exits the process with code `1`.
- Registered for both synchronous and promise rejections.

## Contracts

No public TypeScript interfaces changed. The existing `createDashboardServer(config)` contract is unchanged; only its internal `start()` rejection behavior improved.

## Data Flow

### CLI dashboard startup flow

```
user runs: crewloop dashboard
  ↓
resolvePackageRoot() finds package root
  ↓
checkDashboardDependencies(packageRoot) validates ws and other deps
  ↓
if missing deps → print error list → exit 1
  ↓
spawn dashboard child process with stdio: 'inherit'
```

### Dashboard listen flow

```
createDashboardServer(config).start()
  ↓
register one-time 'error' listener on httpServer and wss
  ↓
httpServer.listen(port, host)
  ↓
on success → remove error listeners → log URL → resolve
on error → remove listeners → formatListenError(err) → reject
```

## Test Plan

### Unit / integration tests

- `servers/dashboard/src/server.test.ts`: assert that starting two servers on the same port rejects with `"already in use"`.

### Manual tests

- Install `@archznn/crewloop-skills` in a clean environment, run `crewloop dashboard`, and verify it starts without `ws` resolution errors.
- Start `crewloop dashboard` twice and verify the second instance prints the friendly port-in-use message.
- Attempt to bind to a privileged port (e.g., 80) and verify the friendly permission-denied message.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding `ws` to root `dependencies` creates duplicate installs. | Low | `ws` is already required; root declaration only ensures availability. |
| Global `uncaughtException` handler hides unexpected bugs. | Low | Handler prints the message and exits; stack traces can be re-enabled during development. |
| `checkDashboardDependencies` may miss peer or optional dependencies. | Low | Only declared `dependencies` are checked; this matches the dashboard runtime requirement. |

## Deferred Items

- Auto-installation of missing dashboard dependencies is out of scope; the CLI only reports the problem.
- Per-agent hook configuration remains manual; addressed in separate specs.
