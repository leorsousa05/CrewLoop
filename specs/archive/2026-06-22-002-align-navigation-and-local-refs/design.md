# Design

## Approach

1. **Relax `AGENTS.md` navigation rule.** Replace the rigid "always present the full menu" text with a rule that requires a letter-based menu but allows each skill to include only the options that make sense for its next handoff. Add an explicit AFK-mode exception.
2. **Make local-reference instructions conditional.** In every skill's mandatory-reference paragraph, change "read ... any local reference files in the skill's `references/` or `assets/` directory" to "read ... any local reference files or directories (such as `references/` or `assets/`) if present".
3. Preserve all other content, formatting, and CRLF line endings.
4. Run `python scripts/validate-skills.py`.

## Rollback

The changes are wording-only and can be reverted with a single `git revert`.
