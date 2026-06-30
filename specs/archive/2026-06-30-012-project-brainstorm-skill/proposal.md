# Proposal: Add `project-brainstorm` Skill to CrewLoop

## WHY

The Orchestrator skill currently carries the full burden of initial discovery. When a user asks for something new or ambiguous — especially an entire software project — the Orchestrator must simultaneously:

- Infer the task type and domain.
- Ask the right discovery questions.
- Avoid overwhelming the user.
- Produce a structured brief.

This is too much responsibility for a single routing skill. A dedicated brainstorming skill can focus purely on extracting intent, proposing ideas, and shaping a brief. The Orchestrator then receives a clean handoff and routes to Architect or Designer as usual.

## Scope

This change adds one new skill to the CrewLoop bundle:

- `skills/project-brainstorm/SKILL.md`

It also updates the Orchestrator skill so it knows when to delegate discovery to `project-brainstorm`, and updates `AGENTS.md` so agents know the skill exists.

## Constraints

- Documentation-first project: only Markdown skill files are created or modified.
- The new skill must follow `assets/templates/skill-template.md` and `references/skill-anatomy.md`.
- The skill must preserve hub-and-spoke routing: after brainstorming, control returns to the Orchestrator.
- The skill must use interactive questions (`AskUserQuestion` when available) and can ask many follow-ups; it is not limited to 2–4 questions.
- The skill must proactively contribute ideas, alternatives, and suggestions, not only collect answers.

## What is NOT in scope

- A long-term project management skill. That will be specified separately after this skill is in place.
- Any code, scripts, or executable helpers.
- Changes to the CLI installer logic beyond listing the new skill in documentation.
