# Tasks: Dashboard Responsive UI Refinement

## Setup

- [x] Create the full spec folder and dependency on spec 030.
- [x] Designer creates and approves `design-ui.md` against this contract.
- [ ] Establish a component DOM-test environment only if existing tools cannot cover required behavior.

## Foundations

- [ ] Finalize semantic color/type/spacing/motion tokens for both themes and densities.
- [ ] Remove external font requests and provide an approved local/fallback strategy.
- [ ] Add shared modal focus lifecycle and live-region primitives.

## Shell and Overlays

- [ ] Make closed mobile navigation non-focusable and modal when open.
- [ ] Give filter sheet/popovers correct role, accessible name, focus containment, dismissal, and restoration.
- [ ] Correct session selector combobox/listbox keyboard and focus ownership.
- [ ] Define topmost-overlay Escape and shortcut priority.

## Views

- [ ] Add consistent headings, summaries, and real states to all six views.
- [ ] Separate Timeline and Sessions primary actions from nested copy/pin controls.
- [ ] Refine Overview hierarchy around the active session.
- [ ] Make sort controls, timeline columns, settings rows, and Files drill-down robust on narrow screens.
- [ ] Ensure connection, pause, copy, loading, failure, and removal updates are announced.

## Testing

- [ ] Keyboard-only tests for shell, palette, selector, sheets, rows, and Files drill-down.
- [ ] Focus trap/restoration and hidden-sidebar reachability tests.
- [ ] Semantic assertions for headings, dialogs, listbox, switches, buttons, and live regions.
- [ ] Desktop/mobile checks in light/dark, compact/comfortable, and reduced-motion modes.
- [ ] Contrast and 44px touch-target review.

## Verification

- [ ] Run dashboard typecheck, build, and tests.
- [ ] Complete the deferred browser matrix from archived spec 023.

## Completion

- [ ] Accessibility Auditor and Reviewer pass.
- [ ] Complete and archive only after dependency specs are shipped.
