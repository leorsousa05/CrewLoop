---
name: spec-056-spec-retention-contract
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Feature-Spec Retention Contract

## Objective

Reconcile remaining dashboard tracking artifacts with CrewLoop's current specs
contract: completed feature specs remain in `specs/features/`, while only dead or
rejected proposals use `specs/archive/`.

## Context

- Repository authority: [`AGENTS.md`](../../../AGENTS.md).
- Canonical conventions: [`references/conventions.md`](../../../references/conventions.md).
- Current active tracking artifact: [`spec-032-dashboard-quality-documentation.md`](../02-dashboard/spec-032-dashboard-quality-documentation.md).
- Public workflow description: [`README.md`](../../../README.md).
- Manual evidence map: [`dashboard-acceptance-matrix.md`](../../../tests/dashboard-acceptance-matrix.md).

## Requirements

1. Keep completed Specs 021 and 022 in `specs/features/04-workflow/` with their
   completed metadata and preserve their history.
2. Update Spec 032 so its completion criteria reflect the current retention contract
   and leave only the genuinely manual dashboard matrix criterion open.
3. Remove stale README and published-doc wording that says normal completed feature
   specs are archived.
4. Update the dashboard acceptance evidence map to record the retention and diff
   review evidence without marking the manual visual/keyboard/screen-reader gate as
   complete.
5. Do not move or delete specs, rewrite historical ADRs, change runtime code, or
   weaken any acceptance criterion.

## Behavior / Flow

1. Read the authoritative repository and conventions rules.
2. Verify Specs 021 and 022 are present with completed frontmatter.
3. Replace the stale archive expectation in Spec 032 with a retention verification.
4. Record the result in README, the acceptance matrix, and project memory.
5. Confirm the two dashboard specs remain the only active specs because their manual
   matrix is not yet recorded.

## Constraints

- Completed feature specs stay in `specs/features/`; only dead or rejected proposals
  go to `specs/archive/`.
- This is a documentation and tracking reconciliation; no application behavior is
  changed.
- Preserve links and historical content unless a link directly asserts the obsolete
  retention behavior.

## Edge Cases

| Scenario | Handling |
|---|---|
| A completed feature spec is found in `specs/features/` | Keep it there and verify its completed metadata. |
| An old document says Ship archives every spec | Update that claim to the current feature/RFC lifecycle. |
| A manual dashboard criterion is still open | Keep the active spec open and do not mark the matrix complete. |
| An archived legacy proposal is referenced by an ADR | Preserve the historical archive link unchanged. |

## Acceptance Criteria

- AC-01: Given Specs 021 and 022, when their paths and frontmatter are inspected,
  then both remain completed feature specs under `specs/features/04-workflow/`.
- AC-02: Given Spec 032, when its tracking criteria are read, then retention is
  verified and only the manual dashboard matrix remains open.
- AC-03: Given the root README, published docs, and dashboard acceptance matrix, when
  stale lifecycle claims are searched, then normal completed feature specs are not
  described as archive candidates and the manual gate remains explicitly pending.
- AC-04: Given the reconciled documentation diff, when link, metadata, and scope
  checks run, then historical archives remain untouched and no runtime file changes.

## Done When

- [x] AC-01 — proven by path/frontmatter inspection for Specs 021 and 022.
- [x] AC-02 — proven by Spec 032 checklist and active-spec audit.
- [x] AC-03 — proven by README, published-doc, and matrix scans for lifecycle and
  manual-gate wording.
- [x] AC-04 — proven by diff review and repository status checks; only documentation,
  tracking, and spec files changed.
