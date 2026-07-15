# Design: Direct Handoff Without Commands

## Overview
This change removes the user-facing slash-command handoff entirely. The workflow stays
direct-routed, but after a user selects a next step the skill should continue straight into the
next phase rather than asking the user to type anything.

## Contract Change
Replace the current mandatory footer with direct handoff behavior:

```markdown
Continue directly into the chosen next skill.
```

For turns that are triggered by a prior `ask_question` selection, the response should not
contain any slash command, command label, or instruction for the user to type anything.

## Affected Surfaces
- `references/conventions.md` becomes the canonical definition for direct handoff behavior.
- `AGENTS.md` and `references/workflow.md` mirror the same contract for repository guidance.
- Skill files stop emitting command prompts after navigation choices.

## Risk Assessment
- The workflow semantics remain unchanged, so the main risk is inconsistency between docs if
  not every skill file is updated.
- The direct handoff may require more explicit wording in the docs so contributors understand
  that the next skill continues automatically.

## Validation
- Review every file that contains the old command reminder or command-style handoff.
- Confirm the direct-handoff wording is consistent everywhere it appears.
- Run `python scripts/validate-skills.py` after editing SKILL.md files.
