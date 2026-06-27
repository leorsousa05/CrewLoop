# Proposal: Fix `crewloop-shim` exiting before HTTP request is sent

## Problem

Kimi Code hooks are installed in the correct config file (`~/.kimi-code/config.toml`) and the dashboard is running, but no events arrive on the dashboard.

Root cause identified by systematic debugging: `crewloop-shim` calls `process.exit(0)` inside the `process.stdin.on('end')` handler immediately after starting the asynchronous `http.request()`. Because `process.exit()` terminates the Node.js event loop, the HTTP request is cancelled before it can be sent to the dashboard.

Evidence: a local test server listening on an alternate port never receives a request when `crewloop-shim` is invoked with a valid `PreToolUse` payload.

## Goal

Fix the shim so it keeps the process alive until the HTTP request either completes, errors, or times out, ensuring the event is actually delivered to the dashboard.

## Scope

- Modify `servers/dashboard/src/adapters/shim.ts`.
- Add a regression test in `servers/dashboard/src/tests/shim.test.ts` that verifies the request is received by a server before the shim exits.

## Non-goals

- No changes to hook formats, config paths, or agent writers.
- No changes to dashboard event handling.

## Acceptance criteria

- The shim delivers a `POST /event` to the dashboard when invoked with a valid payload.
- Existing shim tests still pass.
- New regression test fails before the fix and passes after the fix.
