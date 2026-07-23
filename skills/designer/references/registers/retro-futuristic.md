# Register: Retro-futuristic

## When to use
- Creative tools, music/audio apps, game-adjacent products, and dev tools that want energy and a digital edge (terminals, synths, code playgrounds).
- Marketing or landing surfaces for products with an 80s/synthwave brand identity.
- Onboarding or celebration screens where playful nostalgia is part of the brand voice.

## When NOT to use
- Dashboards, admin consoles, forms, settings, or any productivity surface — those default to Quiet register.
- Finance, healthcare, legal, or high-trust enterprise products.
- Content-heavy reading surfaces where chrome effects fight long-form text.
- Any surface where the user works for hours — glow and saturated accents cause eye fatigue over long sessions.

## Palette philosophy
- Dark base is the default posture: backgrounds HSL 250-280, saturation 25-40%, lightness 6-12%. Light retro-futurism exists but is rare — only if the brief demands it.
- Accent family: pick ONE energy pair, not a rainbow. Either magenta/pink (HSL 300-330, S 85-100%, L 60-70%) or cyan/electric blue (HSL 185-200, S 90-100%, L 55-65%). A second accent from the same pair may highlight, never a third hue family.
- Warm sunset orange (HSL 15-30, S 90%, L 60%) is allowed only as a gradient endpoint in hero artwork, never as a UI accent.
- Text stays near-neutral: primary text HSL 260, S 15%, L 92%+; body contrast ≥4.5:1 against the dark base. Glow never substitutes for contrast.
- Keep 80%+ of the surface in the dark neutral range; saturated color covers accents, rules, and focal points only.

## Typography
- Display: a geometric or chrome-flavored face (e.g. Orbitron, Monoton-style, or an 80s italic serif) for H1/wordmark only — never below H2.
- Body and UI: a clean grotesque or system stack at 15-16px, 1.5 line-height. Body text never uses the display face.
- Monospace is welcome for data, code, and HUD-style labels (12-13px, uppercase, letter-spacing 0.08-0.12em).
- Sizing posture: display may go large (48-80px on marketing heroes), but UI chrome stays compact (13-15px).

## Textures & effects
- Allowed, budgeted: a perspective grid floor (one per page, in hero or empty states), subtle scanlines at 2-4% opacity, a single sun/horizon gradient in artwork, chromatic glow on the ONE accent family (blur radius 8-24px, opacity ≤60%).
- Chrome/metallic gradients: only on wordmarks or hero type, never on body text or buttons.
- Forbidden: glassmorphism panels over the grid, glow on every card, animated gradient backgrounds, lens flares as UI decoration, more than one texture layer per section.
- Text legibility rule: glowing text needs a solid or near-solid backing; never glow text smaller than 14px or below 4.5:1 effective contrast.

## Motion flavor
- Budget: 3-4 animations max, same as any register. Spend them on what earns it: grid scroll in a hero, a CRT-style power-on for a terminal panel, hover glow ramp (150-200ms, ease-out).
- Easings: linear or ease-in-out for ambient loops (grid drift at 20-40s per cycle); ease-out for UI feedback. No spring overshoot — even here, bounce reads as toy, not retro.
- Off-limits: cursor parallax, magnetic hover, scroll-jacking, page-load reveal cascades on tool surfaces. Looping animation must pause when off-screen and respect reduced-motion (freeze to a static frame).

## Layout idioms
- Centered hero over a receding perspective grid, content column 640-720px.
- HUD framing: thin 1px accent rules at panel corners (bracket corners) instead of full borders.
- Horizontal chrome divider bars with a gradient that fades at both ends, used sparingly between major sections.
- Terminal/console panel: dark surface, monospace content, single accent prompt line.
- Symmetric composition is fine — the energy comes from palette and texture, not forced asymmetry.

## Do / Don't
- Do pick one accent pair (magenta OR cyan dominant) and hold it across the whole surface.
- Do keep body text neutral, static, and high-contrast — nostalgia lives in the chrome, not the copy.
- Do budget glow: one glowing element per viewport is usually enough.
- Do provide a reduced-motion static frame for any looping grid or scanline effect.
- Do test panels at long-session length: if a screen is used 30+ minutes, drop ambient effects.
- Don't apply this register to dashboards, forms, or settings to "make them interesting".
- Don't stack scanlines + grid + glow + chrome gradient in the same section.
- Don't use glowing or gradient-filled body text below 14px.
- Don't blend in purple-to-blue mesh gradients — that is a different slop family.
- Don't let the display font leak into navigation, buttons, or form labels.
