# Surface: Portfolio Showcase

A portfolio converts through evidence, not persuasion copy. The work is the content; the layout is a frame. Design for a reviewer who scans for 30 seconds and clicks one project.

## Anatomy

1. **Hero / intro** — name, role, one positioning sentence (10-20 words), and a primary action (view work or contact). No taglines like "passionate about creating experiences".
2. **Selected work grid** — 4-8 projects, best first. Each card: one strong image, project title, one-line scope ("Brand + web, 2024"). Never show every project ever made.
3. **Case study pages** (one per featured project) — follow this order:
   - Header: title, role, team, timeline, one-sentence summary.
   - Context/problem: 2-3 sentences on the client need.
   - Process: 3-5 steps with real artifacts (sketches, iterations, decisions) — not stock process diagrams.
   - Outcome: measurable result or concrete deliverable, stated honestly.
   - Next-project link at the bottom.
4. **About** — photo or portrait, 3-5 sentences of bio, skill/tool list, and career highlights. Facts over adjectives.
5. **Contact** — one clear action: email link or a 2-3 field form. Social links as secondary, never as the only option.
6. **Footer** — minimal: name, year, location, socials.

## Density & spacing

- Image-led: project thumbnails at 4:3 or 3:2 aspect ratio, full-bleed within the content column; whitespace around images, not inside them.
- Base grid: 8px spacing scale; case-study text column 640-720px wide even when images span 1120-1280px.
- Section padding 80-120px desktop, 40-56px mobile.
- Let image sizes vary within a grid row (one large + two small) to create hierarchy; equal-size grids flatten the best work.

## Navigation

- Minimal top bar (48-64px): name/logo left, 2-3 links right (Work, About, Contact).
- No hamburger on desktop; below 768px keep links inline if they fit (they usually do at 3 items), otherwise a simple disclosure menu.
- On case-study pages, add a persistent "back to work" or next/previous project control at the end of the page.

## Real states

- **Loading:** image placeholders with fixed aspect-ratio boxes so the grid never shifts while images load; lazy-load below the fold.
- **Empty:** the work grid needs a "work in progress / available for projects" state if projects are few — a half-empty grid reads as unfinished.
- **Error:** image fallback with project title text if an asset fails; contact form inline errors, never a bare "something went wrong".
- **Success:** contact form confirms inline and keeps the sender's message visible.

## Motion posture

Portfolios are expressive surfaces, but the motion diet still applies: 3-4 justified animations.

- Earned: thumbnail hover feedback (scale 1.02-1.04 or caption fade, 150-250ms, ease-out), a single page/hero entrance, image crossfade on case-study galleries.
- Off-limits: cursor parallax, magnetic hover, glow trailing the pointer (unless briefed), scroll-jacking between case-study sections, autoplaying video heroes with sound, WebGL shader backgrounds that fight the work.
- `prefers-reduced-motion`: instant swaps everywhere.

## Interaction specifics

- The grid is the primary navigation: click target = the whole card, not just the title link.
- Case-study galleries: click-to-enlarge lightbox or in-flow large images — pick one; keyboard esc/arrow support in lightboxes.
- Contact form: 2-3 fields (name, email, message), labels above fields, visible focus rings, and a submit loading state.
- Gestures: swipe between lightbox images on touch devices; never require hover to reveal a project title (hover-only interactions fail on touch).

## Default register & pairings

- **Default:** Editorial / Magazine — strong type hierarchy and generous whitespace let the work lead.
- **Works:** Luxury / Refined for high-end studios and photographers; Brutalist for opinionated designers and art directors; Linear-like Minimalist for product designers showing UI work.
- **Clashes:** Quiet / Product Default makes a portfolio read as an internal tool; Playful / Toy-like undermines credibility for B2B clients; Futuristic Glassmorphic buries images under decorative depth.

## Common pitfalls

- Fullscreen autoplay video or WebGL hero that hides the actual work for 5+ seconds — spectacle over evidence.
- Equal-size grid of 12+ projects with tiny thumbnails and no hierarchy — nothing is selected, so nothing is strong.
- Case studies with no process or outcome: three polished mockups and zero explanation of what the designer actually did.
- Cursor-following custom cursor, skew-on-scroll text, and marquee tickers stacked together — the AI-slop template portfolio.
- Contact hidden behind a "let's talk" modal, a dead form, or only social links — the one conversion action of the surface is broken.
