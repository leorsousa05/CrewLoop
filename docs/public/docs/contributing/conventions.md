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
- The `crewloop:ship` skill generates these automatically

See [Conventional Commits](../concepts/conventional-commits) for the type table and branch naming rules.

## Spec format

Every task requires a single-file feature spec in `specs/features/<domain>/spec-NN-name.md`.

| Change size | Required spec |
|------------|----------------|
| Bug fix / tweak | Minimal feature spec (Objective, Edge Cases, Acceptance Criteria, Done When) |
| Feature / component | Full feature spec (all sections) |
| Architectural change | RFC in `specs/changes/` → approved RFC becomes an ADR in `specs/shared/adrs/` |

Completed feature specs stay in `features/` as the source of truth — `crewloop:ship` marks them completed, appends a chat-log to `specs/memory/chat-logs/`, and updates `specs/memory/project-state.md`.

## SKILL.md conventions

- Preserve YAML frontmatter (`name`, `description`) — agents use these for detection.
- Run `python scripts/validate-skills.py` after any SKILL.md change.
- Shared conventions belong in `references/` and `specs/shared/`.

## When to create an ADR

Create an Architectural Decision Record in `specs/shared/adrs/` when:
- The decision is irreversible or costly to reverse.
- It affects multiple components or subsystems.
- Future contributors need to understand *why* the choice was made.

ADRs are born as RFCs in `specs/changes/` and move to `specs/shared/adrs/` when approved.

ADR format:

```markdown
---
adr: NNN
title: Decision Title
status: accepted
date: YYYY-MM-DD
---

# ADR-NNN: Decision Title

## Context
[What problem prompted this decision]

## Decision
[What was decided and why]

## Consequences
[What becomes easier or harder as a result]
```
