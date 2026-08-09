# Tasks: Agent-Specific Guard Tool & Command Matching

- [x] Ensure `extractCommand` in `packages/cli/src/guard/normalize.ts` handles AGY `CommandLine` / `commandLine` fields.
  - **Files:** `packages/cli/src/guard/normalize.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** `extractCommand` extracts `CommandLine` correctly for AGY payloads.

- [x] Ensure `extractPaths` in `packages/cli/src/guard/evaluator.ts` matches AGY file parameters (`AbsolutePath`, `TargetFile`).
  - **Files:** `packages/cli/src/guard/evaluator.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** `extractPaths` extracts absolute paths from `AbsolutePath` and `TargetFile`.

- [x] Add unit tests for AGY `run_command` guard evaluation in `packages/cli/src/tests/guard.test.ts`.
  - **Files:** `packages/cli/src/tests/guard.test.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** Unit tests pass verifying policy evaluation for AGY `run_command` payloads with command matching rules.
