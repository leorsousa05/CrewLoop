# Proposal: Interactive Agent Tools & Eco-pipeline Integration

## Motivation
Most AI agents execute workflows by interacting with users through raw markdown text in the chat, resulting in slow operations. By integrating interactive coding agent tools (`ask_question`, `schedule`, `manage_task`, `ask_permission`) directly into conventions and skills, we leverage platform-native interactive dialogs, background tasks, and structured confirmations.
Additionally, the current linear workflow creates a gap between visual UI design (Designer) and code component implementation (Engineer), and lacks specialized support for database schema migrations and CI/CD pipelines. Transitioning to a centralized hub-and-spoke star routing model and introducing specialized supporting skills (`frontend-architect`, `schema-designer`, `devops-specialist`) resolves these gaps, making the team workflow highly cohesive and production-ready.

## Scope
- **In Scope:**
  - Create a unified `AGENT INTERACTIVE TOOLS & CAPABILITIES` section in `references/conventions.md`.
  - Refactor all existing 13 skills in the repository to return exclusively to the Orchestrator, simplify their menus, and use interactive tools where applicable (especially `ask_question` for navigation, confirmations, and structured choices).
  - Create 3 new supporting skills: `frontend-architect`, `schema-designer`, and `devops-specialist` under `skills/`.
  - Update `AGENTS.md` and `README.md` to document the new hub-and-spoke pipeline star routing model and the 3 new skills.
- **Out of Scope:**
  - Runtime code execution changes in the CLI or dashboard servers. Only skill documentation (`SKILL.md` files) and onboarding docs are being modified.

## Constraints
- **Fallback Compatibility:** Agents or platforms that do not support interactive tools must seamlessly fall back to standard text/markdown chat.
- **Validator Pass:** All 16 skill files must pass the CLI validator script (`validate-skills.py`).
