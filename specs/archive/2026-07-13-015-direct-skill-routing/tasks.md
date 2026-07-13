# Tasks: Direct Skill Routing

## Setup
- [x] Create spec folder `specs/changes/015-direct-skill-routing/`
- [x] Initialize `.spec.yaml`, `proposal.md`, `specs/routing/spec.md`, `design.md`

## Implementation
Order matters: the canonical contract first, then the mechanical skill edits.

- [x] **1. `references/conventions.md`** — rewrite "Letter-Based Navigation & Centralized
  Routing" → "Direct Routing": add the transition table, menu block format, invoker table,
  and rules 1–5 from `design.md`. Rewrite "Mandatory Workflow (Hub-and-Spoke)" → linear
  chain. Rewrite Bundle Lock-In rule 3 to permit direct routing. Scope the Hub routing
  menu to new-task entry. Keep "Handling Tool Responses" and AFK sections (AFK: state it
  is the only mid-flow Hub mediation).
- [x] **2. `references/workflow.md`** — replace the hub-and-spoke mermaid diagram with the
  linear chain (Reviewer FAIL → Engineer branch); rewrite routing rules 1–10.
- [x] **3. `AGENTS.md`** — rewrite "Mandatory Development Flow", rules 7 and 9, AFK Mode
  section, and "How to Contribute" steps 1–6 to the direct-routing model.
- [x] **4. `skills/crewloop-hub/SKILL.md`** — remove Step 4 mid-flow handback role and the
  direct-routing anti-pattern; keep discovery, entry routing to Architect, and the AFK
  auto-routing section.
- [x] **5. `skills/architect/SKILL.md`** — handoff recommends `/designer` (UI) or
  `/engineer`; remove `/crewloop-hub` recommendation.
- [x] **6. `skills/designer/SKILL.md`** — handoff recommends `/engineer`.
- [x] **7. `skills/engineer/SKILL.md`** — replace ending menu with `[R]/[E]/[A]` block.
- [x] **8. `skills/reviewer/SKILL.md`** — replace ending menu with verdict-based
  `[S]/[E]` block; update the flow-compliance checklist to validate direct routing.
- [x] **9. `skills/shipper/SKILL.md`** — replace ending menu with `[N]/[D]` end-of-flow
  block.
- [x] **10. Supporting skills (12 files)** — replace each ending menu with the
  `[I]` invoker + `[H]` hub block, using the default invoker table: security-guard &
  accessibility-auditor → /reviewer; schema-designer → /architect; frontend-architect →
  /designer; devops-specialist → /shipper; tester → /engineer; docs-writer, researcher,
  product-manager, long-term-manager, diamondblock → /crewloop-hub.
- [x] **11. `skills/maintainer/SKILL.md` + `skills/project-brainstorm/SKILL.md`** —
  ending recommends `/architect` (bug spec / brief handoff), hub as secondary option.
- [x] **12. AFK audit** — verify every skill's AFK section still routes via the Hub;
  no edits unless drift is found.

## Testing
- [x] Run `python3 scripts/validate-skills.py` after all SKILL.md edits — must pass (19/19 PASS)
- [x] Grep check: zero `Return to CrewLoop Hub` occurrences outside AFK sections and the
  Hub's own entry menu
- [x] Grep check: zero `/crewloop-hub` hardcoded recommendations outside the allowed cases
  (Shipper new-task option, supporting-skill `[H]` option, AFK sections)

## Verification
- [x] Walk the transition table against every edited skill menu — each option exists in
  the table
- [x] Simulate one full flow on paper: hub → architect → engineer → reviewer (FAIL →
  engineer → PASS) → shipper; confirm no dead ends
- [x] Confirm "Handling Tool Responses" rule survives verbatim in `conventions.md`

## Documentation
- [x] Update living specs if any document the old routing (`specs/living/supporting-team-skills/spec.md` updated)
- [x] Add ADR `specs/decisions/002-direct-skill-routing.md`
- [x] README.md check — updated "Workflow (Hub-and-Spoke)" section to direct routing

## Completion
- [x] Update `.spec.yaml` status to completed
- [ ] Archive change folder to `specs/archive/YYYY-MM-DD-015-direct-skill-routing/` (Shipper)
