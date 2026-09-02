# spec-013-automated-architect-and-designer

---
name: spec-013-automated-architect-and-designer
domain: 04-workflow
status: in-progress
created: 2026-06-27
completed: null
supersedes: []
---

# Automated Non-Blocking Architect and Designer Workflow

## Objective

Make `crewloop:plan` and `crewloop:design` run automatically to completion — writing spec and design files directly without interactive questions — with all stack and visual decisions resolved during discovery.

## Context

- Transition contract: see `shared/architecture-overview.md` §Workflow and `references/skill-contracts.yaml`.
- Historical note: this spec predates the direct-routing architecture (ADR 002) and the 6-skill reduction (ADR 007); the `crewloop:hub`/orchestrator references are legacy and were superseded by automatic routing.

## Requirements

1. Discovery (currently `crewloop:plan`) must resolve all tech-stack, package, framework, and visual design parameters before routing.
2. `crewloop:plan` must not ask clarification questions; it writes the spec/tasks and returns control per the transition contract.
3. `crewloop:design` must not have an interactive "Discovery (2-3 questions)" phase; it commits to a visual direction from the spec and writes the design spec directly.
4. The workflow handoff sequence must still be respected (plan → design if UI → code).

## Behavior / Flow

1. User requests task → `crewloop:plan` gathers context via read-only exploration → resolves stack/visual preferences → writes feature spec → routes to design (UI) or code.
2. `crewloop:design` reads the feature spec, commits to a visual direction, writes design detail into the feature spec, routes to code.
3. No manual confirmation stages between plan/design/code.

## Constraints

- Do not reintroduce Hub/orchestrator mediation — direct routing (ADR 002) is canonical.
- Skills must still produce their standard deliverables (specs, tasks, design specs).

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User wants to interrupt the automated flow | Explicit interrupts `stop`/`pause`/`volta`/`voltar`/`re-analyze` return to `crewloop:plan` |
| Discovery cannot resolve a preference | Plan picks a sensible default and records it in the spec (no blocking question) |
| AFK mode active | Every skill returns to `crewloop:plan`; Plan loads the next phase per contract |

## Acceptance Criteria

- AC-01: Given a task request, `crewloop:plan` completes discovery and writes a feature spec without asking the user a question.
- AC-02: Given a feature spec with UI, `crewloop:design` produces design output and routes to code without a discovery questionnaire.
- AC-03: Given any skill response, it routes per the transition contract with no navigation menu presented (outside AFK).

## Done When

- [x] AC-01 — proven by the Plan skill contract and `scripts.tests.test_automated_workflow`, which enforce non-blocking default resolution.
- [x] AC-02 — proven by the Design skill contract and `scripts.tests.test_automated_workflow`, which enforce default surface/register resolution without a questionnaire.
- [x] AC-03 — proven by `python scripts/validate-skills.py`, the workflow contract test, and the direct-routing rules in `references/workflow.md`.
