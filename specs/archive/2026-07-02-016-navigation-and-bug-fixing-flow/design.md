# Design: Standardized Navigation, Bug-Fixing Flow, and Skill Modularization

## [Padrões Aplicados]

### 1. Mediator Pattern (Star Topology Routing)
- **Justification:** Ensuring all 18 skills route control exclusively back to the Orchestrator. No skill can route directly to another execution skill. Every response must include a mandatory prompt suggesting the exact next slash command (e.g., `/orchestrator` or `/reviewer`) to prevent routing dead-ends.

### 2. Modular Skill Reference (Documentation Componentization)
- **Justification:** Large `SKILL.md` files consume excessive context tokens. We separate the core skill definition (Role, Workflow, Navigation Menu) from detailed implementation guidelines, rules, templates, or checklists. These auxiliary files are placed in a subfolder: `skills/<skill-name>/references/` (e.g., `skills/shipper/references/git-templates.md`).

### 3. Chain of Responsibility (Strict Bug-Fixing Workflow)
- **Justification:** Formalizing a sequential, non-bypassable pipeline for all bugs. Bug-fixing cannot skip triage or specification. The flow must follow:
  `maintainer` (reproduces and triages) -> `architect` (creates lightweight spec) -> `engineer` (implements and verifies) -> `reviewer` (reviews quality/security) -> `shipper` (archives spec, tags/commits/pushes).

---

## [Estratégia de Implementação]

### Phase 1: Navigation Standardization & Mandatory Recommendations
1. Update `references/conventions.md` and `references/workflow.md` to mandate that every response from any skill ends with:
   - A call to the `ask_question` tool for navigation choices.
   - An explicit, bold recommendation in the main text indicating the exact next command the user should run (e.g., *"Para continuar, por favor execute: `/orchestrator`"*).
2. Refactor all 18 skills' `SKILL.md` files to update their final instructions to match this requirement.

### Phase 2: Skill Modularization (Refactoring)
1. For skills with extensive checklists, templates, or instructions (such as `shipper`, `architect`, `designer`, `engineer`, `reviewer`, `accessibility-auditor`), create a local `references/` subdirectory inside their respective `skills/<skill-name>/` folders.
2. Move auxiliary files/content into files like `skills/<skill-name>/references/checklists.md` or `skills/<skill-name>/references/rules.md`.
3. Add a `### References` section in `SKILL.md` linking to these files relative to the skill path.

### Phase 3: Bug-Fixing Pipeline Formalization
1. Define the lightweight specification requirements for bug-fixes: a bug spec needs ONLY `.spec.yaml` + `tasks.md` inside `specs/changes/NNN-bug-name/`. No `proposal.md` or `design.md` is required unless the bug has high architectural complexity.
2. Update the `maintainer` skill to clarify that its output for bugs is triage details and a handoff to the `orchestrator` for the `architect`.
3. Update the `architect` skill to outline the lightweight spec creation for bugs.

---

## Contracts & Stubs

### 1. Navigation Handoff Block Contract
Every skill's final response block must conform to:
```markdown
# [IMPLEMENTAÇÃO]
[Short summary of work done]

Para prosseguir, execute o próximo comando:
`/<next-skill-command>`
```

### 2. Lightweight Bug Spec Structure
```
specs/changes/NNN-bug-name/
├── .spec.yaml              # title, status: "active", author, affected_files
└── tasks.md                # checklist of bug reproduction and fix steps
```

### 3. Modular Skill Layout
```
skills/<skill-name>/
├── SKILL.md                # Contains Role, Bounded Context, Main Workflow, Handoffs
└── references/             # Local references directory
    ├── checklists.md       # (Optional) Extensive compliance checklists
    ├── rules.md            # (Optional) Behavioral rules/guidelines
    └── templates.md        # (Optional) Output or file templates
```

---

## Test Plan

- **Validation Script:** Run `python scripts/validate-skills.py` to ensure all 18 skills are parsing successfully.
- **Link Check:** Programmatically or manually check all relative Markdown links from `SKILL.md` to `references/*.md` to prevent broken paths.
- **Dry-run Navigation:** Simulate a full bug-fixing loop (Maintainer -> Orchestrator -> Architect -> Orchestrator -> Engineer -> Orchestrator -> Reviewer -> Orchestrator -> Shipper) verifying that every step returns to the Orchestrator, recommends the next step, and uses the lightweight spec structure.

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Agents fail to resolve relative links inside `skills/<skill-name>/references/` | Use absolute paths or direct relative links e.g., `[Checklists](file:///home/arch/codes/crewloop/skills/<skill-name>/references/checklists.md)` to ensure compatibility across environments. |
| Overhead of creating a spec for 1-line bug fixes | Lightweight spec requires only 2 simple files (`.spec.yaml` and `tasks.md`) which can be created in less than 5 seconds. |
| AI agents ignoring the mandatory next-step recommendation directive | Add the recommendation requirement to the root `AGENTS.md` and the global `conventions.md` which are read by every agent. |
