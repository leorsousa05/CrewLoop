# Proposal: Direct Skill Routing

## Status
- **State:** active
- **Created:** 2026-07-13
- **Author:** @architect

## Problem Statement
Today every execution skill ends its turn by routing the user back to the CrewLoop Hub
(`[O] Return to CrewLoop Hub` + "To proceed, execute: /crewloop-hub"). The Hub then
presents its own routing menu so the user can pick the next skill. This means the user
clicks through **two menus per phase transition** and the Hub mediates every single step
of the flow, even when the next step is obvious (Engineer → Reviewer → Shipper).

The user wants the flow to be direct: when a skill finishes, it should offer the actual
next-step choices right there, and the user decides. The CrewLoop Hub should only mediate
in two situations: (1) as the entry point for new tasks (discovery → Architect), and
(2) in AFK mode, where it routes automatically instead of asking.

## Goals
1. Each skill ends with an interactive menu (`ask_question`) presenting the real next-step
   options for the flow, chosen dynamically from the outcome of the phase.
2. Remove Hub mediation from the middle of the interactive flow entirely — no more
   `[O] Return to CrewLoop Hub` as the default ending of execution skills.
3. Preserve the CrewLoop Hub as the entry point (discovery, requirement gathering, first
   routing to Architect) and as the automatic router in AFK mode.
4. Supporting skills (tester, security-guard, researcher, etc.) point back to the skill
   that invoked them, not to the Hub.
5. Keep the "Handling Tool Responses" rule (shipped 2026-07-13): after the user picks a
   menu option, the skill outputs the command recommendation for the chosen skill and ends.

## Non-Goals
- Changing the phase order itself (Architect → Designer (if UI) → Engineer → Reviewer → Shipper).
- Changing AFK activation phrases or role prefixes.
- Changing what each skill does within its own phase.
- Removing the CrewLoop Hub skill — it stays as entry point and AFK router.
- Editing `assets/templates/skill-template.md` or `references/skill-anatomy.md` (verified:
  they contain no hub-navigation text).

## Constraints
- This is a documentation-first project: all changes are Markdown edits to skill files and
  references. No runtime code.
- The navigation contract is duplicated across ~19 skill files; the canonical definition
  must live in `references/conventions.md` and skill files apply it mechanically.
- `scripts/validate-skills.py` must pass after every SKILL.md edit (frontmatter preserved).
- Installed skills are refreshed via `crewloop install`; no in-repo install step.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Inconsistent menus across 19 skills | Medium | Define one canonical menu block per skill in `conventions.md`; Engineer copies verbatim. Reviewer diffs every skill against it. |
| Dead-end states (skill ends with no valid next step) | Medium | Every menu has a fallback option (return to invoking skill, or CrewLoop Hub for a new task). |
| User confusion mid-flow (who do I call next?) | Low | The dynamic recommendation marks the default next step as "(Recommended)". |
| AFK regression (auto-routing breaks) | High | AFK sections are explicitly preserved; Reviewer verifies AFK blocks untouched in every skill. |
| Reviewer checklist still validates old flow | Low | Reviewer SKILL.md flow-compliance check updated in the same change. |

## Success Criteria
- [ ] No execution skill ends with `[O] Return to CrewLoop Hub` in interactive mode.
- [ ] Every skill's ending menu offers the real next-step options with a marked recommendation.
- [ ] `conventions.md` rule "No Direct Execution Routing" is rewritten to permit direct routing.
- [ ] AFK sections in all skills still route through the CrewLoop Hub automatically.
- [ ] `python scripts/validate-skills.py` passes.
- [ ] ADR `specs/decisions/002-direct-skill-routing.md` records the decision.
