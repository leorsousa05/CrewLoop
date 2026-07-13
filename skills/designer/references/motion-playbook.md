# Motion Playbook

Motion should explain change, not decorate the page.

## Principles

- Animate only `transform` and `opacity`.
- Prefer short entrances and even shorter exits.
- Stagger reveals when many elements appear together.
- Keep reduced-motion fallbacks simple and complete.

## Motion families

### Entrance
- Use page-load reveals for the first impression.
- Stagger cards and sections so they feel orchestrated, not noisy.

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
