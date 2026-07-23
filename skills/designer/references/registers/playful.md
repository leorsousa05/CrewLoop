# Register: Playful / Toy-like

## When to use
- Education products, kids' apps, casual games-as-products, habit trackers, and friendly consumer apps.
- Onboarding flows, empty states, achievement moments, and marketing pages where approachability is the conversion lever.
- Brands whose audience explicitly expects delight — the brief or product category must earn it.

## When NOT to use
- Dashboards, admin tools, forms, settings, checkout, or any productivity surface — those stay Quiet.
- Finance, health-critical, security, or enterprise products where bounce reads as untrustworthy.
- Error, destructive, or confirmation flows: never make a delete dialog playful.
- Any tool surface. Playful lives on brand, marketing, onboarding, and reward moments only.

## Palette philosophy
- Bright but harmonious: pick 2-3 saturated hues and one warm neutral ground, not a rainbow. Backgrounds stay light and soft `hsl(40-60, 30-50%, 95-97%)` or a tinted pastel.
- Accent family: one primary saturated hue `hsl(H, 70-90%, 50-60%)` (coral, sunny yellow, leaf green, or sky blue), plus one complementary pop for highlights.
- Keep saturation high but lightness mid-range — neon on white fails contrast; check every accent for 4.5:1 on its background and darken to `L 40-50%` for text and buttons.
- Text stays a warm near-black `hsl(240-260, 15-25%, 15-20%)` — contrast discipline does not relax because the register is fun.
- Forbidden: purple-to-blue AI gradients, more than 3 hues on one screen, black backgrounds with neon (that is retro-futuristic, not playful).

## Typography
- One rounded or geometric sans for display and UI (a single family can cover both; a second family only if the brief demands a handwriting accent, used for one word at a time).
- Display: H1 36-56px, weight 700-800, line-height 1.1-1.15, tight but not condensed.
- Body 15-17px, weight 400-500, line-height 1.55-1.65 — friendly never means hard to read.
- Buttons and labels: same family, weight 600-700, 14-16px; sentence case, not all-caps shouting.
- Never pair more than two families; never use a novelty font for body copy.

## Textures & effects
- Allowed: character illustration (mascots, spot illustrations) as the register's signature, flat shapes, thick 2-3px outlines, sticker-style white borders on illustrations, chunky 12-20px radii, 999px pill buttons.
- Shadows: one playful offset shadow is allowed — `0 4px 0 hsl(H, S%, 35%)` hard offset on primary buttons, pressed to `0 1px 0` on active. No diffuse shadow stacks.
- Forbidden: glassmorphism, glows, mesh gradients, photorealistic 3D renders (unless the brand is built on them), emoji as structural icons — illustrations replace emoji, they do not duplicate them.

## Motion flavor
- This is the one register where spring/bounce easing earns its place — and it is still budgeted.
- Budget: up to 4 animations on brand/onboarding surfaces, each tied to a reward or feedback moment (success check, level-up, confetti burst, mascot reaction). Zero on any tool surface.
- Spring overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)` or a spring curve) is allowed on success moments and illustration entrances, 250-400ms. Never on navigation, forms, or data.
- UI feedback: 100-200ms `ease-out`, transform/opacity — the button press squish (scale 0.96-0.98) is the register's signature micro-interaction.
- Off-limits even here: scroll-jacking, cursor parallax/glow/magnetic effects without an explicit brief, looping decorative animation that distracts from content, animating width/height/top/left.
- Every animation ships a reduced-motion fallback (instant swap) — delight is opt-out-able.

## Layout idioms
- Big rounded cards (16-20px radius) with generous 20-28px internal padding, 1-2 columns, never dense grids.
- Character-led heroes: illustration or mascot beside a short headline, CTA pill below.
- Progress made visible: step dots, streak counters, progress bars with rounded caps.
- Celebration states as first-class screens: full-screen success with illustration, one springy entrance, clear next action.
- Chunky tap targets: minimum 44px, default to 48-56px on consumer mobile surfaces.

## Do / Don't
- Do:
  - Confine bounce easing to reward and feedback moments, and justify each one.
  - Commission or spec consistent character illustration — one style, one outline weight, one palette.
  - Use the hard offset shadow on primary buttons only, and press it down on `:active`.
  - Keep body text in the readable sans at readable sizes, however fun the display type gets.
  - Darken saturated accents until text and buttons pass 4.5:1.
- Don't:
  - Don't sprinkle bounce on every hover and transition — overshoot on navigation or forms is slop.
  - Don't use more than 3 hues per screen; playful is disciplined, not chaotic.
  - Don't substitute emoji for illustration or icons.
  - Don't make error, payment, or destructive flows playful — they go Quiet.
  - Don't let the mascot appear on every section; 2-3 appearances per page is the ceiling.
