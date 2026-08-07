# Register: Minimalist (Linear-like)

Restrained, high-craft marketing and product-shell aesthetics: generous whitespace, crisp 1px borders, near-monochrome palettes with tiny accent touches, and monospace details for code-adjacent content. Boldness comes from precision, not decoration.

## When to use
- SaaS and developer-tool marketing sites, pricing pages, changelogs.
- Product shells that frame technical content (docs headers, API reference wrappers).
- Landing pages where the product screenshot or demo is the visual hero.
- Brands whose identity is engineering rigor, speed, or craft.

## When NOT to use
- Dashboards, forms, settings, and other productivity interiors (use Quiet / Product Default).
- Brands that need warmth, playfulness, or editorial richness.
- Content where users read long-form prose (use Editorial).
- Surfaces with dense data tables as the primary content.

## Palette philosophy
- Near-monochrome: backgrounds `H(220-260) S(3-8%) L(97-100%)` light / `L(6-10%)` dark; text at `L(10-20%)` light / `L(88-96%)` dark. Keep the scale to 4-6 neutrals.
- One accent, used sparingly (≤5% of pixels): saturation 60-80%, often a single saturated hue (indigo, green, or orange family) reserved for CTAs, links, and status dots.
- Borders are a first-class token: `L(88-92%)` light / `L(16-22%)` dark, always 1px solid, never hairline-gradient tricks.
- Contrast posture: identical to Quiet — body ≥4.5:1, large text ≥3:1. Whitespace provides the air, not low contrast.

## Typography
- One geometric or neo-grotesque sans for everything (Inter-class or system stack is fine); mono (ui-monospace, JetBrains Mono-class) for code, version strings, keyboard hints, and meta labels.
- Display sizes earn their scale on marketing pages: H1 40-64px, tight line-height 1.05-1.15, weight 500-650 — never decorative serif pairings.
- Body 15-17px, line-height 1.5-1.65, weight 400. Eyebrow labels 11-13px, uppercase, letter-spacing 0.05-0.1em, mono or sans.
- Hierarchy by size + whitespace; avoid weight soup (limit to 2-3 weights total).

## Textures & effects
- Allowed: 1px crisp borders, very subtle static radial highlight behind a hero (single hue, ≤8% opacity), small radius 6-10px, occasional dotted/grid backdrop at ≤4% opacity for code sections.
- Forbidden: animated gradients, mesh gradients, neon glows, glassmorphism stacks, noise overlays, heavy blur, drop shadows larger than `0 4px 16px rgba(0,0,0,0.06)`.
- Depth comes from borders and background-value steps, not shadows.

## Motion flavor
- Budget: up to 3-4 animations on a marketing page; 0-1 on product shells. Each must communicate (state change, continuity, or one deliberate hero moment).
- UI feedback: 100-200ms `ease-out`, `transform`/`opacity` only.
- Permitted signature move: one slow, subtle entrance on the hero (opacity + 8-16px translate, 300-500ms, no overshoot). Everything else is instant-feeling.
- Off-limits: scroll-jacking, cursor parallax/magnetic hover/glow trails, looping background animation, spring overshoot, per-section reveal cascades.
- Reduced-motion fallback: instant swap for every animation, no exceptions.

## Layout idioms
- Max content width 1080-1200px; sections separated by 96-160px of whitespace or a single 1px divider — never both plus a shadow.
- Hero: headline + one supporting line + one CTA + one product visual; nothing else above the fold.
- Feature sections: 2-3 items max per row, aligned to a strict grid; kill the default 3-column icon-card grid if the content does not need it.
- Code/terminal blocks framed with 1px borders, mono font, and real syntax — no fake lorem output.
- Footer as a flat multi-column link list, no newsletter card with a gradient.

## Do / Don't
- Do: let one product screenshot or live demo carry the visual weight.
- Do: use mono accents for code-adjacent meta (version tags, shortcuts, endpoints).
- Do: keep the accent color rare enough that a single colored CTA pulls the eye.
- Do: verify every border and spacing value on both light and dark modes.
- Do: cut a section before shrinking its whitespace.
- Don't: stack glassmorphism, gradients, and glow — one effect per page, if any.
- Don't: animate on scroll for every section; the page should feel static and fast.
- Don't: invent fake metrics, fake logos, or fake terminal output to fill space.
- Don't: use illustration or 3D renders when the product itself can be shown.
- Don't: blur the line with Quiet — interiors inside this shell still follow Quiet register rules.
