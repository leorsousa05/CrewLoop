# Proposal: Direct Handoff Without Commands

## Problem Statement
The current routing contract still forces the user to type or see a slash command after a
navigation choice. In practice, that adds an unnecessary manual step after every handoff and
breaks the expectation that the chosen skill should continue immediately.

## Goals
1. Keep the existing direct-routing workflow intact.
2. Remove command prompts from the end of skill turns.
3. Preserve the `ask_question` menu flow and the existing AFK behavior.
4. Make post-selection routing continue directly to the next skill.

## Non-Goals
- Changing the phase order or the transition table.
- Removing interactive menus.
- Introducing runtime behavior changes outside documentation.

## Success Criteria
- Skill endings no longer ask the user to type a slash command.
- Tool-response turns continue directly into the chosen next skill without repeating the menu.
- Public docs and repository guidance match the no-command routing behavior.
