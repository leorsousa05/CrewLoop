# Motion Playbook

Motion should explain change, not decorate the page.

## Principles

- Animate only `transform` and `opacity`.
- Prefer short entrances and even shorter exits.
- On tools and dashboards, render instantly or with a single fade — staggered reveals belong to marketing surfaces only.
- Keep reduced-motion fallbacks simple and complete.

## Motion families

### Entrance
- Page-load reveals and staggers are for the first impression on marketing/brand surfaces — never on tools.
- Keep state changes legible and fast.

### Feedback
- Use quick press and hover feedback to confirm interaction.
- Keep state changes legible and fast.

### Layering
- Use subtle scale or fade for overlays, popovers, and modals.
- Avoid layout shifts and positional animation.

### Data updates
- Crossfade or small transform shifts for refreshed information.
- Do not create animation that competes with the content.

## Anti-patterns

- Bouncy effects with no semantic reason.
- Decorative cursor chasing.
- Large parallax motion on every surface.
- Motion that makes reading harder.
