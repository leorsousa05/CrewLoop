---
sidebar_position: 3
---

# Conventions

## Commit format

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

- Imperative mood: "add" not "added"
- Max 72 characters in the description
- No trailing period
- The Shipper skill generates these automatically

See [Conventional Commits](../concepts/conventional-commits) for the type table and branch naming rules.

## Spec format

Every change requires a spec in `specs/changes/NNN-name/`.

| Change size | Required files |
|------------|----------------|
| Bug fix / tweak | `.spec.yaml` + `tasks.md` |
| Feature / component | Full spec (all five files) |
| Architectural change | Full spec + ADR in `decisions/` |

## SKILL.md conventions

- Preserve YAML frontmatter (`name`, `description`) — agents use these for detection.
- Every skill ends with a letter-based navigation menu.
- Run `python scripts/validate-skills.py` after any SKILL.md change.
- Shared conventions belong in `references/`.

## When to create an ADR

Create an Architectural Decision Record in `specs/decisions/` when:
- The decision is irreversible or costly to reverse.
- It affects multiple components or subsystems.
- Future contributors need to understand *why* the choice was made.

ADR format:

```markdown
# NNN — Decision Title

## Status
Accepted

## Context
[What problem prompted this decision]

## Decision
[What was decided and why]

## Consequences
[What becomes easier or harder as a result]
```
