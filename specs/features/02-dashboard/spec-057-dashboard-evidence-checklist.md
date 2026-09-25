---
name: spec-057-dashboard-evidence-checklist
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Dashboard Evidence Checklist Reconciliation

## Objective

Align Spec 031's completion checklist with the automated evidence already shipped
for the dashboard, while preserving the manual visual and contrast gate for the
criteria that automation cannot prove.

## Context

- Active dashboard specification: [`spec-031-dashboard-responsive-ui-refinement.md`](spec-031-dashboard-responsive-ui-refinement.md).
- Manual gate: [`dashboard-acceptance-matrix.md`](../../../tests/dashboard-acceptance-matrix.md).
- Browser preflight: [`dashboard-acceptance-preflight.mjs`](../../../servers/dashboard/scripts/dashboard-acceptance-preflight.mjs).
- Automated UI contracts: [`accessibility-contracts.test.tsx`](../../../servers/dashboard/ui/src/components/accessibility-contracts.test.tsx).
- The repository already records `112/112` route/viewport/theme/density combinations,
  `8/8` interaction cases, rendered contrast evidence, and component/state tests.

## Requirements

1. Mark a Spec 031 criterion complete only when its observable behavior has direct
   automated or recorded evidence.
2. Mark overlay focus lifecycle, hidden focus targets, sibling row semantics, reduced
   motion, and external font policy as automated/recorded where the existing tests or
   preflight cover them.
3. Keep the full visual hierarchy/viewport walkthrough and the human visual/contrast
   review explicitly open until the manual matrix is filled.
4. Preserve the existing implementation, test commands, and manual-gate completion
   rule; this change only reconciles tracking evidence.

## Behavior / Flow

1. Map each Spec 031 criterion to its narrowest current evidence.
2. Update the checklist with test/preflight references for proven criteria.
3. Keep criteria requiring human visual judgment unchecked and point to the matrix.
4. Verify that Specs 031 and 032 remain the only active feature specs.

## Constraints

- Automated browser output is evidence for implementation invariants, not a human
  substitute for visual, screen-reader, or full contrast acceptance.
- Do not mark the manual matrix complete from preflight output.
- Do not add a new runtime dependency or alter dashboard behavior.

## Edge Cases

| Scenario | Handling |
|---|---|
| A criterion has partial automated coverage | Keep it open or describe the exact remaining manual portion. |
| Browser preflight passes but visual hierarchy is uncertain | Retain the manual criterion as pending. |
| A test name changes later | The checklist points to the behavior and command, not a fabricated result. |
| No active technical spec remains after reconciliation | Keep Specs 031/032 active while their manual matrix has unchecked cells. |

## Acceptance Criteria

- AC-01: Given Spec 031's checklist, when each criterion is mapped to current tests or
  preflight output, then automated coverage is marked complete only for directly
  proven behavior.
- AC-02: Given visual hierarchy and full contrast judgment, when the checklist is
  reconciled, then the corresponding manual criteria remain explicitly pending.
- AC-03: Given the active-spec audit, when feature metadata is inspected, then Specs
  031 and 032 remain the only active specs and no manual result is fabricated.
- AC-04: Given the documentation-only diff, when scope and consistency checks run,
  then no dashboard runtime or test implementation changes are introduced.

## Done When

- [x] AC-01 — proven by the reconciled Spec 031 checklist and evidence references.
- [x] AC-02 — proven by the remaining unchecked manual criteria and matrix link.
- [x] AC-03 — proven by the active-spec audit and matrix completion rule.
- [x] AC-04 — proven by diff review, status, and whitespace checks; no dashboard
  runtime or test implementation files changed.
