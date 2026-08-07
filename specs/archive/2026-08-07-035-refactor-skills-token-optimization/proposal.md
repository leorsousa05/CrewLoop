# Proposal: Refactor Skills for Token Optimization

## WHY

The 6 core skills in `skills/` contain accumulated verbosity and repetitive phrasing across instructions, which increases context window consumption when loaded by AI agents. Trimming unnecessary token overhead while strictly preserving instruction clarity and workflow contracts improves response latency and token efficiency.

## Goals

- Reduce total token footprint across all `SKILL.md` files by removing redundant explanations and verbose formatting.
- Maintain 100% functional equivalence, role boundaries, frontmatter metadata, and transition contracts.
- Ensure all skills pass `python scripts/validate-skills.py`.

## Non-Goals

- Changing team flow or auto-routing contracts.
- Adding or removing skill responsibilities.
