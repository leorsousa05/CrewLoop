# Tasks: Fix `crewloop-shim` exit-before-request bug

1. [x] Add regression test in `servers/dashboard/src/tests/shim.test.ts` that verifies the shim sends a request before exiting.
2. [x] Modify `servers/dashboard/src/adapters/shim.ts` to keep the process alive until the HTTP request finishes.
3. [x] Run `npm run build` and `npm test` in `servers/dashboard/`.
4. [x] Confirm the manual reproduction (`/tmp/test-shim.js`) now receives the request.
5. [x] Restore user `~/.kimi/config.toml` and `~/.kimi-code/config.toml` from backups and remove debug hooks.
6. [ ] Route to reviewer.
