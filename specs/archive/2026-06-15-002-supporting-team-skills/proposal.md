# Proposal: Supporting Team Skills

## Problem

The core Loop Engineering Agents workflow covers discovery, specs, design, implementation, review, docs, and shipping. However, the README promises a flow "from requirements discovery to deploy," and several real-world phases are not represented by dedicated skills:

- No one owns **test strategy** beyond the engineer's unit tests.
- No one owns **product decisions**, success metrics, or prioritization.
- No one owns **long-term maintenance**, bug triage, or technical debt.
- No one owns **technology research** or proof-of-concepts before specs.

## Proposal

Add four new skills that extend the team without overlapping existing responsibilities:

1. **tester** — quality assurance and test strategy.
2. **product-manager** — product decisions, metrics, and prioritization.
3. **maintainer** — bug triage, maintenance, and technical debt.
4. **researcher** — technology research and proof-of-concepts.

These skills are invoked by the orchestrator when the user's request clearly matches their domain. They do not replace the core flow; they enrich it.
