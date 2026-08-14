# spec-NNN-name

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

- [what must NOT be done / not touched — prevents regressions outside scope]
- [every ambiguity resolved with a default MUST be recorded: `- [Topic]: chose [X] because [reason]. Revisit if [condition].`]

## Edge Cases

Mandatory matrix — happy-path-only specs are invalid. Cover at minimum:

| Scenario | Handling |
|----------|----------|
| [empty/null/invalid input] | [expected behavior] |
| [error path (sad path)] | [expected behavior] |
| [boundary value] | [expected behavior] |
| [concurrency/permission concern, when relevant] | [expected behavior] |

## Acceptance Criteria

- AC-01: Given [state], when [action], then [observable result]
- AC-02: …

> Every criterion MUST be observable/testable (Given/When/Then style), never aspirational ("works well" is forbidden).

## Done When

- [ ] AC-01 — proven by [test command / manual step]
- [ ] AC-02 — proven by [test command / manual step]

> "Code compiles" is never sufficient — each item must reference its AC ID and the test/observable behavior that proves it.
