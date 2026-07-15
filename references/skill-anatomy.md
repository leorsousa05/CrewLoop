# Skill Anatomy

Guide for writing new skills in the Loop Engineering Agents project.

---

## File Structure

```
skills/<skill-name>/
├── SKILL.md                 # Required. Instructions and frontmatter.
└── references/              # Optional. Docs loaded into context as needed.
    └── templates/           # Optional. Reusable templates.
```

For skills that need executable helpers, prefer scripts in the top-level `scripts/` folder rather than bundling them inside the skill.

---

## SKILL.md Frontmatter

Every `SKILL.md` must start with YAML frontmatter:

```yaml
---
name: skill-name
description: When to trigger and what the skill does. Be specific and slightly pushy — include contexts where the skill should be used even if the user does not explicitly name it.
---
```

### name

- Must match the directory name
- Lowercase, kebab-case

### description

- Primary triggering mechanism
- Include what the skill does AND when to use it
- Mention related keywords and adjacent contexts
- 50-200 words is a good range

---

## SKILL.md Body

Keep the body under 500 lines when possible. Use progressive disclosure:

1. **ROLE** — What the skill is responsible for
2. **MODE** — What it must and must never do
3. **WORKFLOW** — Step-by-step process
4. **RESPONSE RULES** — How to behave and respond
5. **ANTI-PATTERNS** — Common mistakes to avoid

Every skill also includes a compact `## TRANSITION CONTRACT` near the role definition. Its prefix, invoker, routes, and AFK destination must match `references/skill-contracts.yaml`. Critical runtime transitions stay inline; the YAML file is an authoring and CI contract, not a runtime dependency.

### Tone

- Use imperative form for instructions
- Explain why things matter instead of heavy-handed MUSTs
- Be specific in examples
- Preserve letter-based navigation at the end for interactive skills, scoped outside AFK

---

## Validation

Run the validator after creating or editing a skill:

```bash
python scripts/validate-skills.py
```

This checks:
- `SKILL.md` exists
- Frontmatter is parseable
- Required fields (`name`, `description`) are present
- `name` matches the directory name
- Description is not too short
- All 19 skills match `references/skill-contracts.yaml`
- Role prefixes, routes, invokers, and AFK destinations are valid
- Markdown fences are balanced and relative links resolve
