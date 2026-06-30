# Spec Delta: `project-brainstorm` Skill

## Current System

CrewLoop has 16 skills in the bundle. The Orchestrator is the only skill responsible for discovery, and it must produce a structured brief before routing to Architect.

## Proposed Change

### ADDED

1. `skills/project-brainstorm/SKILL.md`
   - New skill file with YAML frontmatter (`name`, `description`).
   - ROLE: interactive discovery and brainstorming for software projects.
   - MODE: DISCOVERY only. No architecture, no implementation, no code.
   - WORKFLOW:
     1. Read references and existing context.
     2. Determine if the request is a new/ambiguous project or a well-scoped task.
     3. Ask end-to-end discovery questions interactively.
     4. Propose ideas, stacks, features, and alternatives.
     5. Synthesize answers into a structured brief.
     6. Return control to Orchestrator with the brief.
   - RESPONSE RULES: letter-based navigation, role prefix, return to Orchestrator.
   - ANTI-PATTERNS: do not design architecture, do not write code, do not route to execution skills directly.

2. Reference to `project-brainstorm` in `skills/orchestrator/SKILL.md`
   - Add trigger condition: when the user request is new, ambiguous, or describes a whole project, the Orchestrator may invoke `project-brainstorm` before producing its own brief.
   - Add routing rule: after `project-brainstorm` returns, the Orchestrator uses the produced brief and routes to Architect.

3. Reference to `project-brainstorm` in `AGENTS.md`
   - Add the skill to the skills table or list so agents know it is part of the bundle.

### MODIFIED

- `skills/orchestrator/SKILL.md` — add invocation rule for `project-brainstorm`.
- `AGENTS.md` — add skill entry.

### REMOVED

- None.
