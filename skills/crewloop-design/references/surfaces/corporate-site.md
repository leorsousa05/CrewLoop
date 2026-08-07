# Surface: Corporate Site

## Anatomy

Structure the site in this order; each page keeps the same header/footer shell:

1. **Header** — logo left, primary nav (About / Services / Team / Contact), one CTA button ("Request a quote", "Book a call"). Sticky on scroll with a 1px bottom border, height 64-72px.
2. **Home hero** — one headline (≤10 words), one supporting line (≤20 words), one primary CTA. Avoid stock-photo full-bleed backgrounds; prefer a solid brand color or a restrained photo with a text-safe area.
3. **Trust strip** — client logos, certifications, or association badges in a single row, grayscale by default, color on hover.
4. **Services overview** — the 3-6 core offerings, each with title, 2-line description, and a link to its detail page. Not identical icon-cards; vary weight by importance.
5. **Proof section** — one case study or testimonial block with real names, roles, and companies. Numbers beat adjectives: "reduced onboarding time by 40%" over "world-class results".
6. **About/Team teaser** — photo-led, real people, link to the full team page.
7. **Contact block** — form + direct alternatives (email, phone, address) side by side. Never hide contact behind a form alone.
8. **Footer** — sitemap columns, legal links, socials, address, company registration number where applicable.

Subpages: About (history, mission, leadership), Services detail (one page per service: scope, process steps, deliverables, FAQ), Team (grid of real photos, name, role, one-line bio), Contact (form, map, office hours).

## Density & spacing

- Base grid: 8px. Section padding: 80-120px desktop, 48-64px mobile.
- Content width: 1120-1280px container; prose blocks capped at 640-680px.
- Home sections alternate full-width bands and contained blocks — one rhythm, repeated.
- Body text 17-18px / 1.6; never below 16px for service descriptions.

## Navigation

- Top nav with at most 5 items plus CTA; deeper structure goes in the footer, not in mega-menus.
- Anchor links on the home page only if sections are long; subpage nav stays hierarchical.
- Mobile: hamburger below 768px opening a full-height panel with large (44px+) tap targets; CTA stays visible in the bar.
- Add a "back to top" only on pages longer than 4 viewports.

## Real states

- **Form loading:** submit button shows spinner and disables; never clear the form on failure.
- **Form error:** inline messages per field (not a toast), red border + text, summary anchor at top for >4 fields.
- **Form success:** dedicated confirmation block or thank-you page stating what happens next and when ("we reply within 1 business day").
- **Empty:** team grid and case studies need an empty layout if CMS content is missing — never render broken image frames.
- **404:** branded page with links to Home, Services, and Contact.

## Motion posture

- Budget: 2-3 animations site-wide. Marketing surface, so one hero entrance (single fade + 8-12px rise, 300-400ms, ease-out) is allowed; the rest is hover/focus feedback at 100-200ms.
- Logo-strip hover (grayscale → color) counts as one. A scroll-triggered counter for proof numbers is the maximum third.
- Off-limits: parallax heroes, scroll-jacking, animated gradient backgrounds, staggered section reveals on every block, spring overshoot anywhere.

## Interaction specifics

- Forms: visible labels above inputs (never placeholder-only), 44px+ field height, autocomplete attributes set, phone/email inputs use correct input types.
- Ask only what the sales team uses: name, email, company, message. Every extra field cuts conversion; justify any field beyond 5.
- Primary CTA repeats at hero, after proof, and in the footer — same label, same destination.
- Conversion flow: CTA → short form → confirmation with next-step expectation. Never route a "Contact us" click through a pricing page first.
- Team photos open a bio modal or expand inline; no hover-only reveals of names or roles.

## Default register & pairings

- Default: **Luxury / Refined** for high-consideration services (legal, finance, consulting); **Quiet / Product Default** with one brand accent for SMB and industrial firms.
- Works: Editorial for thought-leadership-heavy firms; Industrial / Utilitarian for engineering and construction companies.
- Clashes: Brutalist, Playful / Toy-like, Retro-futuristic — they undercut the trust signal this surface exists to send.

## Common pitfalls

- Stock-photo hero with a centered white headline, centered subline, and centered CTA — the #1 AI-slop signature for this surface.
- Three identical icon-cards for services, each with a generic line icon and equal visual weight.
- Purple-to-blue gradient accents or glassmorphic nav bars with no brand justification.
- Placeholder-only form labels, a single "Submit" button, and no success or error states spec'd.
- Fake trust signals: invented client logos, "500+ happy clients" counters, and testimonials with first names only — use real, verifiable proof or omit the section.
