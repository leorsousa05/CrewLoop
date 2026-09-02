# spec-031-dashboard-responsive-ui-refinement

---
name: spec-031-dashboard-responsive-ui-refinement
domain: 02-dashboard
status: active
created: 2026-07-15
completed: null
supersedes: []
---

# Dashboard Responsive UI Refinement

## Objective

Refine the six-view dashboard into a keyboard/screen-reader coherent operational surface with trustworthy overlay behavior, explicit hierarchy, accessible live states, and mobile layouts that preserve the desktop information architecture.

## Context

- Dashboard UI: `shared/architecture-overview.md` §Dashboard (client views, keyboard shortcuts, design system).
- Depends on spec 030 (client correctness) and spec 029 (event/session consistency).
- Deferred browser matrix from archived spec 023 completes here.

## Requirements

1. No closed/off-screen overlay contains reachable focus targets.
2. Dialogs and sheets trap, initialize, restore, and dismiss focus predictably (topmost-overlay Escape/shortcut priority).
3. Interactive rows contain no nested interactive semantics.
4. All six views retain clear hierarchy at desktop and narrow mobile widths.
5. Connection, pause, copy, loading, error, and removal states are perceivable without color alone (live regions).
6. Body content meets WCAG AA contrast; touch targets ≥ 44px on touch layouts; motion uses transform/opacity only, respecting manual + OS reduced motion.
7. Remove external font requests; fonts served locally or via approved fallback.

## Behavior / Flow

1. Designer produces `design-ui.md` before engineering (tokens, hierarchy, responsive compositions, states, motion, accessibility).
   Design handoff: [`design-ui.md`](design-ui.md).
2. Foundations: finalize semantic color/type/spacing/motion tokens both themes/densities; shared modal focus lifecycle + live-region primitives.
3. Shell: closed mobile navigation non-focusable, modal when open; filter sheet/popovers get role, name, containment, dismissal, restoration; session selector combobox/listbox semantics; shortcut priority.
4. Views: consistent headings/summaries/real states; Timeline/Sessions primary actions separated from nested copy/pin controls; Overview dominated by active-session surface; robust narrow-screen sort/timeline/settings/Files drill-down; announced async states.
5. Testing: keyboard-only, focus trap/restoration, semantic assertions, desktop/mobile × light/dark × compact/comfortable × reduced motion, contrast + touch-target review.

## Constraints

- No new navigation model, no Network 3D view, no visual identity replacement.
- No server, adapter, or event protocol changes.
- No decorative animation, glassmorphism, or generic SaaS card grids.
- Phosphor remains the structural icon set; no emoji icons.
- Routes, view names, settings keys, and filter contracts unchanged.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Focus fixes conflict with established shortcuts | Overlay priority + keyboard matrix defined before implementation |
| Larger touch targets reduce data density | Contextual sizing; compact desktop density retained |
| Token changes drift between themes | Semantic tokens changed atomically; contrast verified in both themes |
| View work conflicts across shared styles | Tokens stabilized before parallel component work |
| Translated-offscreen sidebar reachable by tab | Made non-focusable when closed; modal when open |
| Status communicated only by dot color | Live regions + non-color indicators |
| External font unavailable | Local serving or approved packaged fallback |

## Acceptance Criteria

- AC-01: Given a closed or off-screen overlay, no focus target inside it is reachable via keyboard.
- AC-02: Given an open dialog/sheet, focus is trapped, initialized, restored on close, and Escape/backdrop dismiss behave predictably.
- AC-03: Given an interactive row, it contains no nested interactive semantics (no `div[role=button]` wrapping buttons).
- AC-04: Given all six views, each retains clear hierarchy at desktop and narrow mobile widths.
- AC-05: Given connection/pause/copy/loading/error/removal events, they are perceivable without color alone.
- AC-06: Given the UI in both themes, body content meets WCAG AA contrast and touch targets are ≥ 44px on touch layouts.
- AC-07: Given reduced-motion (manual or OS), motion is disabled or transform/opacity only.
- AC-08: Given the app shell, no external font network requests are made at runtime.

## Done When

- [ ] AC-01 — proven by keyboard-only test (hidden-sidebar reachability)
- [ ] AC-02 — proven by focus trap/restoration tests
- [ ] AC-03 — proven by semantic DOM assertions
- [ ] AC-04 — proven by desktop/mobile viewport walkthroughs
- [ ] AC-05 — proven by live-region assertions in component tests
- [ ] AC-06 — proven by contrast review + touch-target audit
- [ ] AC-07 — proven by reduced-motion mode tests
- [ ] AC-08 — proven by network inspection (no font CDN requests)
