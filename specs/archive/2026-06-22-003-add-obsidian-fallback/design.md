# Design

## Approach

1. Insert a new `## Fallback / No Vault` section early in `skills/obsidian-second-brain/SKILL.md`, after the `## ROLE` or `## MODE` section.
2. Keep the instructions concise and actionable.
3. Preserve all existing content and formatting.
4. Run `python scripts/validate-skills.py`.

## Rollback

The change is a documentation-only addition and can be reverted with a single `git revert`.
