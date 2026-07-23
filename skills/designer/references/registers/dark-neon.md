# Register: Dark Neon

## When to use
- Gaming products, esports, streaming overlays, cyber/security tools, and music apps where dark-mode-first is the brand.
- Dev tools and terminals that want a harder, cyber edge than Quiet register provides.
- Marketing surfaces for products whose audience expects a neon-noir identity.

## When NOT to use
- Productivity dashboards, admin tools, forms, or settings — those default to Quiet register even in dark mode.
- Products that must ship light-mode-first or light-mode-only.
- Long-form reading surfaces — neon accents on near-black fatigue the eye over paragraphs.
- High-trust enterprise, finance, healthcare, or accessibility-critical government surfaces.

## Palette philosophy
- Background: near-black, HSL 220-240, S 15-30%, L 4-8%. Never pure #000 — true black kills depth layering and makes shadows unreadable.
- Surface steps: raise lightness 3-5% per elevation tier (bg 6% → surface 10% → elevated 14%); borders at L 18-22%, low saturation.
- Accent discipline is the core rule: ONE neon family only. Cyan (HSL 180-195, S 95-100%, L 55-65%), green (HSL 140-160, S 90-100%, L 55-65%), magenta (HSL 310-330, S 95%, L 60-70%), or amber (HSL 35-45, S 100%, L 55-60%). Choose one; semantic colors (success/error) may borrow hues but must be desaturated 20-30% relative to the neon accent so they don't compete.
- Contrast posture: body text L ≥ 88% against the near-black base (≥7:1 preferred on dark, since dark-mode halation reduces perceived contrast); secondary text L 65-75%.
- Saturation budget: the neon accent should cover <5% of pixels — interactive elements, focus rings, key data, nothing else.

## Typography
- One family does the work: a clean grotesque or system stack for UI and body (15-16px, 1.5 line-height).
- Optional display face for H1/wordmark: a condensed or technical sans — allowed only if the brand earns it.
- Monospace for code, stats, and HUD-style labels: 12-13px, uppercase with 0.08-0.12em tracking reads authentically cyber.
- Weight contrast over size contrast: bold display (700) against regular body (400); avoid more than three weights.

## Textures & effects
- Allowed: neon glow on the single accent family only — box-shadow or text-shadow, blur 8-20px, opacity ≤50%, and only on interactive or focal elements.
- Allowed: subtle noise/grain at 2-3% opacity to keep near-black surfaces from banding; 1px accent borders on focal panels.
- Forbidden: glassmorphism, multi-hue gradient meshes, glow on large containers, glow as a substitute for border or elevation, bloom effects over text blocks.
- Accessibility warning — glowing text: glow reduces effective contrast by bleeding luminance past glyph edges. Never apply glow to text below 16px, never to body copy, and verify the base text color alone (ignoring the glow) still hits ≥4.5:1. For large display text (≥24px) with glow, require ≥3:1 on the base color plus a fallback solid state for high-contrast modes.

## Motion flavor
- Budget: 2-4 animations. Good spends: hover glow ramp (150-200ms ease-out), a status pulse on a live indicator (2s cycle, opacity only), panel enter (200ms, opacity + 4-8px translate).
- Easings: ease-out for feedback; linear only for ambient indicator pulses. No spring overshoot — bounce breaks the cyber posture.
- Off-limits: cursor-tracking glow, magnetic hover, scroll-jacking, flicker/glitch loops on anything the user must read, animated backgrounds on working surfaces.
- Reduced-motion fallback: instant state swap; kill all pulses and glows transitions.

## Layout idioms
- Full-bleed dark canvas with content column 1120-1280px; panels float as elevation steps, not as glowing cards.
- Thin 1px accent underline on active nav items instead of filled pills.
- Data/stat blocks in monospace with the neon accent reserved for the single primary metric.
- Hero: oversized display type, one accent rule or underline, generous negative space — the darkness is the texture.
- Section separation by spacing and elevation steps, not by colored bands.

## Do / Don't
- Do enforce one neon family across the entire surface — write it into the tokens.
- Do keep the neon accent under 5% of pixels; scarcity is what makes it read as neon.
- Do verify base text contrast ignoring glow, and spec a no-glow high-contrast fallback.
- Do layer depth with lightness steps (3-5% per tier), not with shadows that vanish on near-black.
- Do desaturate semantic colors so success/error don't fight the accent.
- Don't use two neon hues (cyan + magenta) unless the brief explicitly asks for synthwave — that is the retro-futuristic register.
- Don't glow body text, small labels, or whole cards.
- Don't render the accent on near-black below 4.5:1 for any interactive text.
- Don't add flicker, glitch, or scanline loops on working surfaces without an explicit brief.
- Don't ship this register without a light-mode story if the product needs one.
