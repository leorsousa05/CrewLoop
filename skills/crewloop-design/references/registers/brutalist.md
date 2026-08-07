# Register: Brutalist

Raw structure made visible. Hard borders, exposed grids, system or monospace type, and contrast pushed to the edge. Intentional ugliness is allowed — sloppy is not. Every "rough" choice must look authored, not broken.

## When to use

- Opinionated brands, creative tools, artist portfolios, indie products, zines, experimental marketing pages.
- Products whose identity is anti-corporate, DIY, punk, or deliberately unpolished.
- Audiences that read polish as untrustworthy or generic (developers, designers, counterculture).

## When NOT to use

- Dashboards, admin tools, forms, settings — Quiet / Product Default owns those.
- High-trust surfaces (banking, healthcare, legal) where rawness reads as broken.
- Accessibility-critical content where extreme contrast or mono body text harms readability.
- Any surface where the brand has no stated appetite for provocation.

## Palette philosophy

- Base: near-white paper or near-black ink, one direction only. Light mode: `HSL 0-60 0-10% / 92-98%` background, text at lightness ≤10%. Dark mode: inverted, background lightness ≤8%.
- Contrast posture: maximum. Body text ≥7:1 (AAA), borders 100% opaque black/white at 2-3px — never hairline grays that apologize.
- Accent: exactly one saturated spot color used at full saturation — e.g. `HSL 50-60 90-100% / 45-55%` (safety yellow), `HSL 0-10 85-100% / 50-60%` (signal red), `HSL 120-140 70-90% / 35-45%` (acid green).
- No gradients, no mid-tone grays for hierarchy. Hierarchy comes from scale, weight, and borders — not from softening colors.

## Typography

- Font categories: system stack (`system-ui`, `-apple-system`) or monospace (`ui-monospace`, `IBM Plex Mono`, `Space Mono`, `JetBrains Mono`). One family only — mixing a grotesque with a mono is allowed only as display + body, never three families.
- Sizing posture: extreme scale jumps. H1 at 48-96px, body at 14-16px — skip intermediate sizes. Tight line-height on display (1.0-1.1), standard on body (1.5-1.6).
- Weights: regular + bold only. ALL CAPS and underline are legitimate emphasis tools here; italic is not.
- Mono body text is acceptable for short content; never for long-form reading.

## Textures & effects

- Allowed: visible grid lines, 2-3px solid borders, hard offset shadows (e.g. `4px 4px 0 #000`, zero blur), raw/uncompressed imagery, visible crop marks, ASCII or marquee-style dividers.
- Forbidden: blur, glassmorphism, soft shadows, rounded corners above 4px (0-2px is the norm), gradients, noise overlays, glows.
- Border-radius: 0 by default. A single rounded element must be justified as deliberate contrast.

## Motion flavor

- Budget: the skill's cap of 3-4 justified animations applies unchanged. Brutalism does not buy extra motion.
- Easing: abrupt and snappy — `linear`, steps, or very short `ease-out` at 80-150ms. Motion may feel mechanical; it must never feel accidental.
- Allowed: instant state swaps with a hard cut, stepped `steps(4)` ticker/marquee only if the brief asks for it, abrupt hover inversions (background/text swap in 0-100ms).
- Off-limits: spring/bounce overshoot, cursor parallax or glow (forbidden unless explicitly briefed), page-load reveal cascades on tools, animating width/height/top/left.
- Every animation keeps a reduced-motion fallback (instant swap). The inversion hover already is one.

## Layout idioms

- Exposed grid: columns separated by full-height 2px rules instead of whitespace.
- Overlapping framed blocks: cards that break the grid by 8-24px, outlined, never floating on shadows alone.
- Table-as-layout: data and even navigation presented in literal bordered tables.
- Massive type as structure: an H1 that spans the full content width and replaces a hero image.
- Rotated or vertical text labels (90deg) for section markers — one per page maximum.
- Sticky raw header: full-width bar, bottom border 2-3px, no blur, no transparency.

## Do / Don't

Do:
- Commit fully — half-brutalism (soft shadows plus one black border) reads as a mistake.
- Use hard offset shadows (`box-shadow: 4px 4px 0`) as the only elevation.
- Keep exactly one accent color and spend it on interactive elements.
- Make hover states invert (black becomes white) instead of lighten.
- Let misalignment be deliberate: shift a block, never nudge it 1px.

Don't:
- Don't apply brutalism to forms or checkout flows — conversion dies there.
- Don't mix in glassmorphism, gradients, or soft cards "to balance it out".
- Don't use more than two typefaces or two weights.
- Don't add decorative motion loops (marquees, tickers) unless the brief asks.
- Don't sacrifice legibility: mono body below 13px or contrast under 7:1 is failure, not style.
