# Register: Swiss International

## When to use
- Design studios, architecture firms, cultural institutions, conferences, type foundries, editorial products.
- Brands whose identity is rigor and clarity — the grid itself is the aesthetic statement.
- Content-heavy sites (programs, indexes, publications) where strong hierarchy beats decoration.
- Portfolios and documentation that must feel objective, ordered, and timeless.

## When NOT to use
- Dashboards, admin tools, and productivity surfaces — asymmetric display layouts fight dense data work; use Quiet instead.
- Products needing warmth or friendliness (wellness, education, consumer apps).
- E-commerce conversion flows that depend on persuasive, salesy layout patterns.
- Any brief without enough real content — Swiss layouts expose filler mercilessly.

## Palette philosophy
- Core palette is achromatic: near-black text `hsl(0, 0%, 8–12%)` on white `hsl(0, 0%, 98–100%)`, with mid-grays `hsl(0, 0%, 45–70%)` strictly for secondary text and hairlines.
- Exactly one spot color, fully saturated: classic Swiss red `hsl(0, 85–100%, 45–55%)`, or an equally committed blue/orange. Use it for links, active states, and one graphic device — never for large fills.
- Contrast posture: extreme. Body text contrast ≥ 7:1 is normal here; avoid gray text below 14px.
- Forbidden: gradients, pastels, multi-hue palettes, tinted neutrals, and dark mode variants that soften the black/white discipline.

## Typography
- One neo-grotesque family only: Helvetica/Neue Haas class, or Inter, Neue Montreal, Söhne, Akkurat equivalents.
- Type is the layout. Use an aggressive scale: display 48–96px for heroes, H2 24–32px, body 15–18px, plus 11–13px meta/label text.
- Weights: 400 and 500 (occasionally 700 for single emphatic words). No italics for decoration.
- Tight tracking on display sizes (-0.02em to -0.04em); line-height 1.0–1.15 for display, 1.4–1.55 for body.
- Flush-left, ragged-right always. Never center body text; never justify. Hyphenation allowed in narrow columns.
- Numerals and punctuation are design elements — use tabular figures, real em-dashes, and large index numbers (01, 02, 03).

## Textures & effects
- Allowed: hairline rules (1px black or gray), hard-edged color blocks, generous white space, black-and-white photography or documentary imagery.
- Allowed: the spot color as a flat geometric shape (bar, square, circle) used once per view as a graphic anchor.
- Forbidden: shadows, rounded corners beyond 2px, gradients, noise/grain, blur/glass, borders on everything, decorative icons, illustration systems.

## Motion flavor
- Posture: minimal and mechanical. Budget 0–3 animations; every one must communicate a state change or spatial relationship.
- Allowed: hover state swaps (color/underline) at 100–150ms linear or ease-out, page transitions as simple opacity cuts 150–200ms, menu open as a single translate.
- Off-limits: spring/bounce easings, parallax, scroll-triggered reveals, staggered cascades, cursor effects, marquee tickers looping by default.
- Easing discipline: if any easing is used, standard `ease-out` only — motion should feel like the grid, not like physics.
- Reduced-motion fallback: instant swap, always.

## Layout idioms
- Mathematical grid: 12 columns (or a strict 4/6-column subset), baseline grid of 8px, margins ≥ 5vw on desktop.
- Asymmetry with rigor: push display type into columns 1–7 and anchor meta text at column 10–12 — imbalance is deliberate, aligned to shared grid edges.
- Index-style pages: numbered lists (01–), hairline-separated rows, tabular data treated as typography.
- Oversized display headline occupying 40–60% of the first viewport, with supporting text small and low-contrast-priority below.
- Fixed or sticky top nav with the wordmark flush-left and links flush-right on the same baseline.
- Whitespace as structure: sections separated by large empty bands (120–200px) instead of cards, dividers, or background color changes.

## Do / Don't
- Do align every element to the grid — one misaligned block breaks the entire register's contract.
- Do set display type huge and let it carry the page; remove decoration instead of adding it.
- Do use the spot color sparingly (≤5% of any viewport) so it stays a signal.
- Do treat footers as full typographic compositions: columns of links, index numbers, legal text at 11–12px.
- Do spec exact grid columns and offsets in the design spec — Swiss depends on implementable math, not vibes.
- Don't center layouts or center-align text blocks; flush-left is the register's spine.
- Don't add cards, pills, or rounded containers — use hairlines and space to group content.
- Don't introduce a second accent color or tint the grays warm/cool.
- Don't apply this register to forms, settings, or data-dense tools; it fights usability at density.
- Don't let AI-slop creep in: no gradient hero, no "modern" glassmorphic nav, no emoji, no stock-photo collage — the register is black, white, grid, and type.
