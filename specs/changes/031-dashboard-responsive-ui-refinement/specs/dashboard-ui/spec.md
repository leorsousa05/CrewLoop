# Spec Delta: Dashboard UI

## Current State

The UI uses an industrial command-center shell, but several overlays lack dialog semantics and focus management. Sidebar content remains focusable when translated off-screen, row-level button roles wrap nested controls, populated views lack consistent headings, and responsive layouts can crowd filters, sorting, and timeline content.

## Changes

### ADDED

- A Designer-authored `design-ui.md` defining visual hierarchy, tokens, responsive compositions, states, motion, and accessibility.
- Reusable overlay focus behavior for initial focus, containment, Escape, backdrop dismissal, inert background, and restoration.
- Live regions for connection, pause/resume, copy result, file error, and session removal.
- Explicit view headings and contextual summaries for all populated and empty states.
- Component-level UI tests for focus, keyboard behavior, semantics, and responsive state transitions.

### MODIFIED

- Sidebar and mobile filter sheet become modal surfaces on narrow layouts.
- Session and timeline rows separate primary row action from pin/copy actions.
- Session selector uses coherent combobox/listbox focus and active-descendant ownership.
- Critical metadata moves from 10px micro text to accessible label/caption roles.
- Overview establishes one dominant active-session surface instead of equal-weight panels.
- Mobile Sessions, Timeline, Files, and Settings preserve priority through staged layouts.

### REMOVED

- Focusable translated-offscreen navigation.
- Nested interactive controls inside `div[role=button]` rows.
- Status communication that relies only on dot color or transient visual change.
- External font network dependency; existing chosen fonts are served locally or use an approved packaged fallback.

## Migration Notes

Routes, view names, settings keys, and filter contracts remain unchanged. Component markup and focus behavior may change substantially without changing user-visible capabilities.

## Backward Compatibility

Keyboard shortcuts remain available, but conflicts are resolved through a topmost-overlay priority model. Visual spacing may change within the existing compact/comfortable modes.
