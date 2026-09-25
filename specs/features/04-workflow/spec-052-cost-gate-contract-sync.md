---
name: spec-052-cost-gate-contract-sync
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Cost Gate Contract Synchronization

## Objective

Synchronize the shared optimization and role handoff documentation with the cost gate shipped in Spec 051.

## Context

- Spec 051 makes cost per correctly completed task a required benchmark gate.
- The implementation and dashboard README enforce that rule, but the shared continuous-optimization reference and Plan/Review handoffs still describe only the older gates.
- Divergent role contracts can cause a future optimizer-policy change to omit required cost evidence.

## Requirements

1. Document the measured cost-per-completed-task gate and its fail-closed unavailable state in the shared optimization reference.
2. Require Plan to carry the cost gate in the benchmark manifest and require Review to verify it before PASS.
3. Keep the recommendation-only boundary, fixed corpus, privacy rules, role separation, and no-new-runtime behavior unchanged.
4. Add no duplicate threshold implementation or new dependency; the benchmark comparator remains the source of gate behavior.

## Acceptance Criteria

- AC-01: The shared optimization reference names the cost gate, default zero regression tolerance, and unavailable-cost failure behavior.
- AC-02: Plan and Review handoffs explicitly require cost evidence and preserve the baseline when it is unavailable or regresses.
- AC-03: Contract tests and documentation review find no stale omission of the cost gate in the active workflow references.
- AC-04: Existing implementation, benchmark, and skill validation behavior remain unchanged.

## Done When

- [x] AC-01 - proven by the updated shared reference
- [x] AC-02 - proven by the updated Plan, Code, and Review handoffs
- [x] AC-03 - proven by the automated workflow contract test and stale-text scan
- [x] AC-04 - proven by the existing benchmark behavior and skill validation

## Verification Evidence

- `scripts/tests/test_automated_workflow.py` - passed: `6/6`.
- `scripts/validate-skills.py` - passed for all 7 skills.
- No benchmark threshold logic was duplicated in the documentation; `benchmark.ts` remains the source of behavior.
