# Design

## Approach

1. Read `skills/engineer/SKILL.md` to locate the critical rules and anti-patterns sections.
2. Add a new `NEVER write documentation` rule near the other critical rules.
3. Add a new anti-pattern entry in the `ANTI-PATTERNS` list.
4. Preserve all existing content and formatting.
5. Run `python scripts/validate-skills.py`.

## Exact wording

### New critical rule

```markdown
**NEVER write documentation** — READMEs, module docs, feature docs, API docs, and changelogs belong to the `docs-writer` skill. Focus on code and tests only.
```

### New anti-pattern

```markdown
- ❌ Writing or updating READMEs, module docs, feature docs, or changelogs — that's the docs-writer's job
```

## Rollback

The change is a documentation-only edit to a single skill file and can be reverted with `git revert`.
