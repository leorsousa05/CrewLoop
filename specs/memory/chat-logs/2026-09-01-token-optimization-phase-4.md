---
date: 2026-09-01
topic: token-optimization-phase-4
---

# Phase 4 Automatic Verification

- Continued the native CrewLoop token-optimization roadmap after Phase 3 execution control.
- Created `spec-017-token-optimization-phase-4-automatic-verification.md`.
- Scoped the gate to `crewloop:review`, reusing existing package scripts, the skill validator, and the Review checklist.
- Defined required evidence statuses, changed-file/scope checks, secret and AI-artifact scans, basic security checks, and read-only destructive-command detection.
- Required fail-closed behavior for unavailable mandatory checks and at most one bounded correction round.
- Preserved Review role boundaries, direct routing, and Shipper-only Git operations.
- Implemented the portable automatic-verification reference and updated the Review skill.
- Validation and review passed; required evidence is fail-closed and correction is limited to one round.
- Next roadmap phase: risk-aware model routing in Plan and Code.
