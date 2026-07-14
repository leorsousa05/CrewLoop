# Proposal: Docs Site Quiet Console Restyle

## Motivation

The dashboard and the docs site are the two public faces of CrewLoop, and today they speak two different visual languages. The dashboard was redesigned under spec 023 ("Quiet Console" — graphite surfaces, one indigo pulse, mono typography, hairline panels) and explicitly rejected glassmorphism, decorative gradients, neon glows, and hero gimmicks. The docs site is still exactly that rejected style: dark-only neon cyan/violet, glass cards, glow animations, an isometric/typewriter landing page, and a violet-vs-cyan accent split between navbar and content.

The user's directive for this change: the docs site must adopt the dashboard's style so the product reads as one coherent system. This also supersedes the never-implemented `docs/specs/changes/001-docs-redesign` (warm editorial "field guide" direction) — the newer directive takes precedence, while that spec's scope inventory and constraints are carried forward where still valid.

## Scope

Restyle every visual surface of the docs SPA (`docs/`, Vite + React 19 + Tailwind 3):

- Design token layer: `docs/src/index.css` + `docs/tailwind.config.js`
- Light + dark theme support with a persisted toggle (site is dark-only today)
- App shell and navbar: `docs/src/App.tsx`, `docs/index.html`
- Landing page: `docs/src/components/LandingPage.tsx` plus its supporting visuals `SkillVisualizer.tsx` and `TerminalSimulator.tsx`
- Docs reader: `docs/src/components/DocsLayout.tsx`
- Markdown presentation: `docs/src/components/MarkdownRenderer.tsx` (typography, alerts, tables, code blocks, Mermaid frames)
- Stale documentation: root `AGENTS.md` still describes `docs/` as a Docusaurus site

## Goals

- Port the "Quiet Console" design system 1:1 at the token level (same CSS variable names and values as `servers/dashboard/ui/src/styles/index.css`, both themes) so the two apps can never silently drift.
- Replace glass/glow/gradient treatments with hairline panels and the single-indigo accent discipline (accent only for live, selected, focus, primary actions).
- Adapt console density to a reading context without inventing a second design language (exact type/reading decisions belong to the Designer's `design-ui.md`).
- Add light theme support using the same mechanism class strategy as the dashboard (`html.light` overrides; dark remains the default).
- Keep the site responsive, keyboard accessible, and reduced-motion safe, matching the dashboard's verified rules.

## Non-goals

- No content rewrite of the 31 markdown docs under `docs/public/docs/`.
- No routing, build, or deployment changes (hash routing, `base: '/CrewLoop/'`, and `deploy.yml` stay as-is).
- No new runtime dependencies — Tailwind 3.4, Phosphor icons, react-markdown, and mermaid already cover the need.
- No brand/logo redesign.
- No changes to `servers/` or `packages/` code.

## Constraints

- Preserve hash-based routing behavior (`#/docs/<id>`) and all existing docs content.
- Preserve `TerminalSimulator`'s observable behavior covered by its existing test (copy/timing), unless the Designer explicitly changes it — then the test is updated in the same change.
- Mermaid diagrams must remain legible in BOTH themes (today they are hard-wired to theme `'dark'`).
- Token names and values must match the dashboard verbatim; where the docs needs tokens the dashboard does not have (e.g. prose-specific values), they must be derived from dashboard tokens, not invented ad hoc.
- `AGENTS.md` root must be corrected to describe `docs/` as a Vite + React + Tailwind SPA (it currently says Docusaurus).
