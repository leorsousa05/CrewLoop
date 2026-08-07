# Proposal: Automatic Routing & Plan as Unified Discovery Entry

> Metadata (status, dates, author, affected files) lives in `.spec.yaml` — do not duplicate it here.

## Problem Statement

The current CrewLoop flow forces the user to act as a manual router:

1. The `crewloop:hub` asks a few discovery questions, then presents a menu to choose `crewloop:plan` or `crewloop:brainstorm`.
2. `crewloop:brainstorm` runs a separate discovery session, then presents another menu to go to `crewloop:plan`.
3. `crewloop:plan` is non-interactive and cannot ask follow-up questions, so vague requirements leak into specs.
4. Every interactive skill (`crewloop:code`, `crewloop:review`, `crewloop:ship`, `crewloop:docs`) ends with a letter-based menu, forcing the user to repeatedly confirm the obvious next step.

This is slow, breaks the conversation rhythm, and makes the user responsible for workflow state. The user wants a more automatic flow where the system decides the next step, asks deeper questions up-front, and only stops when the user explicitly asks for it.

## Goals

1. **Merge `crewloop:hub`, `crewloop:plan`, and `crewloop:brainstorm` into a single `crewloop:plan` skill.** This new skill becomes the entry point for every task: it explores the codebase via subagents, asks end-to-end discovery questions, synthesizes a structured brief, and writes the spec.
2. **Remove all end-of-skill navigation menus.** Each skill automatically loads the next skill in the chain. The user can interrupt with explicit commands (`stop`, `pause`, `volta`, `re-analyze`), but the default is continuous flow.
3. **Update the contract layer** (`references/skill-contracts.yaml`, `conventions.md`, `workflow.md`) to reflect the new 6-skill team and direct transitions.
4. **Update the supporting surfaces** (CLI, dashboard, validator, docs, templates) so the default skill, icons, root detection, and tests assume the new entry point.

## Non-Goals

- No new runtime executable or code is introduced beyond the existing Markdown skill instructions and small config updates.
- No change to the spec folder structure, Conventional Commits format, or branch naming conventions.
- No attempt to make the flow fully unattended end-to-end across multiple independent user requests; the change is scoped to one task at a time.
- The docs site visual style, color palette, and component architecture remain unchanged.

## Constraints

- The new `crewloop:plan` must still produce the same deliverables as before: a structured brief and a spec in `specs/changes/NNN-name/`.
- `crewloop:plan` must be the single source of truth for task entry; there must be no `crewloop:hub` or `crewloop:brainstorm` skills left in the bundle.
- The transition contract in `references/skill-contracts.yaml` must remain machine-readable and pass `validate-skills.py`.
- The CLI default hook skill must be changed to the directory name of `crewloop:plan` (`crewloop-plan`), which the dashboard maps to the canonical `crewloop:plan`.
- All existing tests must continue to pass after the changes.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing the Hub breaks the dashboard's default-skill assumption | Med | Update CLI hook templates and dashboard root detection to use `crewloop-plan` as the installed default |
| Users lose the ability to explicitly route between skills | Low | Reserve explicit interrupt commands (`stop`, `pause`, `volta`, `re-analyze`) and document them in each skill |
| Plan becomes too large and mixes two responsibilities | Med | Keep the two phases clearly separated inside the skill: **Discovery** (questions + brief) and **Architecture** (spec writing), and cap the skill at ~500 lines by using subagents and references |
| Validator canonical checks need new conditional strings | Low | Update `scripts/validate-skills.py` to accept the new set of conditional direct routes |

## Success Criteria

- [ ] Exactly 6 skill directories remain: `crewloop-plan`, `crewloop-design`, `crewloop-code`, `crewloop-review`, `crewloop-ship`, `crewloop-docs` → verified by T2
- [ ] `crewloop:plan` SKILL.md includes both discovery/brainstorm questions and spec-writing responsibilities → verified by T3
- [ ] No skill ends with a letter-based menu; each skill auto-loads the next → verified by T4
- [ ] `references/skill-contracts.yaml` reflects the 6-skill direct-routing contract → verified by T8
- [ ] `python scripts/validate-skills.py` passes → verified by T8
- [ ] `npm test` passes in `packages/cli` and `servers/dashboard` → verified by T8
