# Design

## Architecture overview

The restyle mirrors the dashboard's token architecture exactly, so both apps share one design language at the variable level:

```
docs/
├── index.html                     # MODIFIED: anti-FOUC theme script; drop hard-coded body bg
├── tailwind.config.js             # MODIFIED: token→CSS-var mapping (1:1 with dashboard config pattern)
├── src/
│   ├── index.css                  # MODIFIED: dashboard token layer + component classes (replaces glass/neon layer)
│   ├── App.tsx                    # MODIFIED: console-style navbar + ThemeToggle mount
│   ├── hooks/
│   │   └── useTheme.ts            # NEW: theme state, persistence, html class application
│   ├── components/
│   │   ├── ThemeToggle.tsx        # NEW: Sun/Moon toggle button (navbar)
│   │   ├── LandingPage.tsx        # MODIFIED: full visual restyle (structure/content preserved)
│   │   ├── DocsLayout.tsx         # MODIFIED: reading-desk restyle on tokens
│   │   ├── MarkdownRenderer.tsx   # MODIFIED: token-based prose, semantic alert panels, per-theme Mermaid
│   │   ├── SkillVisualizer.tsx    # MODIFIED: restyle
│   │   ├── TerminalSimulator.tsx  # MODIFIED: restyle (behavior preserved)
│   │   └── tests/
│   │       └── TerminalSimulator.test.tsx  # MODIFIED only if observable copy/timing changes
│   ├── sidebarConfig.ts           # unchanged
│   └── ...                        # unchanged
└── public/docs/**                 # unchanged (31 markdown pages)
```

**Pattern: token-driven theming (same as spec 023).** All visual decisions live in CSS custom properties; Tailwind config maps utilities to those variables; components consume utilities and component classes only. After migration, no component may carry color literals (hex/rgb/hsl/hsla) — the Engineer sweeps for them at the end, exactly like spec 023 Phase 6.

**Theme strategy: class-based, dark default (same as dashboard).** `:root` carries the dark token set; `html.light` overrides the light values. An inline script in `index.html` reads `localStorage['crewloop-docs-theme']` and applies `document.documentElement.classList` before the body renders — no flash of wrong theme. Absent a stored value, the default is `dark` (preserves current behavior; the dashboard likewise defaults dark).

## [Padrões Aplicados]

- **Design-system mirroring (single source of truth):** token names and values are copied verbatim from `servers/dashboard/ui/src/styles/index.css` (both themes) rather than re-derived. Justification: the explicit goal is "same style as the dashboard"; any reinterpretation recreates the drift problem this change exists to kill. Docs-only needs (prose measure, link treatment) are layered *on top of* the shared tokens, never replacing them.
- **Token-driven theming:** all color/type decisions as variables and component classes (`.panel`, `.label`, `.chip`, `.btn-primary`, `.btn-ghost`, `.kbd`), no one-off utility clusters. Carried from spec 001's sound instinct and proven in spec 023.
- **Progressive enhancement for theme:** the site works fully without JS-driven theming (dark default in pure CSS); the toggle is an enhancement layered via `useTheme`. The anti-FOUC script is the only render-critical JS addition and is 10 lines of inline, dependency-free code.
- **Strategy pattern (Mermaid):** theme-specific Mermaid config selected from the active theme at render time (`getMermaidTheme(mode)`) instead of a hard-wired constant — the only place where presentation must branch on theme beyond CSS.
- **Accessible motion restraint:** transform/opacity only, 150–250ms, `cubic-bezier(0.25, 1, 0.5, 1)` entrances, global reduced-motion dampener — verbatim from the dashboard.
- **Structural honesty:** no new routes, no new data sources, no duplicated navigation registries; the shell keeps its current two-mode structure (landing vs. docs reader).

## [Estratégia de Implementação]

Ordered phases (sequential — shared token chokepoint, same reasoning as spec 023):

1. **Token layer.** Rewrite `docs/src/index.css` with the dashboard token set (`:root` dark, `html.light` overrides, spacing, radii, shadows, type scale, component classes, focus ring, reduced-motion block, scrollbar styling). Rewrite `docs/tailwind.config.js` to map colors and the named font scale to the variables (`darkMode: 'class'`). Fix `docs/index.html` (remove `bg-[#020617]`, add anti-FOUC script). At the end of this phase the site will look broken in places — expected; later phases fix each surface.
2. **Theme infrastructure.** `useTheme.ts` + `ThemeToggle.tsx`; wire the toggle into `App.tsx`'s navbar. Verify class flips and persistence manually.
3. **Shell.** Restyle `App.tsx` navbar (hairline, surface bg, indigo selected, Terminal chip kept but token-colored).
4. **Landing.** Restyle `LandingPage.tsx` section by section per `design-ui.md`; then `SkillVisualizer.tsx` and `TerminalSimulator.tsx`.
5. **Docs reader.** Restyle `DocsLayout.tsx` (sidebar, search, states, footer nav).
6. **Markdown.** Rebuild `MarkdownRenderer.tsx` prose overrides, alert panels, code treatment, per-theme Mermaid.
7. **Sweep + docs.** Literal-color sweep across `docs/src/**` (no hex/rgb/hsl outside `index.css` and theme configs); update root `AGENTS.md`; update `specs/living/docs/` with the new design system summary.

**Data flow:** unchanged. `App.tsx` owns `currentRoute` from the hash; `DocsLayout` fetches markdown from `public/docs/`. The only new state is `theme` (`useTheme`), which flows: `localStorage` ↔ `useTheme` → `documentElement.classList` + `ThemeToggle` aria-pressed + Mermaid re-init key in `MarkdownRenderer`.

**Error handling / resilience:** no new failure modes. The anti-FOUC script is wrapped so a `localStorage` failure (private mode) silently falls back to dark. Mermaid re-initialization on theme change reuses the existing error boundary behavior.

## Contracts

```ts
// docs/src/hooks/useTheme.ts
type ThemeMode = 'light' | 'dark';

interface UseThemeResult {
  theme: ThemeMode;
  toggleTheme: () => void;
}

// localStorage contract
const THEME_STORAGE_KEY = 'crewloop-docs-theme'; // values: 'light' | 'dark'
```

```ts
// docs/src/components/ThemeToggle.tsx
interface ThemeToggleProps {
  className?: string; // layout hook for navbar placement; visuals come from tokens
}
// Button contract: aria-label="Switch to <other> theme", aria-pressed={theme === 'light'}
```

```ts
// docs/src/components/MarkdownRenderer.tsx (internal, per-theme Mermaid)
function getMermaidTheme(mode: ThemeMode): {
  theme: 'dark' | 'default';
  themeVariables: Record<string, string>; // derived from the active CSS variables
};
```

Existing component prop contracts (`LandingPage`, `DocsLayout`, `SkillVisualizer`, `TerminalSimulator`, `MarkdownRenderer`) are unchanged — this is a presentation-only delta.

## Test plan

- **Existing:** `docs/src/components/tests/TerminalSimulator.test.tsx` must stay green; update it only if the Designer changes observable copy/timing (record the change in tasks.md).
- **Theme:** unit-testable surface is tiny by design (inline script + class toggle). Cover `useTheme` with a small hook test if the project already runs component tests (it does — vitest + RTL is present for TerminalSimulator): default is dark, toggle flips and persists, stored value wins on mount.
- **Build gate:** `npm run build` in `docs/` (tsc + vite) must pass; `npx oxlint` clean.
- **Manual (Reviewer checklist, same rigor as spec 023):** both themes × landing + docs reader; Mermaid legibility in both themes; focus rings on all interactive elements; reduced-motion run; mobile layouts for navbar/sidebar/markdown; no theme flash on reload.

## Risks and trade-offs

- **Landing page bulk.** `LandingPage.tsx` (676 lines) plus two bespoke visual components carry most of the old style; the restyle is real work there, and the Designer may cut interactive gimmicks the old page relies on. Mitigation: structure and copy are preserved; only presentation changes.
- **Mono body for long-form reading.** The dashboard's 13px JetBrains Mono body is an identity anchor for a console but may hurt prose readability. Deferred to the Designer (`design-ui.md` must decide the reading face and prose measure; if a sans body is chosen for prose, Plus Jakarta Sans stays and the decision is recorded as a deliberate docs-only deviation).
- **Prose contrast in light theme.** The dashboard's verified contrast table covers UI chrome, not long-form prose; the Designer must re-verify body/link/code contrast for the reading context in both themes.
- **Mermaid per-theme re-init** can flash diagrams on theme toggle; acceptable (theme change is a deliberate user action), but the re-render must not lose scroll position.
- **AGENTS.md drift** is fixed here, but `docs/AGENTS.md`-style local guidance does not exist; out of scope to create.

## Subagent parallelization analysis

Not suitable: the token layer (`index.css`, `tailwind.config.js`) is a shared chokepoint for every surface, and phases must land in order (tokens → theme infra → shell → surfaces), identical to the decision recorded in spec 023. Sequential phases by the Engineer.

## Requirement traceability

Addressed:

- Full restyle of all surfaces (navbar, landing, docs layout, markdown renderer, supporting components)
- Dashboard token port, light + dark, single-indigo discipline, hairline treatment, motion rules
- Visual-only scope (31 markdown pages untouched)
- No new dependencies; existing deploy workflow preserved
- `AGENTS.md` staleness corrected

Deferred:

- Body/reading-face decision and prose measure → Designer (`design-ui.md`)
- Content rewrite of docs (non-goal)
- Brand/logo redesign (non-goal)
