# spec-061-isolated-review-context

---
name: spec-061-isolated-review-context
domain: 04-workflow
status: completed
created: 2026-10-23
completed: 2026-10-23
supersedes: []
---

# Isolated Review Context

## Objective

Make `crewloop:review` run in a fresh subagent context that did not produce the diff whenever the host supports subagents, and make every Review Report declare whether the review was isolated, so self-approval bias is removed structurally instead of only by instruction.

## Context

- Mandatory flow and Review responsibilities: [workflow.md](../../../references/workflow.md), [AGENTS.md](../../../AGENTS.md) rules 4–5.
- Review gate contract: [automatic-verification.md](../../../skills/crewloop-review/references/automatic-verification.md).
- Prior art: the Guarana skill suite separates implementer and verifier into distinct subagent contexts (its ADR-003/ADR-020). CrewLoop must stay portable across Kimi Code, Claude, Codex, AGY, and OpenCode, so isolation is host-dependent with an explicit fallback.
- Related: [spec-017](spec-017-token-optimization-phase-4-automatic-verification.md) (automatic verification gate).

## Requirements

1. `crewloop:code`, at BUILD completion, dispatches `crewloop:review` into a fresh subagent context when the host exposes a subagent/task capability, instead of loading Review in its own context.
2. The dispatch handoff is factual and compact: active spec path, changed-file list, Plan risk/profile, and the verification commands Code ran with their pass/fail outcome. It excludes Code's reasoning, self-assessment, and conversation history. Review treats Code's reported results as leads to re-verify, never as evidence.
3. When subagents are unavailable or denied, Review runs in the same context and the report records `same-context (not isolated)` with a bounded reason: `no_subagent_capability` or `subagent_denied`.
4. The Review Report header gains a required `Review Context` row: `isolated` or `same-context (not isolated)`.
5. A same-context review of a `high`-risk change adds a non-blocking finding `independent_review_unavailable` so the gap is visible to the user and to Ship.
6. After a FAIL and one correction round, the re-review is dispatched to a fresh subagent again (never the subagent that issued the FAIL reused with Code's edits mixed in, and never Code's own context while subagents are available).
7. The sanitized `VerificationReport` contract records `reviewContext` and `isolationFallbackReason`.
8. Shared workflow docs (`references/workflow.md`, `AGENTS.md`) state the isolation rule; transitions in `references/skill-contracts.yaml` stay unchanged (Code → Review → Ship/Code).

## Behavior / Flow

1. Code finishes BUILD and runs the final verification suite.
2. Code checks for a host subagent capability (e.g., a Task/subagent tool).
3. Available → Code dispatches a subagent with the compact handoff and the instruction to load `crewloop:review`; the subagent returns the Review Report; the parent routes PASS → `crewloop:ship`, FAIL → `crewloop:code`.
4. Unavailable/denied → Code loads `crewloop:review` in place; the report declares the fallback and reason.

## Constraints

- Do not change `references/skill-contracts.yaml` transitions, role prefixes, or AFK routing.
- Do not change Review's read-only rules (no writes, no git) or the one-bounded-correction-round rule.
- Do not add runtime code, CLI flags, or agent profile files; this spec is Markdown contracts plus contract tests only.
- The existing `subagents.approved` rule for parallel implementation stays as is; review dispatch is a separate, always-allowed exception.
- [RFC vs feature spec]: chose a feature spec because the Code → Review transition and roles are unchanged; only the execution context of an existing step changes. Revisit if isolation later requires installed agent profiles or new transitions.
- [Fallback policy]: chose "marked fallback" over "block when no subagent" because several supported hosts lack subagents and blocking would make CrewLoop unusable there. Revisit if all supported hosts gain subagents.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Host has no subagent capability | Same-context review; report `same-context (not isolated)`, reason `no_subagent_capability` |
| Subagent dispatch denied by user/permissions | Same-context review; reason `subagent_denied`; do not retry the denied dispatch |
| Subagent returns no report or a malformed report | Re-dispatch once to a fresh subagent; if it fails again, stop and route to `crewloop:plan` without issuing a PASS (missing review evidence fails closed) |
| High-risk change reviewed same-context | Add non-blocking finding `independent_review_unavailable` |
| Re-review after correction round 1 | Fresh subagent dispatch; same-finding repeat routes to Plan as today |
| Handoff would include secrets or raw logs | Forbidden; handoff carries only paths, risk/profile, and command names with pass/fail |
| AFK mode active | Same isolation rule; parent returns to `crewloop:plan` after the subagent's verdict |

## Acceptance Criteria

- AC-01: Given `skills/crewloop-code/SKILL.md`, when BUILD completion is read, then it instructs dispatching `crewloop:review` to a fresh subagent context when available and lists the compact handoff fields and the exclusion of Code's reasoning.
- AC-02: Given `skills/crewloop-review/SKILL.md`, when the report template is read, then it contains a required `Review Context` row with `isolated` / `same-context (not isolated)` and the fallback reasons `no_subagent_capability` and `subagent_denied`.
- AC-03: Given `skills/crewloop-review/SKILL.md`, when the isolation rules are read, then a high-risk same-context review requires the `independent_review_unavailable` finding and Code's reported results are treated as leads, not evidence.
- AC-04: Given `automatic-verification.md`, when the report contract is read, then `VerificationReport` includes `reviewContext` and `isolationFallbackReason`.
- AC-05: Given `references/workflow.md` and `AGENTS.md`, when the Review rules are read, then both state that Review runs in an isolated context when the host supports subagents.
- AC-06: Given the repository, when `python -m unittest scripts.tests.test_automated_workflow` runs, then a contract test asserting AC-01..AC-05 passes, and `python scripts/validate-skills.py` passes for all 7 skills with unchanged transitions.

## Done When

- [x] AC-01 — proven by `python -m unittest scripts.tests.test_automated_workflow` (isolation contract test)
- [x] AC-02 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-03 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-04 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-05 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-06 — proven by `python -m unittest scripts.tests.test_validate_skills scripts.tests.test_automated_workflow` and `python scripts/validate-skills.py`
