# Living Spec: Docs Site (`docs/`)

> Merged source of truth for the documentation site subsystem. Last merged: spec 024 (`024-docs-quiet-console-restyle`), which superseded `docs/specs/changes/001-docs-redesign` and the previous neon/glass design described here.

## Stack & Shape

- **Vite + React 19 + Tailwind 3.4 SPA** (not Docusaurus). Hash routing: `#/` (landing) and `#/docs/<id>` (reader). Built with `npm run build` in `docs/` (`tsc -b && vite build`), deployed to GitHub Pages from `docs/dist` via `.github/workflows/deploy.yml`.
- Markdown content is fetched at runtime from `public/` per `sidebarConfig.ts`; `react-markdown` + `remark-gfm` render it; `mermaid` renders diagrams.
- No test runner is installed (vitest/RTL absent). `docs/src/components/tests/TerminalSimulator.test.tsx` exists but cannot run; verification = `npm run build` + `npm run lint` (oxlint).

## Design System — "Quiet Console" (shared with the dashboard)

The docs site uses the **same design tokens as the dashboard**, verbatim, defined in `docs/src/index.css`:

- **Themes:** dark is the default (`:root`); light overrides live under `html.light`. Tokens: backgrounds (`--bg-base/surface/elevated/inset`), borders (`--border-default/strong`), text (`--text-primary/secondary/muted`), accent (`--accent`, `--accent-strong`, `--accent-dim`, `--accent-subtle`), status (`--success/error/warning/running`), `--focus`, shadows `--shadow-1..3`, `--shadow-live`.
- **Docs-only derivations:** prose tokens (`--text-prose: 15px`, `--text-prose-sm: 13px`, `--leading-prose: 1.65`, `--measure: 68ch`), `.font-prose`, `.max-w-measure`, token-based `::selection`, `html.theme-switching` 150ms crossfade, `caret-blink`/`sheet-in`/`shimmer` animations.
- **Typography:** chrome in JetBrains Mono; display headings in Space Grotesk; prose body in Plus Jakarta Sans 15px/1.65 (docs-only deviation, recorded in spec 024 `design-ui.md` §4). 8-step display scale via Tailwind `fontSize` tokens (`display-2xl`…`micro`, `prose`, `prose-sm`).
- **Component classes:** `.panel`, `.panel-live`, `.label`, `.kbd`, `.chip`, `.btn-primary`, `.btn-ghost` — same names/semantics as the dashboard.
- **Rules:** no glass, no glow, no gradients, no neon; hairline borders; status colors only on live/semantic elements; transform/opacity motion only (150–250ms) with a global reduced-motion kill-switch; literal hex/rgb/hsl colors are forbidden outside `index.css`/theme configs.
- Prose link contrast: dark theme links use `--accent`; light theme uses `--accent-strong` (AA-verified in spec 024) with underline.

## Theme Mechanism

- `docs/src/hooks/useTheme.ts`: `ThemeProvider` + `useTheme()` (`{ theme, toggleTheme }`). Default dark; persists to `localStorage['crewloop-docs-theme']`; toggles the `light` class on `<html>` and adds `theme-switching` for 200ms during the flip.
- `docs/index.html` contains an inline anti-FOUC script that reads the stored theme before first paint (try/catch → dark).
- `docs/src/components/ThemeToggle.tsx` (Sun/Moon, `aria-pressed`) is mounted in the `App.tsx` navbar.
- Mermaid diagrams re-initialize per theme via `getMermaidTheme(mode)` in `MarkdownRenderer.tsx` (`theme: 'dark'|'default'` + `themeVariables` read from the CSS custom properties; deferred one `requestAnimationFrame` so computed styles reflect the new theme).

## Component Map

| File | Role |
|------|------|
| `src/App.tsx` | Hash router, 56px hairline navbar (orbit brand mark + wordmark, Home/Docs/GitHub links, ThemeToggle) |
| `src/components/LandingPage.tsx` | Asymmetrical hero (thesis + install slab + typewriter), SkillVisualizer, skill grids, observability screenshots, comparison panels, metrics strip, modals (scrim `var(--overlay)`, `animate-modal-in`) |
| `src/components/SkillVisualizer.tsx` | 6-phase stepper; vertical with graphite timeline on desktop, horizontal `snap-x` cards on mobile; open node = `--accent` + `--shadow-live` |
| `src/components/TerminalSimulator.tsx` | "Reference panel" terminal (`bg-inset` + hairline); running line `--running`, success `--success`; behavior/timing preserved from the original |
| `src/components/DocsLayout.tsx` | 260px sidebar (search, `.label` sections, active item `bg-accent-dim` + `--accent-strong` + 2px accent bar), off-canvas sheet on mobile, breadcrumb, shimmer skeleton, error well (`bg-inset` + 2px `--error` left border + ghost Retry), 404 state, prev/next hairline footer cards |
| `src/components/MarkdownRenderer.tsx` | Prose overrides on tokens; `[!NOTE/TIP/IMPORTANT/WARNING/CAUTION]` alerts as hairline status panels (Phosphor icons, no emoji); code slabs (`bg-inset`, lang label, copy → "Copied" 1.2s); syntax spans mirror the dashboard FileDiff highlighter (strings `--success`, keywords `--accent`, comments `--text-muted` italic, builtins `--running`); Mermaid per-theme |
| `src/hooks/useTheme.ts` | Theme context (see Theme Mechanism) |
| `src/sidebarConfig.ts` | Docs reader navigation + markdown paths |
| `index.css` / `tailwind.config.js` | Token definitions; Tailwind maps colors 1:1 to CSS vars, `darkMode: 'class'` |

## Brand Asset (spec 025)

- `public/assets/images/crewloop-logo.png` (369×369, transparent) is the single source of truth for the brand mark — orbit rings, three nodes, blue→teal→green gradient.
- Referenced base-aware in both surfaces: favicon (`index.html`, `%BASE_URL%`) and navbar brand slot (`App.tsx`, `import.meta.env.BASE_URL`) as a **bare 32×32 img** (no chip/border), decorative (`alt=""`, `aria-hidden`) next to the unchanged Space Grotesk wordmark.
- Known accepted risk (design-ui.md §4 of spec 025): the dark-blue arc partially sinks into the dark theme's graphite; if the visual walkthrough condemns it, the follow-up is a padded `bg-surface` badge variant, not a recolor.

## Known Deviations & Deferred Items

- `TerminalSimulator.tsx` has a pre-existing `react-hooks/exhaustive-deps` oxlint warning (dep array `[activeStep]` kept verbatim to preserve tested behavior).
- `TerminalSimulator.test.tsx` references copy from an older implementation and has no runner; left untouched (pre-existing).
- Visual walkthrough (both themes × landing/reader, Mermaid legibility, reduced motion, mobile) is a manual Reviewer checklist, not automated.
