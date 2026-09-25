# spec-059-dashboard-acceptance-checker-state-independent-tests

---
name: spec-059-dashboard-acceptance-checker-state-independent-tests
domain: 02-dashboard
status: completed
created: 2026-09-25
completed: 2026-09-25
supersedes: []
---

# Dashboard Acceptance Checker State-Independent Tests

## Objective

Keep the acceptance-checker tests valid whether the repository's manual matrix is pending or complete. Test incomplete and complete outcomes using deterministic temporary fixtures instead of assuming a particular user-recorded release state.

## Context

- The matrix checker was introduced in [Spec 058](spec-058-acceptance-matrix-completeness-check.md).
- The real matrix is now complete, so tests that require it to remain incomplete fail after manual acceptance is recorded.

## Requirements

1. Incomplete-matrix assertions use a deterministic fixture with all 112 view cells and 12 interaction rows pending.
2. Complete-matrix assertions use a deterministic fixture with all required run-record fields, 112 recorded view cells, and 12 recorded interaction rows.
3. CLI tests pass temporary fixture paths and verify the expected exit code and bounded output for both states.
4. Tests do not mutate the checked-in manual acceptance matrix.

## Behavior / Flow

1. Read the checked-in matrix only as fixture source material.
2. Normalize a temporary copy into a known incomplete state or a known complete state.
3. Run `analyzeAcceptanceMatrix` and `runAcceptanceMatrixCheck` against those states.
4. Remove temporary files after each CLI check.

## Constraints

- Do not change the acceptance checker contract or output format.
- Do not change the operator-recorded acceptance results or current run record.
- Do not install dependencies or modify runtime dashboard code.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Complete checked-in matrix | Fixture normalization still produces a deterministic incomplete case. |
| Pending checked-in matrix | Fixture normalization still produces a deterministic complete case. |
| Malformed table or unsupported option | Existing fail-closed assertions continue to require an invalid result or usage exit code. |
| Temporary-file creation or cleanup | Use a unique temporary directory and remove it in `finally`. |

## Acceptance Criteria

- AC-01: Given the checked-in matrix is complete, when the incomplete-fixture test runs, then it reports 112 pending view cells, 12 pending interaction rows, and exit code 1.
- AC-02: Given a complete fixture, when the CLI checker runs, then it reports `COMPLETE` with exit code 0 and no stderr output.
- AC-03: Given either fixture, when the checker runs, then the fixture contents and checked-in matrix remain unchanged.
- AC-04: Given malformed input or an unknown option, when the checker is called, then existing invalid-input behavior remains covered.

## Done When

- [x] AC-01 — proven by `npm run test:dashboard-acceptance` with a deterministic incomplete fixture.
- [x] AC-02 — proven by `npm run test:dashboard-acceptance` with a deterministic complete fixture.
- [x] AC-03 — proven by fixture-preservation assertions and the checked-in matrix remaining unchanged.
- [x] AC-04 — proven by the malformed-input and unknown-option tests in `npm run test:dashboard-acceptance`.
