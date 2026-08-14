# spec-012-docs-migration-to-react

---
name: spec-012-docs-migration-to-react
domain: 03-docs
status: completed
created: 2026-06-25
completed: 2026-06-25
supersedes: []
---

# Docusaurus Docs Migration to React + Tailwind

## Objective

Replace the Docusaurus documentation site with a custom Vite + React + Tailwind SPA featuring a premium dark-mode landing page, a markdown-driven docs reader, and interactive skill/dashboard visualizations.

## Context

- Tech stack: see `shared/tech-stack.md` (Vite + React 19 + Tailwind 3.4, hash routing, GitHub Pages deploy).
- Superseded by spec 024 (docs-quiet-console-restyle) for the final design system; this spec covers the migration mechanics.
- Related: `shared/architecture-overview.md` §Docs Site.

## Requirements

1. Remove all Docusaurus dependencies from the `docs/` workspace and install the Vite React setup with Tailwind CSS, TypeScript, and Markdown parsing dependencies.
2. Landing page: brand-focused intro about CrewLoop with active-skills flow and dashboard concepts.
3. Docs page: sidebar category-based navigation + markdown rendering panel with syntax highlighting, clean styling, responsive layout.
4. Interactive components showcasing `assets/screenshots/skill-active.png` and `assets/screenshots/dashboard-overview.png`.
5. Preserve markdown as the source of truth — all documentation files stay in standard markdown format.
6. Follow modern web design principles: curated color palettes, elegant typography, dark mode by default, glassmorphic cards, micro-animations.
7. Responsive layout from desktop to mobile.
8. Solid TypeScript typing for sidebar navigation, frontmatter metadata, and components.
9. Keep referencing existing images in `assets/screenshots/` and `assets/images/`.

## Behavior / Flow

1. `npm run build` in `docs/` runs `tsc -b && vite build` and produces a static bundle served from `docs/dist`.
2. Hash router (`#/` landing, `#/docs/<id>` reader) loads markdown at runtime from `public/` per `sidebarConfig.ts`.
3. Markdown renders through `react-markdown` + `remark-gfm`; mermaid diagrams render via theme-aware initialization.

## Constraints

- Do not convert markdown content files to another format.
- Do not modify the skills' markdown payloads.
- Design tokens must stay in `index.css` / Tailwind config (no inline hex literals in components).

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Missing markdown file for a route | DocsLayout renders a 404 state with a ghost Retry action |
| Sidebar item without a docs path | Filtered out of navigation; config schema validates `DocItem` |
| Mobile viewport | Sidebar collapses into an off-canvas sheet; burger menu toggle |
| FOUC on theme flip | Inline anti-FOUC script in `index.html` reads stored theme before first paint |
| Mermaid after theme switch | Diagrams re-initialize with `getMermaidTheme(mode)` deferred one `requestAnimationFrame` |

## Acceptance Criteria

- AC-01: Given the repo root, `docs/` contains a Vite config and no Docusaurus config files (`docusaurus.config.js`, `sidebars.js`, `.docusaurus/` absent).
- AC-02: Given `docs/`, `npm run build` succeeds and produces `docs/dist/` with no type errors.
- AC-03: Given the docs site, the landing page renders the hero with the CLI copy widget and the SkillVisualizer flow diagram.
- AC-04: Given a markdown docs route, the reader renders headings, code blocks with syntax highlighting, and mermaid diagrams.
- AC-05: Given `sidebarConfig.ts`, all categories from the original `sidebars.js` mapping exist and each `DocItem` resolves to a real `.md` file in `public/`.
- AC-06: Given the responsive breakpoints, the docs reader sidebar collapses into an off-canvas sheet below the `md` breakpoint.

## Done When

- [x] AC-01 — verified by file listing (`ls docs/` shows no docusaurus config)
- [x] AC-02 — verified by `npm run build` PASS in `docs/`
- [x] AC-03 — verified by manual landing page walkthrough
- [x] AC-04 — verified by manual reader walkthrough on both themes
- [x] AC-05 — verified by `npm run build` (sidebar config type-checked)
- [x] AC-06 — verified by manual mobile viewport walkthrough
