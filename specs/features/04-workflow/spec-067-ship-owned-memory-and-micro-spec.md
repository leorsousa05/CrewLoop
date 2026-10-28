# spec-067-ship-owned-memory-and-micro-spec

---
name: spec-067-ship-owned-memory-and-micro-spec
domain: 04-workflow
status: completed
created: 2026-10-27
completed: 2026-10-27
supersedes: []
---

# Ship-Owned Memory and Official Micro-Spec

## Objective

Remove the duplicated memory bookkeeping (Plan and Ship both write a chat-log and update `project-state.md` for the same task) by making `crewloop:ship` the single owner of task-closing memory, and make the existing "lightweight spec" an official, templated micro-spec so the rule "every task gets a spec, even 1-line fixes" no longer contradicts Plan's anti-pattern and full edge-case matrix.

## Context

- Memory and spec rules: [conventions.md](../../../references/conventions.md) §Spec Folder Structure (rules at lines 108-116), [workflow.md](../../../references/workflow.md) rules 11 and 13.
- Current duplication: [crewloop-plan/SKILL.md](../../../skills/crewloop-plan/SKILL.md) step 9 and [crewloop-ship/SKILL.md](../../../skills/crewloop-ship/SKILL.md) step 5 both write chat-log + project-state; [crewloop-docs/SKILL.md](../../../skills/crewloop-docs/SKILL.md) step 5 writes a third chat-log for docs-only sessions.
- Current contradiction: conventions.md:108 and AGENTS.md:201 require a spec for every task; crewloop-plan anti-pattern says "for non-trivial tasks"; Plan step 7 demands a full edge-case matrix that the lightweight spec (conventions.md:116) does not have.
- The `crewloop validate-specs` validator ([spec-064](../01-cli/spec-064-cli-validate-specs.md)) requires only Objective, Acceptance Criteria (AC-NN), Done When, and an Edge Cases heading for active specs, so a micro-spec already validates; no CLI change is needed. It does not scan `specs/templates/`.
- Phase 1 of the "lanes" proposal discussed on 2026-10-27. Later phases (conditional reads, quick lane, lean reviewer, benchmark gate, spec approval) are explicitly out of scope.

## Requirements

1. **Ship owns memory.** `crewloop:plan` no longer writes chat-logs or updates `project-state.md` (its step 9 is removed); `crewloop:docs` no longer writes a chat-log. `crewloop:ship` step 5 remains the only place that marks the spec completed, appends the chat-log, updates `project-state.md` (including the 10-entry Recent decisions rotation), and runs `validate-specs`.
2. **Stopped-task exception.** When `crewloop:plan` receives control for a task marked `[STOPPED]` that will not reach Ship in the current session, Plan records exactly one line under `## Blockers` in `project-state.md` (date, spec ID, reason). It writes no chat-log and no Recent decisions entry.
3. **Micro-spec is official.** `conventions.md` replaces the "Lightweight specs" rule with a Micro-spec rule defining: when it applies (low-risk bug fixes and small tweaks; anything else uses the full spec), its sections (frontmatter + Objective, Edge Cases, Acceptance Criteria, Done When), and its minimums (Objective states the scope limit / what must not be touched; Edge Cases has at least one failure scenario in 1-2 lines; every AC is Given/When/Then and mapped in Done When).
4. **Micro-spec template.** Add `specs/templates/micro-spec.md` with the frontmatter and the four sections.
5. **Contradiction resolved.** Plan's anti-pattern reads that routing to `crewloop:code` without a feature spec is forbidden for every task (a micro-spec suffices for low-risk fixes). Plan step 7 picks full spec or micro-spec; the full edge-case matrix applies to full specs only. Plan step 8's "failure scenario per public entry point" and "non-goals/constraints" checks apply to full specs; micro-specs are checked against Requirement 3's minimums.
6. **Consistent references.** Every repository document that states Plan writes memory, or that the full section list is required for 1-line fixes, is updated to match: `AGENTS.md`, `references/workflow.md`, `specs/memory/project-state.md` header line, and docs site pages `docs/public/docs/core/crewloop-plan.md`, `docs/public/docs/concepts/specs.md`, `docs/public/docs/tools/workflow-test.md`.
7. **Contract test follows the new ownership.** The spec-063 contract test in `scripts/tests/test_automated_workflow.py` asserts the 10-entry rotation in Ship only, and asserts that Plan has no rotation instruction, forbids chat-log/Recent decisions writes, and keeps the single Blockers-line exception.

## Behavior / Flow

1. Plan reads memory, classifies risk, writes a full spec or a micro-spec, validates it, and hands off — without touching `project-state.md` or chat-logs.
2. Code → Review proceed unchanged.
3. Ship commits, then closes memory once (spec completed + chat-log + project-state + validate-specs).
4. If the task stops before Ship and control returns to Plan, Plan adds one Blockers line instead.

## Constraints

- Text-only change: SKILL.md files, references, templates, AGENTS.md, project memory header, docs-site markdown, plus the Python contract test that encodes the memory rules. No TypeScript, CLI, or validator behavior changes.
- Do not touch: context-selection, execution profiles, model routing, execution budgets/stop conditions, continuous-optimization, the Review dispatch, or skill read lists. These belong to later phases and to the continuous-optimization gate.
- Do not edit installed skill copies outside the repository (e.g. `~/.claude/skills/`); they refresh via `crewloop install`.
- Do not rewrite unrelated stale content in the touched docs pages (e.g. `crewloop:hub` references); change only the memory/spec statements.
- Preserve each SKILL.md's YAML frontmatter, transition contract, and role prefix.
- Gate classification: chose to treat this change as outside the continuous-optimization gate because it changes memory ownership and spec format, not context selection, budgets, stop conditions, routing, or profiles. Revisit if Review finds a touched rule in that list.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Task stops at Code (`[STOPPED]`) and user re-analyzes via Plan | Plan writes one Blockers line; no chat-log, no decision entry |
| Task stops and the user abandons it without returning to Plan | No memory written; the active spec in `features/` remains the trace (accepted gap) |
| Docs-only task (`crewloop:docs`) | Docs writes no chat-log; Ship closes memory when it commits the docs |
| Micro-spec chosen for a medium/high-risk task | Invalid: Plan step 8 rejects it and writes a full spec |
| Micro-spec with an empty Edge Cases section or no failure scenario | Invalid: Plan step 8 rejects it; `validate-specs` also flags a missing Edge Cases heading |
| Micro-spec AC not referenced in Done When | `validate-specs` reports `unmapped-ac`; Plan fixes before handoff |
| Template file in `specs/templates/` | Not scanned by `validate-specs`; placeholders do not produce errors |

## Acceptance Criteria

- AC-01: Given `skills/crewloop-plan/SKILL.md`, when searched for instructions to append chat-logs or update `project-state.md`, then the only memory write left is the single Blockers line for stopped tasks.
- AC-02: Given `skills/crewloop-docs/SKILL.md`, when read, then it contains no instruction to write a chat-log.
- AC-03: Given `skills/crewloop-ship/SKILL.md` step 5, when read, then it states Ship is the single owner of task-closing memory and still includes spec completion, chat-log, project-state with the 10-entry rotation, and `validate-specs`.
- AC-04: Given `references/conventions.md`, when read, then it defines the micro-spec (applicability, four sections, minimums) and links `specs/templates/micro-spec.md`, and no longer contains the "Lightweight specs" rule.
- AC-05: Given `skills/crewloop-plan/SKILL.md`, when read, then the anti-pattern no longer contains "non-trivial", step 7 offers full spec or micro-spec, and step 8 applies the matrix/constraints checks to full specs only.
- AC-06: Given the repository docs listed in Requirement 6, when searched, then none states that Plan updates `project-state.md`/chat-logs at session end, and `specs.md` mentions the micro-spec.
- AC-07: Given all SKILL.md files and the specs tree, when validated, then both validators and the Python workflow contract tests pass, and the contract test asserts Ship-only rotation (Requirement 7).

## Done When

- [x] AC-01 — proven by `grep -n -i "chat-log\|project-state" skills/crewloop-plan/SKILL.md` showing only read instructions and the Blockers-line rule
- [x] AC-02 — proven by `grep -n -i "chat-log" skills/crewloop-docs/SKILL.md` returning no write instruction
- [x] AC-03 — proven by reading `skills/crewloop-ship/SKILL.md` step 5
- [x] AC-04 — proven by `grep -n -i "micro-spec\|Lightweight specs" references/conventions.md`
- [x] AC-05 — proven by `grep -n -i "non-trivial\|micro-spec" skills/crewloop-plan/SKILL.md`
- [x] AC-06 — proven by `grep -rn -i "chat-log at session end\|crewloop:plan during discovery\|crewloop:plan. updates" AGENTS.md references docs/public/docs specs/README.md specs/memory specs/shared` (excluding `chat-logs/`) returning nothing, and `grep -n -i "micro-spec" docs/public/docs/concepts/specs.md`
- [x] AC-07 — proven by `python scripts/validate-skills.py` and `node packages/cli/bin/crewloop.js validate-specs --changed specs/features/04-workflow/spec-067-ship-owned-memory-and-micro-spec.md --changed specs/memory/project-state.md` and `python -m unittest scripts.tests.test_validate_skills scripts.tests.test_automated_workflow` all exiting 0
