# Design

## Approach

Minimal, surgical edits:

1. In each affected `SKILL.md`, locate the mandatory reference paragraph and replace the two absolute links with relative links.
2. In `skills/orchestrator/SKILL.md`, renumber the duplicated `2.7 Testing & Quality` section to `2.11`.
3. Preserve all other content, formatting, and CRLF line endings.
4. Run `python scripts/validate-skills.py` to ensure structural integrity.

## Rollback

The changes are link/path replacements and a single number change; they can be reverted with a single `git revert` if needed.
