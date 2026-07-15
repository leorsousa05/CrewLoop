---
name: skill-name
description: Describe what this skill does and when to use it. Be specific and include contexts where it should trigger even if the user does not explicitly name it. For example, mention related keywords, adjacent tasks, and competing skills where this one should win.
---

# Skill Name — One-Line Summary

## ROLE

Describe the role in 2-3 sentences. What is this skill responsible for? What does it NOT do?

## TRANSITION CONTRACT

- **Role prefix:** `> [icon] **Skill Name**`
- **Default invoker:** `crewloop-hub`
- **Invoker rule:** outside AFK, return to the actual invoking skill.
- **Interactive routes:** `[I]` -> `invoker`; `[H]` -> `crewloop-hub`
- **Post-selection:** load the selected skill directly without asking for a typed command.
- **AFK route:** skip the menu and return to `crewloop-hub`; only the Hub selects the next phase.

Register the exact contract in `references/skill-contracts.yaml` and keep this capsule synchronized with it.

---

## MODE

**One-word mode.** What is the primary activity? (e.g., ANALYZE only, BUILD only, REVIEW only)

**NEVER do X** — Explain the most important restriction.

**NEVER do Y** — Explain another critical restriction.

**When done, present navigation options** — Outside AFK, show the letter-based navigation menu. In AFK, return to CrewLoop Hub.

---

## WORKFLOW

### Step 1: Verify State

What should the skill check first? Include example commands if useful.

```bash
# Example command
git status --short
```

### Step 2: Do the Work

Describe the core process step by step.

### Step 3: Produce Output

What deliverables or summary should the skill produce?

---

## RESPONSE RULES

- Rule one
- Rule two
- Rule three

---

## ANTI-PATTERNS

- ❌ Something this skill should never do
- ❌ Another common mistake
