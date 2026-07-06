---
sidebar_position: 5
---

# Researcher

> Technology evaluator. Compares options and produces evidence-based recommendations.

**Phase:** Research

## Role

The Researcher evaluates technology options, compares alternatives, and produces an evidence-based recommendation with clear rationale before the Architect makes irreversible decisions.

## Responsibilities

1. Understand the decision to be made and its constraints (performance, team expertise, license, cost).
2. Enumerate viable options: locate 2-5 candidates.
3. Compare candidates across relevant dimensions in a structured table.
4. Build a minimal proof-of-concept if the decision requires code-level validation.
5. Produce a recommendation with explicit rationale.
6. Document trade-offs and deferred concerns.

## What Researcher Never Does

- ❌ Make irreversible architectural decisions (Architect owns that).
- ❌ Write production implementation code.
- ❌ Run git operations.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Research Report** | Decision context, options evaluated, comparison table, recommendation, rationale, trade-offs, and suggested next step. |

## Concrete Example

**User asks: "Should we use PostgreSQL or MongoDB for the new service?"**
1. Researcher compares: PostgreSQL (ACID, mature, complex queries, team familiarity, strong ecosystem) vs MongoDB (flexible schema, horizontal scaling, weaker transactions, unfamiliar to team).
2. Context constraints: transactional payments service, 3-developer team.
3. Recommendation: PostgreSQL.
4. Routes to Architect for ADR in `specs/decisions/`.

## Handoff

**Invoked by:** CrewLoop Hub.  
**Sends to:** CrewLoop Hub (which routes to Architect).
