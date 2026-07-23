# Register: Monochrome

## When to use
- Portfolio, fashion, architecture, and photography sites where imagery must lead.
- Luxury and high-consideration products that want severity over warmth.
- Editorial and thought-leadership products with strong typographic voice.
- Developer or design-tool brands that signal precision through restraint.

## When NOT to use
- Products that depend on color-coded data (analytics, monitoring, status dashboards) — status needs hue.
- Interfaces where success/warning/error must be distinguishable at a glance at all times.
- Friendly consumer or education products where pure monochrome reads cold.
- Any brief that asks for warmth, playfulness, or approachability.

## Palette philosophy
- One hue family only: either pure grayscale, or a single hue (e.g. `hsl(220, 20%, X%)`) varied across lightness 5-95%.
- Pure black/white posture: background `hsl(0, 0%, 100%)` or `hsl(0, 0%, 6%)`, text `hsl(0, 0%, 10%)` / `hsl(0, 0%, 92%)`; never pure `#000` on `#fff` for long reading — drop to 85-92% lightness contrast for body.
- Build a 6-9 step lightness ramp within the family; hierarchy comes from lightness steps of ≥10% and weight, not new colors.
- Contrast posture: body text ≥4.5:1, large display ≥3:1, borders and dividers down to 1.5:1 only for non-essential chrome.
- If one accent is unavoidable (a lone CTA), keep it in-family at maximum saturation, or break the register deliberately with exactly one hue used ≤2% of the canvas.

## Typography
- Typography is the entire personality: invest the whole character budget here.
- Display: one distinctive face (sharp serif, extended grotesque, or high-contrast didone) at 48-120px, tight tracking (-0.02em to -0.04em), line-height 0.95-1.1.
- Body: same family or one neutral partner at 16-18px, line-height 1.55-1.7.
- Use extreme scale contrast (e.g. 96px headline against 14px meta text) and weight jumps of ≥300 as the primary hierarchy tool.
- Numerals, small caps, uppercase labels with +0.08em tracking replace the role color would play.
- Max 2 families; every level must differ in at least two axes (size, weight, case, tracking).

## Textures & effects
- Allowed: film grain or noise at 3-6% opacity, fine 1px hairline rules, halftone or dithered imagery, duotone treatment converting all photos into the single family.
- Allowed: generous negative space as the main "texture"; hard-edged geometric blocks of black/white.
- Forbidden: color gradients, glows, glassmorphism, colored shadows — any hue contamination breaks the register.
- Forbidden: more than one texture type per view; shadow only as neutral black at 4-12% opacity, never colored.

## Motion flavor
- Budget: 0-3 animations; the register's power is stillness, so motion must feel deliberate.
- Favor slow, confident easings: 250-400ms, `cubic-bezier(0.16, 1, 0.3, 1)` or plain ease-out, `transform`/`opacity` only.
- Allowed: fade + 8-16px translate on image reveals, underline draws on link hover (150-200ms), a single crossfade between gallery images.
- Off-limits: spring/bounce overshoot, wiggles, parallax, marquees, looping decoration — playfulness contradicts the register.
- Reduced-motion fallback: instant swap everywhere; nothing in this register should require motion to parse.

## Layout idioms
- Strict grid with wide outer margins (8-12% of viewport) and a single 60-70ch text column.
- Oversized headline block occupying the top 40-60% of the viewport, left-aligned, ragged right.
- Full-bleed duotone imagery alternating with pure white/black text-only sections.
- Hairline-ruled index/table layouts (rows separated by 1px lines, no cards).
- Asymmetric two-column: narrow meta column (20-25%) with labels, wide content column.
- Inversion bands: one full-black section per page as punctuation, never more.

## Do / Don't
Do:
- Push typographic scale contrast hard — it replaces color as the hierarchy signal.
- Keep every photo and illustration duotone or grayscale inside the chosen family.
- Verify contrast at every lightness step; gray-on-gray fails silently.
- Use weight, case, and tracking to differentiate levels before adding a second font.
- Let whitespace carry structure; resist filling empty regions.
Don't:
- Introduce a second hue "just for one button" unless the break is deliberate and ≤2% of the canvas.
- Rely on gray shades for status colors — pair with icons, labels, or shape instead.
- Use pure `#000` on `#fff` for long body text.
- Add soft colored shadows, gradients, or glows — they are foreign to this register.
- Fill whitespace with decoration; emptiness is the design material here.
