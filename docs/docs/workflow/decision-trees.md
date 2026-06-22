# Decision Trees

CrewLoop is full of explicit decision points. This page documents the most important ones so you always know what comes next.

## Orchestrator: where to route?

```mermaid
flowchart TD
    O[Orchestrator has a brief]
    O --> Q1{Need product framing?}
    Q1 -->|Yes| PM[Product Manager]
    Q1 -->|No| Q2{Need tech evaluation?}
    Q2 -->|Yes| RS[Researcher]
    Q2 -->|No| Q3{Need QA strategy?}
    Q3 -->|Yes| T[Tester]
    Q3 -->|No| Q4{Need upkeep triage?}
    Q4 -->|Yes| MN[Maintainer]
    Q4 -->|No| A[Architect]
    PM --> A
    RS --> A
    T --> A
    MN --> A
```

## Architect: Designer, Engineer, or Docs-Writer?

```mermaid
flowchart TD
    A[Architect has specs]
    A --> Q1{Task involves UI?}
    Q1 -->|Yes| D[Designer]
    Q1 -->|No| Q2{Task involves code?}
    Q2 -->|Yes| E[Engineer]
    Q2 -->|No| Q3{Task is documentation?}
    Q3 -->|Yes| DW[Docs-Writer]
    Q3 -->|No| O[Orchestrator]
```

## Reviewer: Ship, Fix, or Re-analyze?

```mermaid
flowchart TD
    R[Reviewer completes inspection]
    R --> V{Verdict}
    V -->|Approved / Warnings| S[Shipper]
    V -->|Code-level issues| E[Engineer]
    V -->|Design-level issues| A[Architect]
```

## Engineer: continue, redesign, or escalate?

```mermaid
flowchart TD
    E[Engineer implements spec]
    E --> Q1{Spec gap found?}
    Q1 -->|Yes| A[Architect]
    Q1 -->|No| Q2{Tests pass?}
    Q2 -->|No| E
    Q2 -->|Yes| R[Reviewer]
```

## Common routing patterns

| Scenario | Route |
|----------|-------|
| "Add a login page" | Orchestrator → Architect → Designer → Engineer → Reviewer → Shipper |
| "Fix API response bug" | Orchestrator → Architect → Engineer → Reviewer → Shipper |
| "Should we use Postgres or Mongo?" | Orchestrator → Researcher → Architect |
| "Document the auth module" | Orchestrator → Architect → Docs-Writer → Shipper |
| "Tests are flaky" | Orchestrator → Maintainer → Engineer → Reviewer → Shipper |
