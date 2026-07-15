# Proposal: Dashboard Responsive UI Refinement

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

The current six-view dashboard has a useful command-center foundation but exposes inaccessible overlay behavior, off-screen focusable controls, nested interactive semantics, weak heading structure, small critical text, mobile crowding, and unannounced asynchronous states. Prior redesign specs deferred the complete desktop/mobile and accessibility walkthrough.

## Goals

1. Refine the interface into a trustworthy industrial/utilitarian operational surface.
2. Make navigation, overlays, rows, settings, and live states keyboard and screen-reader coherent.
3. Preserve the six views, hash navigation, light/dark themes, density modes, and existing product identity.
4. Strengthen mobile hierarchy without flattening the desktop information architecture.

## Non-Goals

- A new navigation model, Network 3D view, or visual identity replacement.
- Server, adapter, or event protocol changes.
- Decorative animation, glassmorphism, or generic SaaS card grids.

## Constraints

- Designer must create `design-ui.md` before Engineer implementation.
- Body content meets WCAG AA contrast; targets are at least 44px on touch layouts.
- Motion uses transform/opacity only and respects both manual and OS reduced-motion settings.
- Phosphor remains the structural icon set; no emoji icons.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Focus fixes change established shortcuts | Medium | Define overlay priority and keyboard matrix before implementation |
| Larger touch targets reduce data density | Medium | Apply target sizing contextually and retain compact desktop density |
| Token changes drift between themes | Medium | Change semantic tokens atomically and verify contrast in both themes |
| View work conflicts across shared styles | Medium | Stabilize design tokens before parallel component work |

## Success Criteria

- [ ] No closed/off-screen overlay contains reachable focus targets.
- [ ] Dialogs and sheets trap, initialize, restore, and dismiss focus predictably.
- [ ] Interactive rows contain no nested interactive semantics.
- [ ] All six views retain clear hierarchy at desktop and narrow mobile widths.
- [ ] Connection, pause, copy, loading, error, and removal states are perceivable without color alone.
