# Proposal: Second-Brain Documentation and Integration

## WHY

The second-brain memory system is a first-class part of the Loop Engineering Agents bundle, but the project-level documentation does not reflect that. `AGENTS.md` — the mandatory onboarding guide for agents — does not mention `obsidian-second-brain`, `obsidian-mcp`, or the `~/.lea` vault. `conventions.md` and `workflow.md` also ignore the memory layer.

This creates two problems:

1. **New agents miss the memory system entirely** because they are trained to read `AGENTS.md` first.
2. **Skill integration is inconsistent** because the position and depth of the `MEMORY & CONTEXT` section varies across skills.

This change updates project documentation and standardizes how each skill references the second brain.

## Scope

- `AGENTS.md`
- `references/conventions.md`
- `references/workflow.md`
- `skills/*/SKILL.md` (structural alignment only)

## Out of Scope

- Rewriting the full content of each skill
- Code changes to `servers/obsidian-mcp`
- Vault content changes

## Success Criteria

- `AGENTS.md` describes the second-brain system, its layers, and its role in the workflow.
- `conventions.md` and `workflow.md` reference the memory layer and link to `references/obsidian-mcp-usage.md`.
- Every skill's `MEMORY & CONTEXT` section appears in the same relative position.
- The "three-layer" terminology is clarified across all documents.
