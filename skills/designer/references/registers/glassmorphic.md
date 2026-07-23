# Register: Glassmorphic

Depth built from blur and translucency layered over a rich background. This is a known AI-slop style when overused — the anti-patterns file names it explicitly. Treat every frosted panel as a liability that must earn its place, and enforce the readability guardrails below without exception.

## When to use

- Surfaces with a genuinely layered spatial model: overlays on maps, media players, HUDs, control panels floating over live content (video, canvas, dashboards-over-wallpaper OS UIs).
- Brand surfaces where the brief explicitly asks for a glass/depth aesthetic and supplies the rich background imagery to support it.
- Dark-mode-first products where translucency reads as depth, not haze.

## When NOT to use

- Dashboards, forms, settings, data-dense tools — Quiet / Product Default owns those; blur destroys scannability.
- Any surface without a visually rich backdrop. Glass over flat white is just a gray box with a performance cost.
- Light-mode reading surfaces — frosted panels over light content almost never reach contrast requirements.
- Long-form text, tables, code, or any content where readability is the product.

## Palette philosophy

- Background is the register's foundation: a rich, dark, multi-hue backdrop (deep navy, plum, forest) at `HSL 220-280 30-50% / 8-20%`, possibly with 1-2 static blurred color orbs at low saturation — never animated gradients.
- Glass surfaces: white at 8-16% opacity over the dark base, plus a 1px border of white at 15-25% opacity to define the edge. Formula: `background: hsl(0 0% 100% / 0.08-0.16)`, `backdrop-filter: blur(12-20px)`.
- Contrast posture: strict and non-negotiable. Text sits on the *composite* of glass + backdrop — measure contrast against the worst case behind the panel, not the average. Body text ≥4.5:1 at every scroll position. If the backdrop is busy, raise glass opacity to 20-30% or add a solid underlay; never lower text contrast to keep the effect.
- Text: near-white primary (`HSL 0 0% 95-100%`), secondary at 70-80% opacity white. One accent maximum.

## Typography

- Font categories: one clean geometric or neutral sans (`system-ui`, `Inter`-class) — the effect is the personality, so type stays quiet. Never display serifs or mono inside glass.
- Sizing posture: restrained. Body 15-16px minimum inside frosted panels (blur degrades small type), headings 20-32px. Never set body text below 14px on glass.
- Weights: 400-600 only. Thin weights (100-300) disappear against busy backdrops — forbidden.

## Textures & effects

- Allowed: `backdrop-filter: blur(12-20px)`, translucent fills (8-16% white), 1px translucent borders, a subtle inner top highlight (1px white at 10-20%), soft drop shadows with large blur and low opacity (`0 8px 32px hsl(0 0% 0% / 0.2-0.3)`).
- Forbidden: more than 2 stacked glass layers, glass-on-glass nesting, blur over text-heavy regions, animated or mesh gradients behind panels, saturation boosts above `saturate(120%)`, combining glass with neon glows.
- Layer limit: at most two glass depths (e.g. floating panel over glass sidebar). A third layer is the slop signature.

## Motion flavor

- Budget: the skill's cap of 3-4 justified animations applies unchanged. Blur is expensive — prefer animating `opacity` and `transform` only, never `backdrop-filter` itself.
- Defaults: panel enter/exit at 150-250ms, opacity + translateY(4-8px), `ease-out`. Hover feedback at 100-200ms via a small opacity or border-brightness change, not a blur change.
- Off-limits: spring/bounce overshoot, cursor parallax or glow (forbidden unless explicitly briefed), looping shimmer/sheen sweeps across glass, animated backdrop gradients, scroll-jacking.
- Reduced-motion fallback: instant swap; also honor reduced-transparency by swapping glass for a solid surface color.

## Layout idioms

- Single floating panel: one glass card centered or docked over a full-bleed rich backdrop.
- Glass sidebar + solid content: navigation in a frosted rail, main content on a solid surface for readability.
- Overlay controls: playback or map controls in small glass pills over live media.
- Layered modal: glass dialog over a dimmed (not blurred) backdrop — `hsl(0 0% 0% / 0.4-0.6)`.
- Hero-on-image: one frosted content block over a photographic hero, with a scrim gradient guaranteeing contrast.

## Do / Don't

Do:
- Verify text contrast against the busiest backdrop region, not the prettiest one.
- Cap glass layers at two and keep one fully solid content surface for dense reading.
- Use the 1px translucent border on every glass panel — it is what separates glass from smudge.
- Provide a solid-surface fallback for reduced-transparency and unsupported browsers.
- Keep blur radii modest (12-20px); heavy blur reads as fog and costs GPU.

Don't:
- Don't put paragraphs, tables, or code inside frosted panels.
- Don't use glassmorphism on tools or dashboards to "make them interesting" — that is the #1 slop pattern.
- Don't stack glass on glass or exceed two translucent depths.
- Don't animate `backdrop-filter`, blur radius, or background gradients.
- Don't ship glass over flat or light backdrops — no backdrop richness, no glass.
