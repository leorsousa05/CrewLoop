---
adr: 008
title: ADR 008: Automatic Routing & Plan as Unified Discovery Entry
status: proposed
date: 2026-08-05
---

# ADR 008: Automatic Routing & Plan as Unified Discovery Entry

- **Status:** proposed
- **Date:** 2026-08-05
- **Related spec:** `specs/archive/2026-08-07-034-automatic-routing-and-plan-discovery-merge/`

## Context

CrewLoop currently has three distinct entry/ideation skills — `crewloop:hub`, `crewloop:plan`, and `crewloop:brainstorm` — plus letter-based navigation menus at the end of every interactive skill. This design makes the user responsible for routing the workflow after every phase. Feedback from the team owner is that the menus feel slow and that the discovery and specification phases should be unified: one skill should ask deep questions, look at the code, and write the spec, then automatically move to the next phase.

## Decision

We will merge `crewloop:hub` and `crewloop:brainstorm` into `crewloop:plan`. `crewloop:plan` becomes the single entry point for every task: it performs codebase exploration via subagents, asks end-to-end discovery questions, synthesizes a brief, writes the spec, and automatically routes to `crewloop:design` (if the change touches UI) or `crewloop:code`. All other skills will remove their end-of-phase navigation menus and automatically load the next skill. The user can interrupt the flow with explicit commands (`stop`, `pause`, `volta`, `voltar`, `re-analyze`), but the default behavior is continuous.

The team is reduced to six skills:

1. `crewloop:plan` — discovery + brief + spec + entry routing
2. `crewloop:design` — UI/UX design, auto-routes to `crewloop:code`
3. `crewloop:code` — implementation, auto-routes to `crewloop:review`
4. `crewloop:review` — quality gate, auto-routes to `crewloop:ship` (PASS) or `crewloop:code` (FAIL)
5. `crewloop:ship` — git/PR, auto-routes to `done`
6. `crewloop:docs` — documentation, invoked on demand, auto-routes to `crewloop:plan`

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Keep the Hub and only remove menus | Leaves the awkward split between Hub, Brainstorm, and Plan; the owner explicitly wants them merged |
| Keep menus but make them optional | Still adds friction and does not solve the core complaint |
| Add a meta-controller skill that decides routing | Adds a new skill and complexity; the simpler rule is "each skill auto-loads the next" |
| Make every skill non-interactive | Plan must ask questions to do deep discovery; a tiny amount of interactivity is necessary |

## Consequences

- **Positive:** Fewer skills, no menus, faster task flow, one clear entry point, easier mental model.
- **Negative:** The user loses the ability to explicitly pick the next skill at every transition. We mitigate this with explicit interrupt commands and by routing FAIL states back to the correct previous skill.
- **Irreversibility:** Removing `crewloop:hub` and `crewloop:brainstorm` changes the installed skill set and the CLI default hook. Reverting requires reintroducing both skills and updating every contract again.

## References

- `specs/archive/2026-08-07-034-automatic-routing-and-plan-discovery-merge/`
- `shared/adrs/adr-007-*`
