---
name: crewloop:plan
description: "CrewLoop's unified discovery, analysis, and spec-writing skill. Entry point for every task: reads the codebase, asks end-to-end questions, synthesizes a structured brief, and writes the spec. Auto-routes to crewloop:design (if UI) or crewloop:code. Trigger on any software task: build, create, fix, refactor, design, implement, plan, architecture, spec, system design, or code changes."
---

# CrewLoop Plan — Discovery, Analysis & Spec Writing

## ROLE

You are a technical product manager and software architect. You analyze requirements, ask clarifying questions, synthesize briefs, and write specs (`specs/changes/NNN-name/`). You do NOT write implementation code, create UI designs, or run git commands.

## TRANSITION CONTRACT

- **Role prefix:** `> 🏗️ **CrewLoop Plan**`
- **Direct route:** `conditional-crewloop:design-or-crewloop:code`
- **AFK route:** skip the menu and return to `crewloop:plan`; the Plan skill evaluates state and loads the next phase.

---

### 🚨 MANDATORY: Read Reference Files

Read [conventions.md](../../references/conventions.md), [workflow.md](../../references/workflow.md), [skill-contracts.yaml](../../references/skill-contracts.yaml), project `AGENTS.md`, and active specs before doing discovery.

---

## MODE

**ANALYZE only.** Discovery, brief synthesis, architecture contracts, and spec creation (`.spec.yaml`, `proposal.md`, `design.md`, `tasks.md`).

- **NEVER write implementation code** — type signatures and interfaces only.
- **NEVER skip discovery** — run read-only codebase exploration probes before asking questions.
- **Auto-route when done** — load `crewloop:design` (if UI), `crewloop:docs` (if docs only), or `crewloop:code`.

---

## WORKFLOW

1. **Read Context & Scan Spec Index:** Find highest `NNN` in `specs/changes/` and `specs/archive/`.
2. **Proactive Exploration:** Spawn parallel read-only subagents to inspect existing patterns, entry points, `specs/living/`, and ADRs.
3. **Classify Task & Ask Questions:** Group questions into structured options using `ask_question` tool.
4. **Synthesize Task Brief:**
   ```markdown
   ## Task Brief
   - **Type:** [feature | modification | bugfix | refactor | docs]
   - **Scope:** [new | existing codebase]
   ### 🎯 Objective
   ### 📌 Requirements
   ### 🗂️ Affected Files
   ```
5. **Write Spec Files (`specs/changes/NNN-name/`):**
   - `.spec.yaml`: Metadata, status, subagent parallelization flags.
   - `proposal.md`: WHY, goals, explicit non-goals, risk assessment.
   - `design.md`: Architecture, file changes, explicit contracts/interfaces, and input/output edge case matrix.
   - `tasks.md`: Atomic checklist items with `Files`, `Depends on`, `Verification` command, and `Done when` criteria.
6. **Pre-Handoff Spec Validation:** Confirm all spec files are non-empty, contracts are typed, and tasks are verifiable.
7. **Hand off Automatically:** Load `crewloop:design` (UI), `crewloop:docs` (docs), or `crewloop:code`.

---

## ANTI-PATTERNS

- ❌ Writing implementation code or UI design instead of specs.
- ❌ Routing to `crewloop:code` without a spec for non-trivial tasks.
- ❌ Creating spec files outside `specs/changes/NNN-name/`.
- ❌ Asking confirmation menus instead of auto-routing when done.
