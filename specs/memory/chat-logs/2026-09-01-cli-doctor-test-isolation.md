---
date: 2026-09-01
topic: cli-doctor-test-isolation
---

# CLI Doctor Test Isolation

- Continued the CrewLoop roadmap follow-up after the cross-platform test runner change.
- Created `spec-023-cli-doctor-test-isolation.md` for the pre-existing environment-sensitive CLI assertion.
- Added an optional home-directory override to `runDoctorCommand`; production calls omit it and retain the existing behavior.
- Updated the affected test to use its temporary home directory, preventing host hook configuration from changing the expected warning output.
- Validation passed: CLI build, 97 CLI tests, 322 dashboard server tests, 65 UI tests, workspace build, token benchmark with `adopt_candidate`, seven-skill validation, and security/scope scans.
- Review result: PASS for the scoped change. The work remains unshipped until an explicit CrewLoop Ship step.
- Next: ship spec 023.
