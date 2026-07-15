# Routing Delta: Compact Handoff Markers

## Changed

### Direct Handoff After Selection
- The mandatory footer is removed after a menu selection.
- If the turn follows a prior interactive menu selection, continue directly into the chosen next skill without asking the user to type a command.
- No slash-command instruction should appear in the post-selection response.

### Unchanged
- The direct-routing workflow stays the same.
- `ask_question` remains the preferred menu mechanism.
- AFK still skips menus and routes through the CrewLoop Hub automatically.
