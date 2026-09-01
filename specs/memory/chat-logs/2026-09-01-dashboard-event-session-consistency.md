# Dashboard event and session consistency

- Implemented Spec 029 for the CrewLoop dashboard event boundary and session lifecycle.
- Added canonical event validation for identity, source, event type, numerics, bounded strings, payload structure, and absolute workspace roots. Invalid events are rejected before state mutation or broadcast.
- Restricted path normalization to input, output, and display detail while preserving `workspacePath` and other identity fields.
- Added stable `invocation_id` propagation across Kimi, Claude, Codex, AGY, OpenCode, the CLI OpenCode plugin, and the client invocation projector.
- Made session timestamps monotonic, explicit `session_start` a resume signal, idle/prune behavior deterministic, and prune messages typed with runtime root cleanup.
- Added five adapter contract fixtures and regression coverage for malformed events, workspace roots, lifecycle transitions, invocation pairing, prune removal, and paused-message ordering.
- Validation passed: dashboard build, 337 server tests, 65 UI tests, CLI build, 97 CLI tests, fixed token benchmark (`adopt_candidate`), seven-skill validation, and diff/security scans.
- Review result: PASS for the scoped change. The implementation remains unshipped until the CrewLoop Ship step.
- Next: ship Spec 029, then proceed to Spec 030 client correctness.
