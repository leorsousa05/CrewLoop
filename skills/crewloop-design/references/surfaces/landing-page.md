# Surface: Landing Page

A landing page has one job: move a visitor from arrival to one conversion action. Every section exists to reduce doubt or increase desire for that action.

## Anatomy

Order sections by persuasion logic, not by habit. Skip or merge any section the product cannot fill with real content.

1. **Hero** — one headline (6-12 words), one subline (15-25 words), one primary CTA. State what the product does, for whom, in plain language.
2. **Social proof strip** — logo row, key metric, or one-line quote placed immediately below the hero to answer "is this credible?".
3. **Problem** — name the pain in the user's words. 1-3 short blocks, no feature talk yet.
4. **Features** — 3-5 capabilities, each with a benefit-led heading, one sentence of proof, and a concrete visual (screenshot beats icon).
5. **How it works** — 3 numbered steps maximum. Each step = verb-led title + one sentence.
6. **Testimonials** — 2-4 quotes with real name, role, and company. One specific result per quote, not generic praise.
7. **Pricing** — 2-3 tiers, one highlighted as the default recommendation. State what is included, avoid comparison tables with 15 rows.
8. **FAQ** — 4-8 questions that answer the objections heard in sales, not marketing questions in disguise.
9. **Final CTA** — repeat the hero's promise and action. Never introduce a new offer here.

## Density & spacing

- Base grid: 8px spacing scale; section padding 96-160px desktop, 48-64px mobile.
- Content width: 1120-1280px max for text blocks; heroes may bleed full-width with an inner 1280px column.
- Body text column: cap at 60-68 characters per line even on wide sections.
- Vary density between sections — alternating full-bleed and contained sections creates rhythm; identical sections create monotony.

## Navigation

- Sticky top bar, 56-72px tall: logo left, 3-5 links center/right, primary CTA button right.
- Collapse to a hamburger below 768px; the CTA button stays visible in the collapsed bar.
- On scroll past the hero, add a background and 1px border or subtle shadow to the bar so it separates from content.
- Anchor links to sections; active-section highlighting is optional, not required.

## Real states

- **Loading:** skeleton or content-first render for the hero; lazy-load below-fold images with stable aspect-ratio boxes to prevent layout shift.
- **Empty:** the newsletter/waitlist form needs a "already subscribed" and a "check your email" state.
- **Error:** inline form errors (never alert-style toasts for validation); a visible fallback if the hero image or video fails — headline and CTA must work without media.
- **Success:** inline confirmation on form submit, not a redirect to a dead thank-you page unless analytics require it.

## Motion posture

Landing pages are a marketing surface, so motion is allowed — but stay within the skill's diet: 3-4 animations total, each justified.

- Earned: one hero entrance (fade + 12-20px rise, 300-500ms, ease-out), section reveals only if the page is long and reads as narrative.
- Feedback: CTA hover/press at 100-200ms, `transform`/`opacity` only.
- Off-limits: scroll-jacking, cursor parallax/glow/magnetic hover (unless briefed), looping decorative animation, animated gradients, animating layout properties.
- Every animation gets a `prefers-reduced-motion` instant-swap fallback.

## Interaction specifics

- One conversion goal per page. Map the flow: hero CTA → final CTA must trigger the same action (signup, demo, download).
- Forms: 1-3 fields maximum above pricing; label above field (never placeholder-only labels); submit button states (default/loading/success/error) spec'd.
- Scroll behavior: native scroll; never hijack. Sticky elements limited to the nav and, at most, one sticky CTA.
- A sticky bottom CTA earns its place only when: the page is long (6+ sections), the primary action is a single low-friction step (e.g. "Get started free"), and it appears only after the hero scrolls out of view. Never stack it on mobile forms or cookie banners.

## Default register & pairings

- **Default:** Linear-like Minimalist for SaaS/dev products; Bento Grid / Modular for information-dense product pages.
- **Works:** Editorial for content-led products; Organic / Natural for wellness/food; Playful / Toy-like for consumer apps; Luxury / Refined for high-consideration services.
- **Clashes:** Quiet / Product Default alone makes a landing page read as a tool, not a pitch — use it only for docs-style product pages. Brutalist clashes with trust-heavy products (fintech, health). Retro-futuristic clashes with conservative B2B audiences.

## Common pitfalls

- Purple-to-blue gradient hero on off-white with a floating 3D blob — the AI-slop signature; derive the palette from the brand instead.
- Three identical feature cards with abstract icons in a symmetric grid, all equal weight.
- Centered-everything: centered hero, centered logos, centered features, centered CTA — no composition, no hierarchy.
- Generic copy that any competitor could ship ("Supercharge your workflow", "Seamless and intuitive") with no product-specific nouns.
- Scroll-triggered staggered reveal on every section, plus a cursor glow, plus an animated gradient — motion budget blown on decoration while the form has no error state.
