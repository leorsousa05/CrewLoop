# Proposal: Standardized Navigation, Bug-Fixing Flow, and Skill Modularization

## WHY

The CrewLoop framework enforces a centralized Hub-and-Spoke routing model where all roads lead back to the Orchestrator. However, during execution:
1. **Flow Deviations:** Some skills occasionally bypass the Orchestrator or Architect, or direct the user to skip steps.
2. **Missing Routing Suggestions:** AI agents sometimes end their responses without explicitly recommending the next command/skill to execute, leaving the user guessing the next step.
3. **Unstructured Bug Triaging:** Bug fixes are sometimes performed directly by the Engineer without a formal triage step or a lightweight specification, leading to unverified or untested changes.
4. **Instruction Monoliths:** Main `SKILL.md` files contain large checklists, rules, and examples, increasing token overhead and context clutter for the LLM.

Integrating a standardized navigation directive, a mandatory next-step recommendation instruction, a strict bug-fixing pipeline, and the **Modular Skill Reference** pattern resolves these issues, making the repository cleaner and the agent execution highly predictable.

## Scope

- **In Scope:**
  - Create standard navigation and next-step recommendation templates in `references/conventions.md`.
  - Refactor all 18 `SKILL.md` files to ensure they return control to the Orchestrator and provide explicit recommendations of the next command.
  - Implement the **Modular Skill Reference** pattern: extract dense checklists, templates, and rules from the main `SKILL.md` files and place them in local `skills/<skill-name>/references/` subdirectories.
  - Establish a mandatory bug-fixing workflow: `maintainer` (triage) -> `architect` (creates spec: `.spec.yaml` + `tasks.md`) -> `engineer` -> `reviewer` -> `shipper`.
  - Document this workflow in `references/workflow.md`, `README.md`, and `AGENTS.md`.
- **Out of Scope:**
  - Changes to the CLI tool code or the dashboard server code itself.
  - Modifying the Docusaurus deployment settings (docs markdown updates are in scope).

## Constraints

- All 18 skills must continue to pass the `python scripts/validate-skills.py` verification.
- Relative links to extracted reference documents inside `skills/<skill-name>/references/` must be correct and accessible to the agents.
- The standard navigation must support both `ask_question` tool usage and standard markdown fallback.
