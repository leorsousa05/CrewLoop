# Tasks: Show tool input/output in dashboard timeline

## Implementation

- [x] Add `input`/`output` to `normalizeKimi()` in `servers/dashboard/src/adapters/kimi.ts`.
- [x] Update `KimiHookPayload` to use the real Kimi key `tool_output` (string or object) instead of `tool_response`.
- [x] Wrap string `tool_output` into `{ output: string }` so the UI can render it.
- [x] Add `input`/`output` to `normalizeCodex()` in `servers/dashboard/src/adapters/codex.ts`.
- [x] Ensure `buildEvent()` in `servers/dashboard/src/adapters/shim.ts` preserves `input`/`output`.
- [x] Add adapter unit tests and update shim binary/buildEvent tests.

## Testing

- [x] Run `npm run build && npm test` in `servers/dashboard`.
- [x] Confirm all 52 server tests and 22 UI tests pass.

## Verification

- [x] Trigger a Kimi tool call and verify the dashboard WebSocket events include `input` and `output`.
