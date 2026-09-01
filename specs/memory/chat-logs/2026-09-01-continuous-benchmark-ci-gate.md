---
date: 2026-09-01
topic: continuous-benchmark-ci-gate
---

# Continuous Benchmark CI Gate

- Continued the CrewLoop roadmap after the Phase 7 benchmark implementation.
- Created `spec-021-continuous-benchmark-ci-gate.md`.
- Added the fixed baseline/candidate token benchmark to `.github/workflows/validate.yml` after workspace tests, so existing checks remain active before the optimization gate.
- Corrected workspace-relative fixture paths after reproducing the npm workspace working-directory behavior.
- Documented local PASS and FAIL benchmark commands in `servers/dashboard/README.md`.
- Validation passed: workspace build, 322 dashboard server tests, 65 UI tests, fixed benchmark with `adopt_candidate`, YAML parsing, seven-skill validation, and diff check.
- The aggregate `npm test --workspaces` command remains incompatible with the current Windows glob handling and has one pre-existing environment-sensitive CLI assertion; explicit suites pass.
- Review result: PASS after moving the benchmark after the existing test gate. Changes remain unshipped on the current branch.
- Next: keep the CI benchmark fixtures synchronized with any future optimizer-policy change and require a reviewed `adopt_candidate` result before adoption.
