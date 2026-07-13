# Proposal: Fix Interactive Navigation Routing Loops

## Motivation
When CrewLoop agents use the `ask_question` tool for interactive navigation routing (e.g. routing between skills like `crewloop-hub`, `engineer`, `reviewer`), they currently print the letter-based markdown fallback menu in the text response and prompt the user to choose. 

When a user responds via the tool UI modal, the tool output is returned to the agent in the next turn (e.g. `"[A] Send to Architect"`). Because there is no explicit logic instructing the agent to immediately transition or output the command recommendation without presenting the menu again, the agent treats this turn as a normal response, processes it, and generates the text menu and another `ask_question` tool call again. This results in the agent redundantly asking the user to choose a letter or route to another agent even after the user has already chosen via the interactive tool.

## Goals & Scope
- **Goals:**
  - Standardize how agents handle a navigation choice submitted through `ask_question`.
  - Prevent routing loops where agents present the routing menu/modal repeatedly.
  - Keep the transition clean and efficient without unnecessary user turns.
- **Scope:**
  - This change modifies `references/conventions.md` to define standard behavior for handling navigation tool responses.
  - It updates the 13 interactive skills (e.g., `crewloop-hub`, `engineer`, `reviewer`, `shipper`, etc.) under `skills/` to check for incoming tool outputs from previous `ask_question` navigation calls.

## Non-Functional Requirements
- **Usability:** The interactive tool must feel natural and avoid redundant prompts.
- **Consistency:** All 13 interactive skills must behave consistently when receiving `ask_question` navigation choices.
