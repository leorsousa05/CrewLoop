# Proposal: Automated Non-Blocking Architect and Designer Workflow

## Motivation
Currently, the `architect` and `designer` skills require the user to answer questions or manually confirm routing choices. In fully automated or developer-driven environments, this creates unnecessary blocking steps. The user wants the Architect and Designer to run automatically to completion, writing the specification and visual design files directly without prompting the user or asking questions. All decisions regarding stack choices and visual tone must be resolved during the discovery phase (by the Orchestrator or a brainstorm subagent) before routing to these skills.

## Scope
- Modify `skills/orchestrator/SKILL.md` to:
  - Allow running Architect and Designer automatically or via subagents.
  - Resolve stack and design preferences during discovery.
- Modify `skills/architect/SKILL.md` to:
  - Remove stop conditions that ask questions.
  - Mandate that it writes specs and tasks checklists directly and returns control.
- Modify `skills/designer/SKILL.md` to:
  - Remove the interactive "Discovery (2-3 questions)" phase.
  - Mandate that it writes design specs directly and returns control.

## Constraints
- The workflow handoff sequence (Orchestrator ⇄ Architect ⇄ Orchestrator ⇄ Designer ⇄ Orchestrator ⇄ Engineer) must still be respected.
- The skills must still output their standard deliverables.
