# Tasks: Security Guard for Agent Hooks

> Granularity rules:
> - One task = one cohesive set of files (max ~3 unrelated files).
> - Every task MUST list **Files**, **Depends on**, **Verification**, and **Done when**.
> - Order tasks by dependency; each step must end in a verifiable state.

## Phase 1: Guard Core (CLI)

- [x] **Task 1: Guard types and policy loader**
  - **Files:** `packages/cli/src/guard/guard.types.ts`, `packages/cli/src/guard/policy.ts`
  - **Depends on:** None
  - **Verification:** `npm test -- --grep "policy"` in `packages/cli/`
  - **Done when:** Policy loader correctly loads/merges global and workspace YAML, validates schema, and fails open on invalid input.

- [x] **Task 2: Rule evaluator**
  - **Files:** `packages/cli/src/guard/evaluator.ts`, `packages/cli/src/guard/normalize.ts`
  - **Depends on:** Task 1
  - **Verification:** `npm test -- --grep "evaluator"` in `packages/cli/`
  - **Done when:** Evaluator returns correct `allow`/`block` decisions for tool-name, command-regex, and path-glob rules across all supported agent payloads.

- [x] **Task 3: Guard binary and shim delegation**
  - **Files:** `packages/cli/bin/crewloop-guard.js`, `packages/cli/src/guard/index.ts`, `packages/cli/src/guard/post.ts`
  - **Depends on:** Task 2
  - **Verification:** `node packages/cli/bin/crewloop-guard.js kimi < fixture.json` against test fixtures
  - **Done when:** Binary reads stdin, evaluates policy, posts decision, and delegates to `crewloop-shim` when allowed; exits 1 only when blocking on a capable agent.

## Phase 2: Hook Installation

- [x] **Task 4: Agent guard capability flags and CLI option**
  - **Files:** `packages/cli/src/agents.ts`, `packages/cli/src/cli.ts`
  - **Depends on:** Task 3
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** Each agent has `guardCapable`, and `crewloop install --guard` / `crewloop install --no-guard` is wired.

- [x] **Task 5: Hook writer updates**
  - **Files:** `packages/cli/src/hooks.ts`
  - **Depends on:** Task 4
  - **Verification:** `npm test` in `packages/cli/`
  - **Done when:** PreToolUse hooks emit `crewloop-guard <agent>` when guard enabled; PostToolUse and lifecycle hooks remain shim-only; existing shim-only installs are preserved when guard disabled.

## Phase 3: Dashboard Server

- [x] **Task 6: Security event types and shim normalization**
  - **Files:** `servers/dashboard/src/types.ts`, `servers/dashboard/src/adapters/shim.ts`
  - **Depends on:** None
  - **Verification:** `npm test -- --grep "shim"` in `servers/dashboard/`
  - **Done when:** `security_decision` is a valid event type and the shim can build such events from `source: 'guard'` payloads.

- [x] **Task 7: Session state and API for security decisions**
  - **Files:** `servers/dashboard/src/state.ts`, `servers/dashboard/src/presenter.ts`, `servers/dashboard/src/api/security.ts`, `servers/dashboard/src/server.ts`
  - **Depends on:** Task 6
  - **Verification:** `npm test` in `servers/dashboard/`
  - **Done when:** Decisions are stored per session, capped, and exposed via `GET /api/security?sessionId=...`.

## Phase 4: Dashboard UI

- [x] **Task 8: Security view and navigation**
  - **Files:** `servers/dashboard/ui/src/lib/navigation.ts`, `servers/dashboard/ui/src/hooks/useSecurity.ts`, `servers/dashboard/ui/src/views/Security.tsx`
  - **Depends on:** Task 7
  - **Verification:** `npm test -- --grep "Security"` in `servers/dashboard/ui/`
  - **Done when:** Security view renders decisions with tool, badge, rule, reason, and timestamp; navigation item is reachable.

## Phase 5: Verification & Documentation

- [x] **Task 9: End-to-end guard integration**
  - **Files:** `packages/cli/`, `servers/dashboard/`
  - **Depends on:** Task 5, Task 7
  - **Verification:** Run `crewloop install --guard` locally, trigger a Kimi tool call, confirm dashboard Security view shows decision.
  - **Done when:** A real agent run produces visible allow/block decisions in the dashboard.

- [x] **Task 10: Living spec and ADR updates**
  - **Files:** `specs/living/cli/hooks.md`, `specs/living/dashboard/spec.md`, `specs/decisions/010-security-guard-architecture.md`
  - **Depends on:** Task 8
  - **Verification:** `python scripts/validate-skills.py` and `npm run build` in both packages
  - **Done when:** ADR is accepted, living specs reflect guard behavior, and all validation passes.
