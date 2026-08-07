# Design: Refactor Skills for Token Optimization

## Architecture & Strategy

1. **Audit & Prune:** Review each `SKILL.md` to identify repetitive disclaimers, bloated headers, and redundant subagent/workflow text.
2. **Tighten Sentences:** Rephrase passive or conversational instructions into crisp imperative directives.
3. **Preserve Contracts:** Ensure exact YAML frontmatter (`name`, `description`), role prefixes (`> 🔧 **CrewLoop Code**`, etc.), auto-routing rules, and boundary rules are kept untouched.

## File Changes

- `skills/crewloop-plan/SKILL.md` — Streamline discovery steps and question categories.
- `skills/crewloop-design/SKILL.md` — Condense visual system guidelines and aesthetic requirements.
- `skills/crewloop-code/SKILL.md` — Streamline build & verification checklists.
- `skills/crewloop-review/SKILL.md` — Tighten code audit rules and report formats.
- `skills/crewloop-ship/SKILL.md` — Simplify git execution steps and PR formatting.
- `skills/crewloop-docs/SKILL.md` — Streamline documentation synthesis steps.
