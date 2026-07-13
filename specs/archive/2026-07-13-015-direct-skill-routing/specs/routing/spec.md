# Spec Delta: Routing & Navigation

## Current State
The workflow is hub-and-spoke: every skill ends its turn by handing control back to the
CrewLoop Hub. Interactive skills present a single-option menu (`[O] Return to CrewLoop
Hub`) and end with "To proceed, execute: /crewloop-hub". The Hub then presents its own
routing menu (`[A]/[D]/[E]/[R]/[S]`) for the user to choose the next phase. `conventions.md`
rule 3 ("No Direct Execution Routing") declares any direct handoff between execution
skills a routing error. The Hub mediates every phase transition; AFK mode uses the same
mediation, just without asking.

## Changes

### ADDED
- **Direct Routing contract in `references/conventions.md`** — a new canonical section
  defining: (a) the per-skill next-step menu table, (b) the exact menu block format,
  (c) the rule that the recommended option reflects the phase outcome, (d) the retained
  "Handling Tool Responses" and "Mandatory Command Recommendation" rules.
- **Invoker-return rule** — supporting skills end by recommending the skill that invoked
  them, with a documented default invoker per supporting skill.
- **End-of-flow rule** — Shipper ends the flow; its menu offers starting a new task
  (CrewLoop Hub, its entry-point role) or stopping.
- **ADR `specs/decisions/002-direct-skill-routing.md`** — records the move from
  hub-and-spoke to direct routing.

### MODIFIED
- `references/conventions.md` — "Letter-Based Navigation & Centralized Routing" becomes
  "Letter-Based Navigation & Direct Routing"; "Execution Skills Navigation" menu blocks
  replaced by per-skill menus; "CrewLoop Hub Routing Menu" scoped to new-task entry only;
  "Mandatory Workflow (Hub-and-Spoke)" becomes "Mandatory Workflow (Direct Routing)" with
  a linear-chain diagram; AFK section keeps Hub mediation and states it is the only
  mid-flow mediation case; Bundle Lock-In rule 3 rewritten to permit direct routing.
- `references/workflow.md` — mermaid diagram becomes a linear chain with dynamic branches
  (Reviewer FAIL → Engineer); routing rules 1–10 rewritten: skills route to the next skill
  directly; Hub is entry point + AFK router; supporting skills return to invoker.
- `AGENTS.md` — "Mandatory Development Flow" section, rules 7 and 9, AFK Mode section, and
  "How to Contribute" steps rewritten to the direct-routing model.
- `skills/crewloop-hub/SKILL.md` — Step 4 mid-flow handback role removed; Hub keeps
  discovery + initial routing to Architect; AFK auto-routing retained; anti-pattern
  "routing directly between execution skills" removed.
- `skills/architect/SKILL.md` + `skills/designer/SKILL.md` — non-interactive handoff now
  recommends the next skill directly (`/designer` if UI else `/engineer`; designer →
  `/engineer`) instead of `/crewloop-hub`.
- `skills/engineer/SKILL.md`, `skills/reviewer/SKILL.md`, `skills/shipper/SKILL.md` —
  ending menu replaced with the dynamic next-step menu defined in the contract.
- 12 supporting skills (`tester`, `maintainer`, `docs-writer`, `researcher`,
  `product-manager`, `security-guard`, `accessibility-auditor`, `schema-designer`,
  `frontend-architect`, `devops-specialist`, `project-brainstorm`, `long-term-manager`,
  `diamondblock`) — ending menu replaced with "return to invoker" recommendation per the
  default-invoker table in `design.md`.

### REMOVED
- `[O] Return to CrewLoop Hub` as the default ending of execution skills (16 occurrences).
- The `*Mandatory: Recommend the next command … (e.g. /crewloop-hub)*` boilerplate that
  hardcodes the Hub as next step (16 occurrences) — replaced by per-skill recommendations.
- `conventions.md` rule 3 "No Direct Execution Routing" (direct handoffs declared a
  routing error) — replaced by the Direct Routing rule.
- `crewloop-hub/SKILL.md` anti-pattern "Routing directly between execution skills without
  returning to CrewLoop Hub".

## Migration Notes
- Users with installed skills refresh them via `crewloop install`; no data migration.
- No breaking change to the phase order or to spec/living/archive workflows.

## Backward Compatibility
Non-breaking for artifacts (specs, ADRs, living docs unchanged in format). Behavior change
for agents: the ending menus and recommendations differ. AFK mode behavior is preserved
verbatim, so automated runs are unaffected.
