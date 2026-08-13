# Tasks: [Change Name]

> Granularity rules (do not delete this block — it defines what a valid task is):
> - One task = one cohesive set of files (max ~3 unrelated files).
> - Every task MUST list **Files**, **Depends on**, **Verification**, and **Done when**.
> - `Done when` MUST cite the Acceptance Criteria IDs (AC1, AC2...) from `proposal.md` it proves, and the test/observable behavior that demonstrates it. "Code compiles" is never sufficient.
> - Order tasks by dependency; each step must end in a verifiable state.

## Phase 1: Implementation

- [ ] **Task 1: [Short Title]**
  - **Files:** `src/example.ts`, `tests/example.test.ts`
  - **Depends on:** None
  - **Verification:** `npm test -- --grep "example"` or `python3 script.py`
  - **Done when:** Tests covering AC1 pass (including the failure scenarios from design.md's edge case matrix).

- [ ] **Task 2: [Short Title]**
  - **Files:** `src/handler.ts`
  - **Depends on:** Task 1
  - **Verification:** `npm run build`
  - **Done when:** Code compiles without errors AND AC2's error path behaves as specified in design.md.

## Phase 2: Final Verification

- [ ] **Task 3: Full Suite Verification**
  - **Files:** `skills/`
  - **Depends on:** Task 1, Task 2
  - **Verification:** `npm test` or `python3 scripts/validate-skills.py`
  - **Done when:** Complete test suite passes with 0 errors and every AC in proposal.md is checked off.
