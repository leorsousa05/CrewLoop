# Researcher

**Phase:** Technology Evaluation

The Researcher evaluates technologies, compares alternatives, runs proofs of concept, and recommends options.

## What the Researcher does

The Researcher reduces uncertainty before the Architect commits to a technical direction.

### Core responsibilities

1. **Evaluate alternatives**
   - Libraries, frameworks, databases, cloud services.

2. **Compare trade-offs**
   - Performance, ecosystem, learning curve, maintenance, licensing.

3. **Run proofs of concept**
   - Small experiments to validate assumptions.

4. **Recommend a choice**
   - Clear recommendation with rationale.
   - Risks and mitigation.

## When to invoke

The Researcher triggers when:

- The Orchestrator needs technology evaluation before architecture.
- The user asks "should we use X or Y?"
- A new technology decision is needed.

## Concrete example

**User:** "Should we use PostgreSQL or MongoDB for the new service?"

**Researcher:**

1. Compares:
   - PostgreSQL: strong consistency, relational, mature ecosystem.
   - MongoDB: flexible schema, horizontal scaling, document model.
2. Considers project needs: complex queries, transactional integrity, team familiarity.
3. Recommends PostgreSQL with rationale.
4. Routes to Architect.

## Output artifact: Research Report

| Section | Content |
|---------|---------|
| Options | Alternatives considered |
| Criteria | How they were evaluated |
| Comparison | Pros and cons |
| Recommendation | Best choice and why |
| Risks | Potential issues |

## Handoff

**Next skill:** Architect or Engineer.
