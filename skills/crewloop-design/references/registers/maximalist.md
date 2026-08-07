# Register: Maximalist

## When to use
- Gen-Z and youth-brand marketing sites, campaign landers, music/streetwear/festival pages.
- Creator tools, social products, and drop/launch pages where energy is the product.
- Portfolios and editorial experiments where memorability outranks scannability.
- Only when the brief explicitly asks for loud, playful, or rebellious — this register is never the default.

## When NOT to use
- Dashboards, forms, settings, checkout flows, or any productivity surface (use Quiet).
- High-trust contexts: fintech, healthcare, legal, B2B enterprise.
- Content-heavy reading products where decoration fights the text.
- Any interface older or mixed audiences must navigate under time pressure.

## Palette philosophy
- 3-5 saturated hues that deliberately clash, anchored by one neutral base so the eye can rest.
- Base: warm off-white `hsl(40, 30%, 94%)` or near-black `hsl(0, 0%, 8%)` covering 60%+ of the canvas.
- Saturated hues at H 0-360 spread wide (e.g. red `hsl(8, 90%, 55%)`, electric blue `hsl(230, 95%, 60%)`, acid yellow `hsl(60, 100%, 55%)`, hot pink `hsl(320, 90%, 60%)`), S 85-100%, L 50-65%.
- Contrast posture: body text always on the neutral base at ≥4.5:1; clashing hues touch each other only in decorative layers, never in text/background pairs.
- Pick one "loudest" hue as the de facto accent for CTAs; the rest are decorative.

## Typography
- One loud display face (condensed grotesque, heavy slab, or variable-width display) for headlines at 64-160px, weight 700-900, line-height 0.95-1.05, often uppercase.
- One quiet body face (neutral grotesque or system stack) at 15-17px, line-height 1.5 — the contrast between loud display and calm body is the system.
- Rotate headline treatments per section (outline stroke, highlighted marker, mixed case) but keep one font family per role.
- Never use more than 2 families; the chaos comes from scale and treatment, not font count.

## Textures & effects
- Allowed: sticker-style elements with white border + hard offset shadow (4-8px, no blur), torn-paper edges, halftone dot overlays, marker highlights, collage cutouts, rotated badges (-6° to 6°), grain at 3-8% opacity.
- Allowed: hard drop shadows only (blur 0, offset 3-8px) — soft shadows kill the flat sticker energy.
- Forbidden: glassmorphism, mesh gradients, neon glows, blurred backdrops — they read as a different register and muddy the collage flatness.
- Forbidden: more than 2 textures per viewport; every sticker needs a compositional reason (points at a CTA, fills a dead corner, frames a quote).

## Motion flavor
- Budget: up to 4 purposeful animations per view — loud is allowed, random is not.
- Favor snappy easings: `cubic-bezier(0.2, 0, 0, 1)` or quick linear wiggles (150-300ms); a slight overshoot on sticker pop-ins (`cubic-bezier(0.34, 1.3, 0.64, 1)` max) is acceptable here and only here.
- Allowed: hover wiggle/rotate on stickers, marquee tickers for one strip per page, pop-in on scroll for hero elements only.
- Off-limits: cursor parallax, magnetic hover, scroll-jacking, looping background animation, page-load reveal cascades across the whole page.
- Every animation gets a reduced-motion instant swap; marquees freeze into static strips.

## Layout idioms
- Broken grid: overlap stickers and badges 10-30px over image and type blocks, but keep body text inside a readable 60-75ch column.
- One hero statement at 100-160px spanning the full viewport width, rotated -2° to 2°.
- Sticker clusters anchored to corners of cards, never floating in reading flow.
- Marquee strip as a section divider (single line, 24-32px, uppercase).
- Collage hero: 3-5 overlapping media cutouts with hard shadows, arranged asymmetric but balanced by visual weight.
- Sections separated by loud full-bleed color bands alternating with the neutral base.

## Do / Don't
Do:
- Anchor every composition on one neutral base so the saturated hues read as intentional clashes.
- Give each sticker/badge a job: point, label, discount, or frame.
- Keep body copy, forms, and buttons calm and legible — loud above, quiet below.
- Use one hard-shadow style consistently (same offset direction across the page).
- Test the page at 25% zoom: it should read as a deliberate composition, not noise.
Don't:
- Apply this register to tools, dashboards, or checkout — it destroys trust and scannability.
- Stack more than 2 texture types or more than 5 saturated hues per view.
- Let decorative layers overlap interactive elements or body text.
- Use soft shadows, glows, or blur — they break the flat collage language.
- Animate more than 4 things or add looping motion beyond a single marquee.
