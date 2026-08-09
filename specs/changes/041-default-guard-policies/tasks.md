# Tasks: Default Security Guard Policies on Install

- [x] Update `DEFAULT_POLICY` in `packages/cli/src/guard/policy.ts` to include default `confirm git push` and `confirm git force push` rules.
  - **Files:** `packages/cli/src/guard/policy.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** `DEFAULT_POLICY` evaluates `confirm` for `git push` tool calls out-of-the-box.

- [x] Ensure `crewloop install` creates `~/.crewloop/guard.yml` if not present.
  - **Files:** `packages/cli/src/installer.ts`, `packages/cli/src/guard/policy.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** Global `guard.yml` is created on install.

- [x] Update unit tests in `packages/cli/src/tests/guard.test.ts`.
  - **Files:** `packages/cli/src/tests/guard.test.ts`
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** Tests pass verifying default policy rules for git push.
