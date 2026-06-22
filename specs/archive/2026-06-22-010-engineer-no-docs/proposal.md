# Proposal: Reinforce that engineer skill does not write documentation

## Problem Statement

The `engineer` skill currently lists several things it must never do (redesign architecture, skip specs, run git operations, do code review), but it does not explicitly state that documentation is also out of scope. This can lead to confusion when an engineer is tempted to update a README, write module docs, or create feature documentation during implementation.

## Goals

1. Explicitly state in `skills/engineer/SKILL.md` that the engineer skill never writes documentation.
2. Add an anti-pattern entry reinforcing this rule.
3. Ensure consistency with `AGENTS.md` and the `docs-writer` skill responsibilities.

## Non-Goals

- Changing the `docs-writer` skill.
- Modifying `AGENTS.md`.
- Adding new workflow rules.

## Constraints

- Keep the skill concise.
- Use the same tone and style as existing critical rules.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Overlap with existing rules | Low | Place the new rule near other "NEVER" statements |

## Success Criteria

- [ ] `skills/engineer/SKILL.md` contains a rule about not writing docs.
- [ ] ANTI-PATTERNS section mentions documentation.
- [ ] `scripts/validate-skills.py` still passes.
