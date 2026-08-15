# spec-039-frontend-design-skill-rewrite

---
name: spec-039-frontend-design-skill-rewrite
domain: 04-workflow
status: completed
created: 2026-08-15
completed: 2026-08-15
supersedes: []
---

# Frontend Design Skill Rewrite (Anthropic Frontend Design Principles)

## Objective

Rewrite `skills/crewloop-design/SKILL.md` so its process and philosophy mirror the Anthropic
Frontend Design skill — a distinctive studio-design stance (subject-grounded, opinionated
tokens, two-pass brainstorm/critique, one deliberate signature element) — while keeping the
CrewLoop wrapper intact (frontmatter, transition contract, design-spec-only deliverables).
The new philosophy supersedes the current "quiet-product restraint" default.

## Context

- Current skill: `skills/crewloop-design/SKILL.md` — restraint-first ("best design is the
  least design"), mandates loading surface/register packs as presets.
- Target principles (from Anthropic Frontend Design skill, user-provided): ground in subject;
  hero is a thesis; typography carries personality; structure is information; deliberate
  motion; complexity matched to vision; careful copy; two-pass process (brainstorm token
  system → critique → build → critique again); avoid the three AI-default clusters (cream +
  serif + terracotta; near-black + single acid accent; broadsheet hairlines) unless the
  brief asks for them; spend boldness in one place; quality floor (responsive, keyboard
  focus, reduced motion).
- Related specs: `spec-013-automated-architect-and-designer` (design commits to a direction
  without interactive discovery), `spec-037-code-review-skill` (precedent for skill-only
  changes), `references/skill-contracts.yaml` (contract source of truth).
- `scripts/validate-skills.py` enforces frontmatter (`name`, `description`), transition
  contract matching the YAML, and internal link validity.

## Requirements

1. `skills/crewloop-design/SKILL.md` is rewritten in full, in CrewLoop's own voice, carrying
   the Anthropic process: subject grounding, hero-as-thesis, deliberate display/body/utility
   type pairing, structure-as-information, motion restraint, copy guidance (end-user side of
   the screen, active voice, errors/emptiness as direction), and a two-pass design process —
   pass 1: compact token system (4–6 named hex palette, 2+ typeface roles, layout concept
   with ASCII wireframes, one signature element); pass 2: critique against generic-default
   drift, revising and recording what changed and why before finalizing.
2. Frontmatter keeps `name: crewloop:design` and a `description` string; the transition
   contract section stays byte-equivalent to `references/skill-contracts.yaml` for
   `crewloop:design` (Role prefix `> 🎨 **CrewLoop Design**`, Direct route `crewloop:code`,
   AFK route to `crewloop:plan`).
3. Deliverables remain design-spec-only: token system, type scale, layout + wireframes,
   signature element, motion plan, real-state specs, quality-floor checklist — precise enough
   for `crewloop:code` to implement. The skill never writes HTML/CSS/JS.
4. The references/ library (registers, surfaces, playbooks) is **demoted**: no mandatory pack
   loading, `quiet-product` is no longer a default; registers/surfaces are optional
   inspiration only when the brief leaves an axis free; playbooks remain optional material.
5. The skill names and rejects the three AI-default visual clusters explicitly, and requires
   a self-critique pass that records what was revised and why.
6. The self-critique step is adapted to spec-based work: since design never builds, the
   critique pass applies to the design plan/spec itself (drift check against the brief);
   screenshot-based critique of the rendered page is documented as the job of
   `crewloop:code`/`crewloop:review` verification, not design.

## Behavior / Flow

1. Plan (this spec) → `crewloop:code` rewrites `skills/crewloop-design/SKILL.md`.
2. `crewloop:code` runs `python3 scripts/validate-skills.py`; fix until clean.
3. `crewloop:review` checks the diff against this spec → PASS routes to `crewloop:ship`.
4. Ship commits, marks this spec completed, appends chat-log, updates `project-state.md`.

## Constraints

- Only `skills/crewloop-design/SKILL.md` is modified. Do NOT edit: other `SKILL.md` files,
  `references/skill-contracts.yaml`, `conventions.md`, `workflow.md`, `AGENTS.md`, or any
  file under `skills/crewloop-design/references/`.
- No new skills, no CLI/dashboard/docs-site changes.
- Transition contract and frontmatter must satisfy `scripts/validate-skills.py` unchanged.
- [Fidelity]: chose "full rewrite, same principles" — CrewLoop's own voice and section
  format, no verbatim Anthropic text blocks. Revisit if the user later wants verbatim.
- [Philosophy conflict]: the new opinionated stance supersedes the old quiet-product default
  per user decision; restraint is kept as the "spend boldness in one place" rule, not as the
  default aesthetic.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Validator rejects contract or frontmatter | `crewloop:code` aligns the section to `skill-contracts.yaml` verbatim; contract is not negotiable |
| Links to references/ break during rewrite | All existing reference files stay in place; new SKILL.md links them with relative paths; validator link check must pass |
| User brief already pins an AI-default look (cream/serif, dark+accent, broadsheet) | Skill must follow the brief's own direction — the defaults are forbidden only when the axis is free |
| Designer is tempted to skip critique pass | Skill mandates the critique step with a written "what changed and why" note in the deliverable |
| Screenshot-based visual critique unavailable (design never builds) | Adapted: critique applies to the spec; rendered-page critique documented as code/review responsibility |
| Conflict with spec-013 (no interactive discovery) | Critique and brainstorming are internal agent steps, not user questions; no questionnaire |

## Acceptance Criteria

- AC-01: Given the rewrite, `python3 scripts/validate-skills.py` passes with zero errors.
- AC-02: Given the rewritten file, it contains the two-pass process (token-system brainstorm
  then critique-with-revision) and an explicit anti-default clause naming the three AI
  visual clusters.
- AC-03: Given the rewritten file, its transition contract matches `skill-contracts.yaml`
  for `crewloop:design` and the frontmatter `name` is `crewloop:design` in directory
  `crewloop-design`.
- AC-04: Given the rewritten file, it states design produces a spec for `crewloop:code` and
  never writes implementation code, and it demotes the references/ library to optional
  material (no mandatory register/surface loading).
- AC-05: Given `git diff`, only `skills/crewloop-design/SKILL.md` is changed.

## Done When

- [x] AC-01 — proven by `python3 scripts/validate-skills.py` exiting 0
- [x] AC-02 — proven by reading the diff: two-pass process + anti-default clause present
- [x] AC-03 — proven by validator contract check + frontmatter parse
- [x] AC-04 — proven by reading the diff: spec-only deliverable and demoted references
- [x] AC-05 — proven by `git status` showing a single modified file
