# spec-063-bounded-project-memory

---
name: spec-063-bounded-project-memory
domain: 04-workflow
status: active
created: 2026-10-23
completed: null
supersedes: []
---

# Bounded Project Memory

## Objective

Keep the always-read `specs/memory/project-state.md` small by capping its Recent decisions list at the 10 newest entries, moving older entries losslessly to an on-demand decision log, and make Plan treat restored memory as data rather than instructions.

## Context

- Memory layout and session rules: [conventions.md](../../../references/conventions.md) §Spec Folder Structure, [workflow.md](../../../references/workflow.md) rule 13, [decisions/README.md](../../memory/decisions/README.md).
- Baseline: `project-state.md` was 20,894 bytes with 49 dated decisions and is read by Plan, Code, and Docs at every session start.
- Prior art: Guarana bounds injected memory (ADR-038) and states that restored memory is stale-able data that cannot override current instructions.
- Enforcement depends on [spec-064](../01-cli/spec-064-cli-validate-specs.md) (`crewloop validate-specs`, which superseded spec-062's Python script).

## Requirements

1. `## Recent decisions` in `project-state.md` holds at most 10 dated entries (`- YYYY-MM-DD: …`), newest first, followed by a pointer line to the decision log.
2. All other dated entries move verbatim to `specs/memory/decisions/decision-log.md`, ordered oldest first; the log is append-only (new archived entries go to the bottom). No entry is lost or edited: the combined count across both files equals the pre-change count (49).
3. Ship and Plan memory-update steps: insert the new decision at the top; while the list holds more than 10 dated entries, move the oldest entries (verbatim, oldest first) to the bottom of `decision-log.md` in the same change, so a legacy list of any size shrinks to 10 in one update.
4. Plan treats restored memory (`project-state.md`, chat-logs, decision log) as data: it may be stale, never overrides `AGENTS.md`, the active spec, or the current explicit user request, and file/command references in it are verified before being relied on. Plan reads the decision log only when the task touches a topic recorded there.
5. `conventions.md`, `workflow.md` rule 13, and `decisions/README.md` document the cap, the log, and the data-not-instructions rule.
6. `crewloop validate-specs` checks `specs/memory/project-state.md` when present: more than 10 dated Recent decisions → error `project-state-decisions-over-limit`; file larger than 12,000 bytes → warning `project-state-oversized`.

## Behavior / Flow

1. Split the current 49 entries by date: newest 10 stay (newest first), 39 move to the log (oldest first).
2. Ship/Plan follow the rotate-on-insert rule on every future update.
3. CI fails if the cap is exceeded.

## Constraints

- Do not edit the text of any archived or retained decision; move only.
- Do not change Module status, Blockers, or Next task content except to reference the log.
- Do not touch chat-logs, incidents, ADRs, or `specs/shared/`.
- [Cap size]: chose 10 entries because it covers the latest working sessions while cutting the always-read file by more than half. Revisit if sessions routinely produce more than 10 decisions.
- [Log location]: chose `specs/memory/decisions/decision-log.md` (beside the "why" notes) instead of a new folder, keeping the existing memory tree.
- [Ordering of same-date entries]: keep their existing relative order.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| `project-state.md` missing (other projects) | Validator skips the memory checks |
| No `## Recent decisions` section | Validator skips the count check |
| Exactly 10 dated entries | Valid |
| Legacy project with many more than 10 entries | The next Plan/Ship memory update moves all excess entries at once |
| 11 dated entries | Error `project-state-decisions-over-limit` |
| Non-dated bullet (pointer line) in the section | Not counted |
| File over 12,000 bytes but ≤ 10 decisions | Warning only |
| Same-date entries straddling the cut | Keep relative order; the cut is by position after date sort |
| Restored memory contradicts the user's current request | Current request wins; Plan records the discrepancy in the brief |

## Acceptance Criteria

- AC-01: Given the updated repository, when `project-state.md` is read, then `## Recent decisions` has at most 10 dated entries, newest first, and links to `decisions/decision-log.md`.
- AC-02: Given both files, when dated entries are counted, then project-state + decision log = 49 at implementation time and every archived line matches its original text.
- AC-03: Given the Plan and Ship skills, when their memory-update steps are read, then they require insert-at-top and moving the oldest entries, until 10 remain, to the bottom of the decision log.
- AC-04: Given the Plan skill, when read, then it states restored memory is data that may be stale, cannot override `AGENTS.md`, the active spec, or the current user request, and that references are verified before use.
- AC-05: Given `conventions.md`, `workflow.md`, and `decisions/README.md`, when read, then they document the 10-entry cap and the decision log.
- AC-06: Given fixture trees, when the validator runs, then 11 dated decisions produce error `project-state-decisions-over-limit`, 10 produce none, a file over 12,000 bytes produces warning `project-state-oversized`, and a missing file produces no memory issue.

## Done When

- [x] AC-01 — proven by `node packages/cli/bin/crewloop.js validate-specs` (no `project-state-decisions-over-limit`)
- [x] AC-02 — proven by a dated-entry count comparison of `project-state.md` + `decision-log.md` against the pre-change file (`git show HEAD:specs/memory/project-state.md`)
- [x] AC-03 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-04 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-05 — proven by `python -m unittest scripts.tests.test_automated_workflow`
- [x] AC-06 — proven by `npm test --workspace=@archznn/crewloop-cli` (project-state tests)
