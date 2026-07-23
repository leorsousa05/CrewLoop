# Register: Luxury / Refined

Premium, high-consideration surfaces. Value is communicated through space, restraint, and precision — never through ornament.

## When to use

- High-consideration purchases and services: private banking, real estate, hospitality, fashion, jewelry, concierge.
- Brand sites where trust and exclusivity outweigh conversion speed.
- Invitation, pricing, or membership pages for premium tiers.

## When NOT to use

- Tools, dashboards, onboarding wizards, settings — thin weights and sparse layouts hurt task speed; use Quiet.
- Mass-market consumer products that need approachability and energy.
- Content-heavy or data-dense surfaces — extreme whitespace starves real information.

## Palette philosophy

Near-monochrome plus one metallic accent used like jewelry — small and deliberate.

- Background: ivory `hsl(40-50, 10-25%, 95-98%)` or true near-black `hsl(0-260, 0-8%, 6-10%)`. Pick one mood per surface; never both on one page.
- Text: soft black `hsl(0-30, 5-10%, 12-18%)` on ivory; warm off-white `hsl(40-50, 10-20%, 88-94%)` on near-black. Avoid pure #000/#FFF pairings.
- Metallic accent: gold/champagne `hsl(40-48, 25-45%, 45-60%)` or muted bronze `hsl(28-36, 20-35%, 38-50%)`. Budget: under 5% of pixels on any screen.
- Contrast posture: high but soft — body ≥7:1, achieved with lightness contrast, not saturation. Saturation above 50% anywhere is a red flag.

## Typography

Thin, quiet, precisely spaced. Text is set, not placed.

- Display: high-contrast serif (Didot/Playfair class) or refined light grotesque — 48-96px, weight 300-400, line-height 1.0-1.15, letter-spacing -0.01 to 0.02em.
- Body: 16-18px, weight 300-400, line-height 1.6-1.8, measure 55-68ch. Short copy is the norm — edit ruthlessly.
- Labels/nav: small caps or uppercase, 11-13px, weight 400-500, letter-spacing 0.12-0.25em.
- Numbers and prices: tabular or old-style figures at weight 300; let size, not weight, carry importance.
- Never use bold (700+) as the primary emphasis tool — use size, space, or the metallic accent instead.

## Textures & effects

- Allowed: 1px hairline rules at 10-20% opacity, flat metallic color on rules/icons/key words, generous negative space, full-bleed photography with quiet overlays.
- Forbidden: gradient "gold foil" text, shimmer animations, glow, glassmorphism, noise, heavy shadows, bevels, ornamental dividers, stock-luxury clichés (marble textures, scripted monograms everywhere).
- Metallics render as flat color only — a gradient pretending to be metal reads as costume.

## Motion flavor

Slow, minimal, and gravity-free. Motion should feel like a door opened by staff, not a mechanism.

- Budget: 1-3 animations per interface, each communicating arrival or transition — nothing decorative.
- Tempo: 300-600ms (slower than the 100-200ms UI feedback norm), gentle ease-out such as `cubic-bezier(0.22, 1, 0.36, 1)`, `opacity` + small `translateY` (8-16px) only.
- Allowed: a single slow hero fade-in on first load; crossfades between gallery imagery; slow hover fades (200-300ms) on links.
- Off-limits: spring/bounce overshoot, parallax, cursor-following effects, scroll-jacking, looping shimmer or sparkle, staggered cascades. Nothing moves without a user or a page change.
- Reduced-motion fallback: instant swap, always.

## Layout idioms

- Centered single-statement hero: one headline, one line of support, one understated CTA, 40-60% of the viewport left empty.
- Wide-margined single column with content occupying the center 50-65% of the viewport width.
- Asymmetric editorial pairing: full-height image on one side, sparse text block vertically centered on the other.
- Gallery rhythm: large imagery separated by 120-200px of empty space, never a tight grid.
- Minimal nav: 4-6 items, small caps, no dropdown chrome, logo centered or small-left.
- Detail pages (property, product, suite): spec list as hairline-separated rows, not cards.

## Do / Don't

Do:
- Leave at least 40% of every viewport empty — whitespace is the primary material.
- Set the metallic accent in flat color on at most one element per screen section.
- Use 1px hairlines and small caps to structure content instead of boxes and fills.
- Budget 300-600ms for the few allowed transitions and keep them to opacity/translate.
- Edit copy down before designing — sparse layouts expose every unnecessary word.

Don't:
- Don't use gradient gold text, shimmer, or sparkle effects — costume luxury.
- Don't fill space with cards, badges, or feature grids when the page feels empty.
- Don't use weights above 500 for display type or bold as default emphasis.
- Don't add parallax, cursor effects, or scroll-jacking — luxury motion is slow and user-initiated.
- Don't mix ivory and near-black moods on the same page, or pair with saturated accent colors.
