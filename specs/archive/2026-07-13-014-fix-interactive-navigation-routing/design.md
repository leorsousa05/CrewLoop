# Design Spec: Fix Interactive Navigation Routing Loops

## Bounded Context
This change affects the prompt instructions (skills and conventions) of the CrewLoop framework.

## Proposed Changes

### 1. Update `references/conventions.md`
Add a new rule under the `Letter-Based Navigation & Centralized Routing` section (specifically under `Presentation Guidelines`) to instruct the agent on how to handle incoming navigation tool outputs:

```markdown
- **Handling Tool Responses:** If your current turn is triggered by a tool response from a previous `ask_question` navigation/routing call (e.g. user selected a menu option in the modal), do NOT present the navigation menu or call `ask_question` again. Instead, immediately output the mandatory command recommendation (e.g., `To proceed, execute: /<command>`) and end your turn.
```

### 2. Update Interactive Skills
Each interactive skill under the `skills/` directory that contains a navigation menu (using `ask_question`) will be updated to explicitly state:
- If the current turn is triggered by a tool output of the navigation `ask_question` tool call, immediately output the command recommendation for the chosen route and end the turn.

The affected interactive skills are:
- `skills/crewloop-hub/SKILL.md`
- `skills/engineer/SKILL.md`
- `skills/reviewer/SKILL.md`
- `skills/shipper/SKILL.md`
- `skills/accessibility-auditor/SKILL.md`
- `skills/diamondblock/SKILL.md`
- `skills/docs-writer/SKILL.md`
- `skills/long-term-manager/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/project-brainstorm/SKILL.md`
- `skills/researcher/SKILL.md`
- `skills/security-guard/SKILL.md`
- `skills/tester/SKILL.md`

## ASCII Flow Diagram

```
User triggers skill (e.g., /crewloop-hub)
              │
              ▼
   Agent executes task/checks
              │
              ▼
    Calls ask_question tool
              │
              ▼
User selects option (e.g. "Send to Architect") in modal
              │
              ▼
Next turn: Tool response returned to Agent
              │
              ▼
Is it a navigation tool response?
       ├── YES ──► Output command recommendation (e.g., `/architect`) & EXIT
       └── NO  ──► Present navigation menu / Call ask_question tool
```
