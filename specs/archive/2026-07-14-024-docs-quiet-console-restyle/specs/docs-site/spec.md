# Spec Delta: docs-site

Delta vs. the current docs SPA (`docs/`, commit `3a26307`). All changes are visual/presentation; no behavioral contracts change except the ADDED theme capability.

## ADDED

- **Light theme support.** `html.light` token overrides mirroring the dashboard's light theme values verbatim; dark stays the default (`:root`). Theme choice persists in `localStorage` and an inline anti-FOUC script in `docs/index.html` applies the class before first paint.
- **Theme toggle.** `ThemeToggle` component in the navbar (Phosphor `Sun`/`Moon`, already a dependency), driven by a small `useTheme` hook.
- **Token architecture parity.** The same CSS variable names/values as the dashboard (backgrounds, borders, text, accent family, status colors, overlay, spacing, radii, shadows, type scale, leading) so future design changes can be copied between apps without translation.
- **Component classes ported from the dashboard** as needed by the restyled surfaces: `.panel`, `.panel-live`, `.label`, `.kbd`, `.chip`/`.chip-active`, `.btn-primary`, `.btn-ghost`, `.scrollbar-hide`, `.font-display`, `.font-mono`, `.tabular`, `.shadow-popover`, `.shadow-modal`.
- **Global focus ring and reduced-motion kill-switch** identical to the dashboard's (`*:focus-visible` 2px `--focus` outline; `@media (prefers-reduced-motion: reduce)` global dampener).

## MODIFIED

- **`docs/tailwind.config.js`** — replace the cyan/violet/glass token set with the dashboard's color→CSS-var mapping and named `fontSize` scale (`display-2xl`…`micro`); register only the animations the restyle actually uses (dashboard set: `pulse`, `slide-in`; component-layer keyframes from `index.css` as needed). `darkMode: 'class'`.
- **`docs/src/index.css`** — replace glass tokens (`.glass-card*`, `--color-glass-*`, isometric utilities, `hover-spring-physics`, `skeleton-shimmer` keyframes, neon scrollbar) with the dashboard token layer and component classes. Font imports reduced to the dashboard families (Space Grotesk + JetBrains Mono); the body-family question (mono vs a reading face for prose) is decided in `design-ui.md`.
- **`docs/index.html`** — remove the hard-coded `bg-[#020617]` body class; add the anti-FOUC theme script.
- **`docs/src/App.tsx`** — navbar restyled to hairline console treatment (surface bg, 1px bottom border, indigo selected state, `ThemeToggle` on the right); the violet accent split disappears.
- **`docs/src/components/LandingPage.tsx`** — full restyle per `design-ui.md`: glass cards → hairline panels; glow/isometric/typewriter treatments re-evaluated against Quiet Console rules (structure and content stay; presentation changes).
- **`docs/src/components/DocsLayout.tsx`** — sidebar, search, breadcrumb, skeleton, error card, and footer-nav restyled to the token system; violet active state → indigo selected discipline.
- **`docs/src/components/MarkdownRenderer.tsx`** — `prose-*` override string rebuilt on dashboard tokens; alerts become hairline semantic panels (colors from `--success`/`--warning`/`--error`/`--running`); code "terminal" header kept as a concept but restyled (inset bg, hairline border, no neon); Mermaid initialized per active theme instead of hard-wired `'dark'`.
- **`docs/src/components/SkillVisualizer.tsx` / `TerminalSimulator.tsx`** — restyled to the same language; TerminalSimulator keeps its tested behavior.
- **`AGENTS.md` (root)** — `docs/` description corrected from "Docusaurus site" to "Vite + React + Tailwind SPA deployed to GitHub Pages" wherever it appears (structure tree, technology table, build table if present).

## REMOVED

- Glassmorphism system: `.glass-card`, `.glass-card-interactive`, `.glass-card-3d`, `--color-glass-bg`, `--color-glass-border`, `--glass-blur-amount`.
- Neon/glow decorations: `glow-pulse`, `glow-drift`, cyan `rgba(6,182,212,…)` effects, isometric utilities, `hover-spring-physics`.
- The violet/cyan dual-accent split (navbar violet vs. landing cyan) — one indigo accent everywhere.
- Hard-coded dark-only assumptions: `bg-[#020617]` on `<body>`, Mermaid theme `'dark'` constant.
- Plus Jakarta Sans (pending Designer confirmation in `design-ui.md`; if a sans reading face is kept, it stays — decision recorded there).

## Out of scope (unchanged)

- `docs/public/docs/**` markdown content (31 pages), `docs/src/sidebarConfig.ts` data, hash routing, `docs/vite.config.ts`, `docs/postcss.config.js`, `.github/workflows/deploy.yml`, and all code outside `docs/` + `AGENTS.md`.
