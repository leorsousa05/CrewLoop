# ADR 002: Direct Skill Routing (End Mid-Flow Hub Mediation)

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** project owner, architect skill
- **Spec:** `specs/changes/015-direct-skill-routing/`

## Context
The workflow was hub-and-spoke: every skill ended by returning control to the CrewLoop
Hub (`[O] Return to CrewLoop Hub`), and the Hub presented the routing menu for the next
phase. Conventions even declared direct execution-skill handoffs a routing error
(`conventions.md` rule 3). In practice this forced two menus per phase transition and made
the Hub a bottleneck for decisions that are usually obvious (Engineer → Reviewer →
Shipper).

## Decision
Adopt **direct skill routing**:

1. Each skill ends by presenting the valid next-step options itself, via `ask_question`
   (markdown fallback), with the outcome-appropriate option marked "(Recommended)".
2. The CrewLoop Hub keeps only two roles: entry point for new tasks (discovery →
   Architect) and automatic router in AFK mode.
3. Supporting skills recommend returning to the skill that invoked them (default invoker
   table in the spec's `design.md`).
4. The "Handling Tool Responses" and "Mandatory Command Recommendation" rules are
   retained unchanged.

## Alternatives Considered
- **Keep hub-and-spoke** — rejected: double menus, slow iteration, no benefit when the
  next step is deterministic.
- **Fully remove the Hub** — rejected: discovery/requirement gathering and AFK automatic
  routing still need a coordinator; new-task entry needs a front door.
- **Single fixed recommendation, no menu** — rejected: users legitimately deviate
  (re-review, skip to ship, back to architect); menus keep deviations one click away.

## Consequences
- **Positive:** one menu per transition; skills own their endings; flow is readable as a
  linear chain with explicit branches; AFK automation untouched.
- **Negative:** the navigation contract is duplicated across ~19 skill files (mitigated by
  keeping the canonical version in `references/conventions.md` and having Reviewer diff
  against it).
- **Neutral:** spec/ADR/living-docs formats unchanged; no migration beyond
  `crewloop install` refreshing installed skills.
