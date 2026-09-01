---
date: 2026-09-01
topic: cross-platform-test-runner
---

# Cross-Platform Test Runner

- Continued the roadmap work for CrewLoop after the native token optimization phases.
- Created `spec-022-cross-platform-test-runner.md` to remove Windows shell-glob dependence from workspace test scripts.
- Changed the CLI and dashboard server scripts from the quoted `dist/**/*.test.js` glob to Node's native recursive `node --test dist` discovery.
- Preserved the dashboard UI test command and the existing CI ordering and gates.
- Validation passed: workspace build, 322 dashboard server tests, 65 UI tests, fixed token benchmark with `adopt_candidate`, YAML parsing, seven-skill validation, and diff check.
- The CLI runner discovered all 97 compiled tests and returned the existing one environment-sensitive assertion failure; this is unrelated to the package-script change and remains a separate follow-up.
- Review result: PASS for the scoped change. The work remains unshipped until an explicit CrewLoop Ship step.
- Next: ship spec 022, then evaluate the pre-existing CLI doctor-test environment sensitivity separately.
