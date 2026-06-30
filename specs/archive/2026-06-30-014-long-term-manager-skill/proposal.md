# Proposal: Add `long-term-manager` Skill to CrewLoop

## WHY

The `project-brainstorm` skill now handles initial discovery for new or ambiguous software projects, producing a structured brief for the Orchestrator. However, software projects often span multiple sessions over days or weeks. Once brainstorming ends, there is no skill responsible for:

- Maintaining a living long-term plan.
- Recording what happened in each session.
- Tracking high-level progress across sessions.
- Reconstructing context when the project is resumed after a long break.

A dedicated `long-term-manager` supporting skill closes this gap. It operates after `project-brainstorm` (or directly after the Orchestrator when the scope is already clear) and keeps durable project artifacts in Markdown inside the target project. This gives the CrewLoop workflow memory across sessions without adding runtime infrastructure.

## Scope

This change adds one new supporting skill to the CrewLoop bundle:

- `skills/long-term-manager/SKILL.md`
- `skills/long-term-manager/references/templates/long-term-plan.md`
- `skills/long-term-manager/references/templates/session-log.md`
- `skills/long-term-manager/references/templates/progress-checklist.md`
- `skills/long-term-manager/references/templates/context-resume.md`

It also updates:

- `skills/orchestrator/SKILL.md` — adds trigger conditions and routing rules for invoking `long-term-manager`.
- `AGENTS.md` — lists the new skill in the skills table.

## Constraints

- Documentation-first project: only Markdown skill files, reference templates, and documentation are created or modified.
- The new skill must follow `assets/templates/skill-template.md` and `references/skill-anatomy.md`.
- The skill must preserve hub-and-spoke routing: after managing long-term artifacts, control returns to the Orchestrator.
- The skill persists artifacts as Markdown files inside the target project (not in CrewLoop's own repository).
- The skill must never write implementation code, run git operations, or perform code review.
- The skill follows docs-as-code principles: artifacts live with the code, are written in Markdown with YAML frontmatter, and should be committed alongside relevant deliveries.

## What is NOT in scope

- A visual dashboard or UI for long-term project tracking.
- Integration with Obsidian MCP or any centralized memory store (may be added later).
- Executable helpers, scripts, or automation beyond Markdown file guidance.
- Changes to the CLI installer logic beyond listing the new skill in documentation.
- Forcing the creation of long-term artifacts for single-session tasks.
