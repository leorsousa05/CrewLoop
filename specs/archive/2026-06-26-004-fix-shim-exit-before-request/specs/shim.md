# Spec Delta: `crewloop-shim` request lifecycle

## MODIFIED

### `servers/dashboard/src/adapters/shim.ts`

Current behavior:

```ts
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw);
    const event = buildEvent(source, payload, defaultSkill);
    if (event) {
      postEvent(event);
    }
  } catch {
    // Fail silently so the agent is never blocked.
  }
  process.exit(0);
});
```

`postEvent` starts an asynchronous `http.request()` and then `process.exit(0)` terminates the process before the request is sent.

New behavior: remove the synchronous `process.exit(0)` call from the `end` handler. The process will exit naturally once the request completes, errors, or times out. If there is no event to send, the process also exits naturally because no async work remains.

### `servers/dashboard/src/tests/shim.test.ts`

Add a regression test that:

1. Starts a local HTTP server on an unused port that expects `POST /event`.
2. Invokes the shim binary with `CREWLOOP_DASHBOARD_URL` pointing at the test server.
3. Pipes a valid Kimi `PreToolUse` payload to stdin.
4. Asserts the server received the request before the shim process closed.
