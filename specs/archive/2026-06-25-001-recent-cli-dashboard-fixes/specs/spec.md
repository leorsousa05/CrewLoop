# Spec Delta: Recent CLI and Dashboard Fixes

## Current System State Before the Fixes

- The dashboard server (`servers/dashboard/`) depended on the `ws` package, but `ws` was only declared as a dependency of `servers/dashboard/package.json`.
- When users installed `@archznn/crewloop-skills` globally and ran `crewloop dashboard`, npm did not guarantee that `ws` was available in the root `node_modules`. In some install scenarios the dashboard could not resolve `ws` and crashed at startup.
- The CLI fallback path for resolving the package root (`path.resolve(__dirname, '..', '..')`) was one level too shallow when the CLI was bundled inside the root package, causing `crewloop` to fail to find skills in installed builds.
- When the dashboard port was already in use, Node.js printed a raw `EADDRINUSE` stack trace. The same happened for `EACCES` (permission denied) errors.

## Changes

### ADDED: Root dependency on `ws`

- **File:** `package.json`
- **Change:** Added `"ws": "^8.18.0"` to the root `dependencies` object so that the published `@archznn/crewloop-skills` package always installs `ws` at the root `node_modules` level, making it resolvable by the dashboard regardless of workspace hoisting behavior.

### ADDED: Dashboard dependency check in CLI

- **File:** `packages/cli/src/cli.ts`
- **Change:** Added `checkDashboardDependencies(packageRoot)` before spawning the dashboard process. The helper reads `servers/dashboard/package.json`, enumerates its `dependencies`, and attempts `require.resolve(dep, { paths: [dashboardDir] })` for each one.
- If any dependency is missing, the CLI prints a clear error list and suggests reinstalling `@archznn/crewloop-skills` instead of crashing later inside the dashboard process.

### MODIFIED: Package root resolution fallback

- **File:** `packages/cli/src/cli.ts`
- **Change:** Changed the bundled fallback from `path.resolve(__dirname, '..', '..')` to `path.resolve(__dirname, '..', '..', '..')` to match the actual nesting of `packages/cli/dist/cli.js` inside the root package.

### MODIFIED: Package root error message

- **File:** `packages/cli/src/cli.ts`
- **Change:** Updated the error message to recommend reinstalling `@archznn/crewloop-skills` instead of the older `@archznn/crewloop-cli`.

### ADDED: Friendly listen-error formatting

- **File:** `servers/dashboard/src/server.ts`
- **Change:** Added `formatListenError(err)` that translates `EADDRINUSE` into `"Port <port> is already in use. Use --port <number> to choose another port."` and `EACCES` into `"Permission denied to use port <port>. Try a port above 1024 or use --port <number>."`.
- The `start()` method now registers a one-time `error` listener on both the HTTP server and the WebSocket server, removes it on successful listen, and rejects with the formatted error.

### ADDED: Global fatal error handlers

- **File:** `servers/dashboard/src/index.ts`
- **Change:** Added `process.on('uncaughtException', handleFatalError)` and `process.on('unhandledRejection', handleFatalError)`. Both handlers print only the error message (no stack trace for known errors) and exit with code `1`.
- The previous `main().catch(...)` error handler was replaced with the shared `handleFatalError` function.

### ADDED: Test for port-in-use error

- **File:** `servers/dashboard/src/server.test.ts`
- **Change:** Added an integration test that starts a second dashboard server on the same port and asserts that the rejection message contains `"already in use"`.

### MODIFIED: Version bumps

- **Files:** `package.json`, `packages/cli/package.json`
- **Change:** Bumped from `0.4.1` → `0.4.2` (CLI fix) → `0.4.3` (dashboard fix).

## Acceptance Criteria

- `crewloop dashboard` reports missing `ws` dependency clearly instead of crashing inside the dashboard process.
- The dashboard server prints a user-friendly message when the default port is in use.
- The dashboard server prints a user-friendly message when it lacks permission to bind the port.
- The existing test suite passes.
