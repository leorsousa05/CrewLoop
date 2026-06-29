---
sidebar_position: 1
---

# Writing a Skill

A CrewLoop skill is a single `SKILL.md` file that defines a specialist role for an AI agent. Each skill is autonomous and self-describing.

## Anatomy of a skill

```markdown
---
name: your-skill-name
description: "One-sentence trigger description and primary responsibility."
---

# Skill Name — Mode Name

## ROLE
[2-3 sentences: what the skill is and what it owns.]

## MODE
[What the skill does and what it explicitly does NOT do.]

## [CORE SECTIONS]
[Responsibilities, workflow, anti-patterns, etc.]

## RESPONSE RULES
[Behavioral constraints and output format.]
```

The YAML frontmatter (`name` and `description`) is what agents use for automatic detection. Never remove or rename these fields.

## Step-by-step

### 1. Copy the template

```bash
cp assets/templates/skill-template.md skills/<skill-name>/SKILL.md
```

### 2. Fill in the frontmatter

```yaml
---
name: your-skill-name
description: "Trigger on [keywords]. Does [primary responsibility]. Never [primary prohibition]."
---
```

Keep the description under 2 sentences. Agents use it for trigger matching.

### 3. Write the body

Follow `references/skill-anatomy.md` for required sections.

Key rules:
- Every skill must have a "What [Skill] Never Does" section.
- Every skill must end with a letter-based navigation menu.
- Shared conventions belong in `references/`, not inside the skill.
- Skill-specific references belong in `skills/<skill-name>/references/`.

### 4. Run the validator

```bash
python scripts/validate-skills.py
```

Fix any `FAIL` items before proceeding.

### 5. Go through the full workflow

New skills must go through the standard flow:

```
Orchestrator ⇄ Architect ⇄ Orchestrator ⇄ Engineer ⇄ Orchestrator ⇄ Reviewer ⇄ Orchestrator ⇄ Shipper
```

## Anti-patterns

- A skill that owns two phases (e.g., designs AND implements).
- Missing "never does" section — boundaries must be explicit.
- Frontmatter without `name` and `description`.
- Shared conventions written inside the skill instead of `references/`.
- A skill that skips the navigation menu at the end.
- A skill that routes automatically without user confirmation (except in AFK mode).
