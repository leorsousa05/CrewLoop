---
name: spec-058-acceptance-matrix-completeness-check
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Acceptance Matrix Completeness Check

## Objective

Add a local, read-only checker that proves whether the dashboard manual acceptance
matrix is fully recorded, reporting missing environment fields, view cells, and
interaction results without claiming that automation is human approval.

## Context

- Manual gate: [`dashboard-acceptance-matrix.md`](../../../tests/dashboard-acceptance-matrix.md).
- Active dashboard specs: [`spec-031-dashboard-responsive-ui-refinement.md`](spec-031-dashboard-responsive-ui-refinement.md) and [`spec-032-dashboard-quality-documentation.md`](spec-032-dashboard-quality-documentation.md).
- Existing browser preflight is complementary and must not close this manual gate.
- The checker is a repository helper, not a dashboard runtime feature.

## Requirements

1. Parse the matrix without changing it and validate the required run-record fields.
2. Count all seven views across the 16 desktop/mobile theme-density columns (112
   cells) and identify unchecked or malformed cells.
3. Count all 12 interaction rows and identify `[record]`, empty, or pending results.
4. Return a deterministic human-readable summary and an optional JSON summary that
   contains only bounded labels, counts, and statuses.
5. Exit `0` only when the environment record, every view cell, and every interaction
   result are recorded; exit `1` for an incomplete matrix and `2` for invalid CLI or
   unreadable input.
6. Do not mark results, infer visual outcomes, inspect browser state, add
   dependencies, or make the checker a required CI gate while the matrix is pending.

## Behavior / Flow

1. Read the default matrix or an explicit `--file` path.
2. Validate the run-record table and manual matrix shape.
3. Report total/recorded/pending/invalid counts for views and interactions.
4. Emit text by default or bounded JSON with `--format json`.
5. Use the exit code to make the current manual blocker machine-detectable.

## Constraints

- Read-only; never rewrite the matrix or convert placeholders to passes.
- No browser, network, assistive-technology, or external service dependency.
- No raw file contents, prompts, responses, paths, credentials, or provider payloads
  in reports or errors.

## Edge Cases

| Scenario | Handling |
|---|---|
| Current matrix contains `[ ]` or `[record]` | Return incomplete with exact bounded counts and exit `1`. |
| A view row has the wrong number of columns | Report the row as invalid and exit `2`. |
| A run-record value is blank or explicitly pending | Report the field as pending and exit `1`. |
| A manually completed row contains prose | Count it as recorded without interpreting its truth. |
| Unknown CLI option or unreadable input | Return a bounded error and exit `2`. |

## Acceptance Criteria

- AC-01: Given the checked-in matrix, when the checker runs, then it reports 112 view
  cells and 12 interaction rows as incomplete without modifying the file.
- AC-02: Given a fully recorded matrix fixture, when the checker runs, then it exits
  `0` and reports complete counts for the environment, views, and interactions.
- AC-03: Given malformed shape or invalid CLI input, when the checker runs, then it
  exits `2` with a bounded error and no raw file content.
- AC-04: Given `--format json`, when the checker runs, then its output is parseable,
  deterministic, and contains no prompts, responses, credentials, or provider data.
- AC-05: Given the repository test suite, when this helper is added, then it remains
  opt-in and does not change dashboard runtime behavior or the existing CI gate.

## Done When

- [x] AC-01 — proven by the current matrix command and unchanged-file check.
- [x] AC-02 — proven by a temporary in-memory fully recorded fixture test.
- [x] AC-03 — proven by malformed-shape and CLI contract tests.
- [x] AC-04 — proven by JSON output and privacy assertions.
- [x] AC-05 — proven by package/test scope review and diff inspection; the helper is
  opt-in and no existing dashboard CI gate changed.
