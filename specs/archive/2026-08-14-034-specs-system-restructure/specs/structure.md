# WHAT — Specs System Restructure

## Feature spec (single-file) template — reference implementation

The canonical template will live at `specs/templates/feature-spec.md`. Content contract:

```markdown
---
name: spec-NNN-name
domain: NN-domain
status: active
created: YYYY-MM-DD
completed: null
supersedes: []
---

# <Title>

## Objective
[What this task achieves — 1-3 sentences, falsifiable]

## Context
[Links to shared/glossary.md, shared/tech-stack.md, shared/architecture-overview.md, relevant ADRs, related feature specs. Never copies content.]

## Requirements
1. [testable requirement]
2. [testable requirement]

## Behavior / Flow
1. [happy-path step]
2. [happy-path step]

## Constraints
- [what must NOT be done / not touched]

## Edge Cases
| Scenario | Handling |
|----------|----------|
| [empty/null/invalid input] | [expected behavior] |
| [error path] | [expected behavior] |
| [boundary value] | [expected behavior] |

## Acceptance Criteria
- AC-01: Given [state], when [action], then [observable result]
- AC-02: …

## Done When
- [x] AC-01 — proven by [test command / manual step]
- [x] AC-02 — proven by [test command / manual step]
```

## RFC template (`specs/templates/rfc-template.md`)

```markdown
---
name: rfc-NNN-name
status: draft | approved | rejected
created: YYYY-MM-DD
resolved: null
---

# RFC-NNN: <Title>

## Problem
## Proposal
## Alternatives considered
## Impact (files, skills, docs)
## Open questions
## Decision (filled when resolved)
- Outcome: approved → shared/adrs/adr-NNN-name.md | rejected → archive/rfc-NNN-name.md
```

## ADR template (`specs/templates/adr-template.md`)

```markdown
---
adr: NNN
title: <Title>
status: accepted
date: YYYY-MM-DD
---

# ADR-NNN: <Title>

## Context
## Decision
## Consequences (positive / negative / trade-offs)
## Related (links to feature specs, other ADRs)
```

## Task prompt template (`specs/templates/task-prompt-template.md`)

```
1. Read memory/project-state.md — where we are
2. Read specs/features/<domain>/spec-NNN-name.md — what to do today
3. Read shared/ refs only if the spec links them

Before coding:
- Do not modify files outside this spec's scope
- Do not reimplement what exists (check memory/chat-logs/)
- Follow shared/conventions.md

Done = all Done When checkboxes ticked with the referenced test passing.
```
