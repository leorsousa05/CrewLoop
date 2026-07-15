# Tasks: OpenCode Hook Support

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Implementation
- [x] Add `'plugin'` to `HookFormat` type in `packages/cli/src/agents.ts`
- [x] Add `opencode` entry to `SUPPORTED_AGENTS` in `packages/cli/src/agents.ts`
- [x] Implement `OpenCodePluginWriter` in `packages/cli/src/hooks.ts`
- [x] Register `opencode` writer in `createWriter` in `packages/cli/src/hooks.ts`
- [x] Add `normalizeOpenCode` to `servers/dashboard/src/adapters/shim.ts`
- [x] Add `opencode` to `normalizePayload` switch in `servers/dashboard/src/adapters/shim.ts`
- [x] Update `detectSource` error message in `servers/dashboard/src/adapters/shim.ts` to include `opencode`
- [x] Update `printHelp` in `packages/cli/src/cli.ts` to list `opencode` as supported
- [x] Update `packages/cli/AGENTS.md` with opencode plugin format documentation

## Testing
- [x] Unit test: `OpenCodePluginWriter` generates correct plugin template
- [x] Unit test: `OpenCodePluginWriter` is idempotent on reinstall
- [x] Unit test: `OpenCodePluginWriter` backs up existing non-CrewLoop plugin file
- [x] Unit test: `OpenCodePluginWriter` preserves user plugins without CrewLoop marker
- [x] Unit test: `normalizeOpenCode` maps `tool_start` and `tool_end` correctly
- [x] Unit test: `normalizeOpenCode` returns `undefined` for malformed payloads
- [x] Integration test: `installHooks` returns `configured` for opencode when `~/.config/opencode/skills` exists
- [x] Regression: all existing agent tests (kimi, claude, codex, agy) still pass

## Verification
- [x] Run `npm run build` in `packages/cli/` — compiles without errors
- [x] Run `npm test` in `packages/cli/` — all 64 tests pass
- [x] Run `npm run build` in `servers/dashboard/` — compiles without errors
- [x] Run `npm test` in `servers/dashboard/` — all 121 server + 44 UI tests pass
- [x] Manual verification: `crewloop install --agent opencode --dry-run` shows correct paths

## Documentation
- [x] Update living specs if applicable
- [x] Update README.md supported agents list

## Completion
- [ ] Archive change folder to `specs/archive/YYYY-MM-DD-023-opencode-hook-support`
- [x] Update `.spec.yaml` status to completed
