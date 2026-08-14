# Frontend Shell Spec Delta

## ADDED

### Editorial visual system

The docs app gains an editorial visual system with the following characteristics:

- Warm paper-like surfaces instead of a pure black canvas.
- Dark ink text with restrained secondary tones.
- One primary accent for actions and links.
- One secondary accent for workflow states and highlights.
- Hairline dividers, measured spacing, and restrained corner radii.

### Workflow spine signature

The landing page and docs shell share a visual signature based on a workflow spine:

- A connected line or rail that represents the CrewLoop handoff path.
- Core roles can be expressed as nodes along the rail.
- The signature must be used sparingly and consistently so it becomes a recognizable identity element.

### Reading-first docs layout

The docs view must prioritize reading clarity:

- A persistent navigation column for category and page discovery.
- A centered reading column with stronger typographic rhythm.
- Callouts and tables styled as editorial panels rather than neon cards.
- Code blocks styled like annotated reference material.

## MODIFIED

### Landing page structure

The landing page must shift from a product-marketing layout to a handbook-style introduction:

- The hero must explain what CrewLoop is, who it is for, and why the workflow matters.
- The primary CTA should still lead to the docs.
- The installation command and workflow preview remain, but their styling should be calm and tactile.
- Skill and workflow visuals should feel like parts of the same system rather than separate decorative widgets.

### Sidebar and navigation

The docs sidebar must remain functional but visually quieter:

- Category labels become section markers.
- Active doc state uses a distinct editorial accent, not neon glow.
- Search and back navigation remain available and obvious.

### Markdown rendering

Markdown output must be restyled to match the new shell:

- Headings, lists, tables, blockquotes, and code blocks should all inherit the new typographic system.
- Alerts should read as clear note panels with semantic color differences.
- Mermaid diagrams should remain supported and visually integrated.

## REMOVED

### Dark-glass default styling

The following visual patterns are no longer part of the target design:

- Cyan/emerald glow clouds
- Heavy glassmorphism panels
- Neon borders and shadows as the default affordance
- Technically themed but visually generic terminal chrome
