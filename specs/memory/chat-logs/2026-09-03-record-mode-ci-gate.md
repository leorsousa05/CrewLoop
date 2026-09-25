# Record-Mode CI Gate — 2026-09-03

## Summary

- Created Spec 042 to make the checked-in execution-record benchmark a required CI gate.
- Added a validation workflow step after the existing dataset benchmark and before skill validation.
- Reused the existing CLI exit code and paired record-mode options; no metric parsing, duplicate thresholds, dependency, permission, telemetry, or policy activation was introduced.
- Added workflow contract assertions for benchmark ordering, both fixture paths, and Markdown output.

## Verification

- Workflow contract tests: 5 passed.
- Skill validator: all 7 skills passed.
- Workspace build passed.
- Workspace tests passed, including 351 dashboard server tests and 89 UI tests.
- Dataset-mode and record-mode CI-equivalent benchmarks both returned `adopt_candidate` with 100% coverage and 25% token reduction.
