# Proposal: Deduplicate Memory & Context Sections Across Skills

## Problem

The "Memory & Context" section was added to all 11 skills in change `004-cross-skill-obsidian-integration`. The sections are highly redundant: each one repeats the same onboarding steps (read `AGENT.md`, read `MEMORY.md`, search domain layers) and only differs in the role-specific read/write targets.

This duplication creates maintenance risk. If the vault onboarding flow or the common search pattern changes, up to 11 `SKILL.md` files must be edited by hand.

## Objective

Centralize the common Memory & Context instructions in `references/obsidian-mcp-usage.md` and reduce each skill's section to a short reference plus its role-specific targets.

## Scope

### In scope

- `references/obsidian-mcp-usage.md`: add a "Skill Memory & Context Pattern" section with the common steps and the per-skill targets table.
- All `skills/<role>/SKILL.md` files: replace the full Memory & Context section with a concise reference to the central pattern.
- `specs/living/obsidian-second-brain/memory-architecture.md`: update cross-references if needed.

### Out of scope

- Changing the vault architecture or layer semantics.
- Changing role responsibilities or workflow rules.
- Adding new skills or removing existing ones.

## Constraints

- No behavior change for agents using the skills.
- Keep the per-skill read/write targets visible in each skill file.
- Preserve existing frontmatter, role descriptions, and navigation options.
- Follow Conventional Commits and the existing spec structure.
