# Register: Quiet / Product Default

The default register for productivity software. It disappears so the user's work stays in front. Only leave this register when the surface genuinely earns expression.

## When to use
- Dashboards, admin panels, consoles, and data views.
- Forms, settings pages, onboarding flows inside a tool.
- Tables, editors, kanban boards, command palettes.
- Any surface a user returns to daily and uses for minutes to hours at a stretch.

## When NOT to use
- Marketing landing pages, launch pages, brand campaigns (see minimalist or expressive registers).
- Portfolios, editorial content, product showcases that sell emotion.
- Onboarding moments explicitly designed to delight or teach a brand voice.

## Palette philosophy
- Build a restrained neutral scale: light mode `H(220-240) S(5-15%) L(96-100%)` for backgrounds down to `L(15-25%)` for primary text; dark mode mirrored (`L(8-14%)` backgrounds, `L(85-95%)` text).
- Add exactly one accent family (hue picked from the brand, saturation 45-70%, lightness 40-55% in light mode) for primary actions, focus rings, and selected states — nothing else.
- Semantic colors (`success`, `warning`, `error`, `info`) stay muted: saturation ≤55%, used only for state, never decoration.
- Contrast posture: body text ≥4.5:1, large text ≥3:1, interactive boundaries (borders, icons) distinguishable without relying on color alone. No low-contrast "elegant gray" body copy.

## Typography
- Prefer the system font stack (`system-ui`, `-apple-system`, `Segoe UI`, Roboto). One family for the whole interface — no display font.
- Body 14-16px, line-height 1.4-1.6, weight 400-500. Section titles 16-20px, weight 600. Page titles rarely above 24px.
- Numerals in tables: tabular figures (`font-variant-numeric: tabular-nums`) or a mono fallback for dense data columns.
- Scale posture: compact. Two to three type sizes do most of the work; hierarchy comes from weight and color, not size jumps.

## Textures & effects
- Allowed: 1px solid borders (`--border` token), subtle elevation (shadows ≤ `0 2px 8px rgba(0,0,0,0.08)`), radius 4-8px.
- Forbidden: gradients, glassmorphism, noise/grain overlays, glows, backdrop blur, decorative illustrations, image backgrounds on panels.
- Elevation hierarchy by border + light shadow only; never more than three elevation levels (page, card, popover).

## Motion flavor
- Default budget: 0-3 transitions, each tied to a state change. "No motion" is a valid deliverable.
- Hover/press feedback: 100-150ms, `ease-out`, `transform`/`opacity` only.
- Popover/modal enter: 150-200ms, opacity + 4-8px translate, no scale beyond 0.98→1.
- Off-limits: spring/bounce overshoot, reveal cascades, staggered section entrances, scroll-triggered animation, cursor parallax/glow, animated skeletons beyond a simple opacity pulse.
- Every animation has a reduced-motion fallback: instant state swap.

## Layout idioms
- Symmetric 12-column grid; content aligned to a single left axis. Never force asymmetry.
- Sidebar + content column for multi-section tools (sidebar 220-260px).
- Dense tables and lists: row height 36-48px, 8-12px internal padding.
- Form layouts: labels above inputs, single column, fields sized to expected input length.
- Persistent header with primary action on the right; breadcrumbs over page titles in deep hierarchies.
- Group related settings into bordered cards with a title row, not floating sections.

## Do / Don't
- Do: keep the accent visible only on interactive elements and selected states.
- Do: let density serve the task — users scan, they do not admire.
- Do: spec loading, empty, and error states for every component that has them.
- Do: use borders and spacing for grouping instead of drop shadows everywhere.
- Do: prefer keyboard-visible focus rings in the accent color, 2px, offset 2px.
- Don't: add a hero banner, mascot, or marketing copy inside a tool.
- Don't: use color-coding without a redundant shape/label indicator.
- Don't: round corners past 8px or use pill buttons for primary actions.
- Don't: hide destructive actions behind hover-only reveals.
- Don't: reach for a custom font, gradient, or animation "to make it interesting" — that is the AI-slop signature.
