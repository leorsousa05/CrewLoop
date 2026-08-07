# Register: Corporate Professional

## When to use
- Enterprise SaaS, B2B platforms, banking/fintech, insurance, legal, government, procurement portals.
- Audiences who buy on trust and risk reduction: procurement teams, compliance officers, CFOs, IT admins.
- Products evaluated in a vendor comparison spreadsheet, not on a landing-page wow factor.
- Any surface where predictability itself is the value proposition ("this will not surprise me").

## When NOT to use
- Developer tools, creative products, or consumer apps that need energy or personality.
- Early-stage startups whose differentiation depends on looking unlike incumbents.
- Marketing campaigns or launches that need memorability over reassurance.
- Any brief asking for "bold," "disruptive," or "playful" — pick another register instead.

## Palette philosophy
- Anchor on conservative blues: primary hue 210–225, saturation 45–70%, lightness 35–50% for the accent (e.g. `hsl(214, 60%, 42%)`).
- Neutrals carry 90% of the surface: cool grays with a blue tint (hue 215–225, saturation 5–15%), from `hsl(220, 13%, 98%)` backgrounds to `hsl(222, 25%, 15%)` text.
- One accent family only. Status colors (success/warning/error) stay muted: desaturate 10–20% below their usual vivid defaults.
- Contrast posture: high and boring. Body text ≥ 4.5:1 always; never use mid-gray text under 14px.
- Forbidden here: gradients of any kind, neon or saturated secondary hues, purple, and "brand refresh" teal.

## Typography
- One sans family across everything — humanist or neo-grotesque (system stack, or Inter/Source Sans/IBM Plex Sans class).
- Sizing posture: restrained scale. H1 28–32px, H2 20–24px, body 15–16px. No display sizes above 40px even on marketing pages.
- Weights: 400 body, 500–600 headings, 600 buttons. Never go above 700; never use light weights below 16px.
- Line-height 1.45–1.6 for body; 1.2–1.3 for headings. Sentence case for headings; reserve ALL CAPS for 11–12px labels with +0.04em tracking.

## Textures & effects
- Allowed: 1px borders (`hsl(220, 13%, 88%)`-class), flat fills, one subtle elevation level (soft shadow, ≤8px blur, ≤8% opacity) for cards and popovers.
- Allowed: real photography with art direction — actual people at actual work, genuine environments, muted color grading.
- Forbidden: generic stock clichés (handshakes, suits pointing at whiteboards, "diverse team laughing at laptop"), abstract 3D shapes, glassmorphism, noise/grain overlays, drop-shadow stacks, glows.

## Motion flavor
- Posture: near-zero. Budget 0–3 transitions; an empty motion table is the correct default deliverable.
- Allowed: hover/press feedback 100–150ms ease-out, modal/popover enter 150–200ms opacity + 4–8px translate, form validation fades.
- Off-limits: spring/bounce overshoot, page-load reveal cascades, scroll-triggered section animations, cursor-driven effects, animated counters, looping hero video behind text.
- Every animation ships a reduced-motion instant-swap fallback.

## Layout idioms
- 12-column grid, 1200–1280px max content width, generous gutters (24–32px), 8px spacing base.
- Persistent top bar + left sidebar for app shells; sidebar 240–280px, never collapsible-by-surprise.
- Marketing pages: hero with left-aligned text and right-aligned product screenshot, then predictable sections (logos, features, proof, CTA) in a strict vertical rhythm.
- Data-dense screens: full-width tables with sticky headers, filter bar above, pagination below — no cards-in-cards.
- Forms: single column, 480–640px wide, labels above inputs, primary action bottom-left of the form.

## Do / Don't
- Do reuse the same page template everywhere — predictability is the feature, not a failure of imagination.
- Do show real product UI in screenshots instead of abstract illustrations.
- Do keep the logo row, testimonial, and security/compliance badges (SOC 2, ISO) visible on trust surfaces.
- Do spec every real state (loading skeletons, empty tables, permission-denied views) — enterprise users hit them daily.
- Do use restrained iconography from one established set at 16–20px.
- Don't use gradient heroes, oversized display type, or mascot illustrations to "modernize" the brand.
- Don't use generic stock photos; commission or curate photography with consistent grading, or use none.
- Don't invent novel navigation patterns; enterprise users relearn nothing.
- Don't hide destructive or admin actions behind hover-only reveals.
- Don't ship a dark mode with inverted-brand colors; dark mode uses the same blue accent at adjusted lightness.
