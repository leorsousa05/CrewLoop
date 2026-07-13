# UI/UX Aesthetic Pillars & Technical Guardrails

This file is the anchor. It stays short and points to the deeper playbooks.

## Core pillars

- Commit to one thesis. Every design should have one dominant aesthetic direction and one supporting accent, never a mix of unrelated styles.
- Typography carries the identity. Use one display face and one body face with a clear hierarchy. Do not let the design collapse into system-font neutrality.
- Color must be semantic. Palette choices need clear roles, not decorative gradients.
- Spatial composition should feel authored. Use asymmetry, tension, and purposeful density instead of boilerplate grids.
- Motion should clarify, not decorate. Only animate with intent and keep reduced-motion alternatives ready.
- Accessibility is a visual constraint, not a separate pass. Design focus states, contrast, touch targets, and real states up front.

## Semantic tokens

Use these token families as the common language across all directions:

| Token | Typical usage |
|-------|---------------|
| `--bg-primary` | Page background |
| `--bg-surface` | Cards, panels |
| `--bg-elevated` | Modals, popovers |
| `--text-primary` | Headings, body text |
| `--text-secondary` | Descriptions |
| `--text-muted` | Meta, disabled |
| `--accent` | Primary buttons, links |
| `--success` | Positive states |
| `--warning` | Caution states |
| `--error` | Error states |
| `--info` | Informational states |
| `--border` | Dividers, outlines |
| `--focus` | Focus rings |
| `--overlay` | Backdrops |

## Reference map

Use the index below to choose the supporting playbooks:

| Need | Read |
|------|------|
| Direction selection | [Reference Library](reference-library.md) |
| What not to do | [Anti-Patterns](anti-patterns.md) |
| Page composition | [Layout Patterns](layout-patterns.md) |
| Type hierarchy | [Typography Playbook](typography-playbook.md) |
| Palette construction | [Color Playbook](color-playbook.md) |
| Motion language | [Motion Playbook](motion-playbook.md) |
| Case-study output | [Case Study Template](case-study-template.md) |
| Final quality gate | [Output Checklist](output-checklist.md) |

## Guardrails

- Body text should remain readable at WCAG AA contrast.
- Focus states must be visible on every interactive element.
- Touch targets should meet 44px minimum.
- Motion must honor `prefers-reduced-motion`.
- Any design that resembles a generic startup template should be reworked.
