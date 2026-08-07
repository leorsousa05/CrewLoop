# Proposal: Automated Non-Blocking Architect and Designer Workflow

## Motivation
Currently, the `crewloop:plan` and `crewloop:design` skills require the user to answer questions or manually confirm routing choices. In fully automated or developer-driven environments, this creates unnecessary blocking steps. The user wants CrewLoop Plan and CrewLoop Design to run automatically to completion, writing the specification and visual design files directly without prompting the user or asking questions. All decisions regarding stack choices and visual tone must be resolved during the discovery phase (by the CrewLoop Hub or a brainstorm subagent) before routing to these skills.

## Scope
- Modify `skills/crewloop-hub/SKILL.md` to:
  - Allow running `crewloop:plan` and `crewloop:design` automatically or via subagents.
  - Resolve stack and design preferences during discovery.
- Modify `skills/crewloop-plan/SKILL.md` to:
  - Remove stop conditions that ask questions.
  - Mandate that it writes specs and tasks checklists directly and returns control.
- Modify `skills/crewloop-design/SKILL.md` to:
  - Remove the interactive "Discovery (2-3 questions)" phase.
  - Mandate that it writes design specs directly and returns control.

## Constraints
- The workflow handoff sequence (Orchestrator ⇄ Architect ⇄ Orchestrator ⇄ Designer ⇄ Orchestrator ⇄ Engineer) must still be respected.
- The skills must still output their standard deliverables.
