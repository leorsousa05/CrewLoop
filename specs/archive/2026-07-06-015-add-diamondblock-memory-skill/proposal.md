# Proposal: Add Diamondblock Memory Skill

## Motivation
The user has developed a custom MCP server called `diamondblock` for managing multi-session memory and distilling session histories. In complex, multi-session software projects, it is extremely beneficial to have a structured, dedicated role (or skill) in CrewLoop that manages retrieval and retention of context, guidelines, lessons learned, and session transcripts using the `diamondblock` MCP tools. This prevents context loss between agent sessions.

## Scope
- Create a new skill directory `skills/diamondblock/` with a comprehensive `SKILL.md`.
- Register the new skill in `AGENTS.md` and `README.md`.
- Ensure that the new skill is validated correctly by the validation script.

## Constraints
- The skill must align with the global conventions (`conventions.md`) and standard skill anatomy.
- No direct implementation code is written; only workflow directives for utilizing the `diamondblock` MCP tools.
- The new skill must return control back to the CrewLoop Hub between execution phases.
