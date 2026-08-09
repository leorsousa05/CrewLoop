# Tasks: Fix AGY hooks.json stale event pruning

> Lightweight spec (bugfix). Root cause proven empirically on 2026-08-09:
> AGY's hooks parser rejects the **entire** `crewloop` named hook group when it
> contains unsupported event keys (`SessionStart`, `SessionEnd`):
> `Failed to parse hooks file ~/.gemini/config/hooks.json: invalid hook "crewloop": command hook must specify 'command'`.
> With those keys removed, a real `agy -p` session fires PreInvocation /
> PreToolUse / PostToolUse / Stop and all events reach the dashboard.
>
> `agents.ts` already defines the correct AGY `lifecycleEvents` (`PreInvocation`,
> `Stop`), but `GroupedJsonHookWriter.syncHooks` only adds/updates the events in
> the current hook list — it never removes event keys that are no longer desired.
> Stale CrewLoop-owned `SessionStart`/`SessionEnd` entries therefore survive every
> `crewloop install` re-run and keep the whole file invalid forever.

## Phase 1: Prune stale CrewLoop-owned events in syncHooks

- [x] **Task 1: Remove non-desired CrewLoop-owned event keys in `GroupedJsonHookWriter.syncHooks`**
  - **Files:** `packages/cli/src/hooks.ts`, `packages/cli/src/tests/hooks.test.ts`
  - **Depends on:** None
  - **Contract:** After merging the desired `hooks` into the root object, iterate
    every remaining event key in `root` that is NOT in the desired set. For each:
    - Grouped shape: drop matcher blocks where `isCrewLoopMatcherBlock(block)` is true.
    - Flat shape: drop `{type, command}` entries whose command `isCrewLoopCommand`.
    - If the event array becomes empty, delete the event key from `root`.
    - Never touch entries that are not CrewLoop-owned.
  - **Verification:** `npm test -- --grep "hooks"` in `packages/cli/`
  - **Done when:**
    - A config containing CrewLoop-owned `SessionStart`/`SessionEnd` entries (the
      current broken production state) syncs to a file without those keys.
    - Non-CrewLoop entries under non-desired event keys are preserved.
    - Existing hooks tests still pass.

## Phase 2: End-to-end validation

- [x] **Task 2: Reproduce the fix against a real hooks.json state**
  - **Files:** `packages/cli/` (no source changes; validation only)
  - **Depends on:** Task 1
  - **Verification:** `npm run build` in `packages/cli/`, then run a sync/install
    dry-run (or unit-level harness) against a fixture replicating the current
    `~/.gemini/config/hooks.json` (crewloop group with PreToolUse, PostToolUse,
    PreInvocation, Stop, SessionStart, SessionEnd) and assert the output contains
    only the four supported events.
  - **Done when:** The generated hooks.json contains no `SessionStart`/`SessionEnd`
    keys and matches the shape empirically validated with the `agy` binary
    (grouped matcher structure for PreToolUse/PostToolUse, flat for
    PreInvocation/Stop).

## Notes for CrewLoop Code

- Do NOT change `agents.ts` AGY `lifecycleEvents` — already correct in the working tree.
- Do NOT change the dashboard adapter — verified working end-to-end.
- Out of scope: `crewloop-guard` wiring, dashboard UI, other agents' writers.
- Reference evidence: AGY parser log at `~/.gemini/antigravity-cli/log/`; supported
  events per embedded AGY docs: PreToolUse, PostToolUse (grouped); PreInvocation,
  PostInvocation, Stop (flat). Any other key invalidates the whole named group.
