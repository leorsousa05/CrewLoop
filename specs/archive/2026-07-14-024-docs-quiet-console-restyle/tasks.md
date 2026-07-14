# Tasks

## Phase 1 — Token layer (Engineer)

- [x] Rewrite `docs/src/index.css`: dashboard token set verbatim (`:root` dark + `html.light` overrides), spacing/radii/shadows, 8-step type scale + leading vars, component classes (`.panel`, `.panel-live`, `.label`, `.kbd`, `.chip`, `.btn-primary`, `.btn-ghost`), focus ring, reduced-motion block, token-based scrollbar. Remove glass tokens, glow/isometric utilities, `hover-spring-physics`, neon scrollbar.
- [x] Rewrite `docs/tailwind.config.js`: `darkMode: 'class'`; colors mapped 1:1 to CSS vars; named `fontSize` scale (`display-2xl`…`micro`) with leading vars; drop glass/glow tokens and animations; register only used animations.
- [x] `docs/index.html`: remove hard-coded `bg-[#020617]` body class; add the anti-FOUC theme script (`localStorage['crewloop-docs-theme']`, try/catch fallback to dark).
- [x] Font imports per `design-ui.md` (default: Space Grotesk + JetBrains Mono; keep Plus Jakarta Sans only if the Designer keeps a sans reading face). — Designer kept Plus Jakarta Sans for prose only (design-ui.md §4).

## Phase 2 — Theme infrastructure (Engineer)

- [x] Create `docs/src/hooks/useTheme.ts` (`ThemeMode`, `THEME_STORAGE_KEY`, default dark, persisted toggle, applies `html.light`).
- [x] Create `docs/src/components/ThemeToggle.tsx` (Phosphor Sun/Moon, `aria-pressed`, token styling).
- [ ] Add `docs/src/hooks/useTheme.test.ts` (or colocated): default dark; toggle flips + persists; stored value wins on mount. — **Deferred:** no test runner exists in `docs/` (vitest/RTL not installed); adding test infra would violate the no-new-dependencies constraint.
- [x] Mount the toggle in `App.tsx` navbar.

## Phase 3 — Shell (Engineer)

- [x] Restyle `App.tsx` navbar: surface bg + hairline bottom border, indigo selected state, token-colored brand chip, no violet.

## Phase 4 — Landing (Engineer, per design-ui.md)

- [x] Restyle `LandingPage.tsx` section by section: glass cards → hairline panels; remove glow/isometric/neon treatments; single indigo accent; type scale tokens.
- [x] Restyle `SkillVisualizer.tsx`.
- [x] Restyle `TerminalSimulator.tsx` (behavior preserved; `TerminalSimulator.test.tsx` NOT updated — observable copy/timing unchanged).

## Phase 5 — Docs reader (Engineer)

- [x] Restyle `DocsLayout.tsx`: sidebar + search, breadcrumb, skeleton/error states, footer nav, indigo active state. (Also implemented the design-ui.md §8 404 state and made Retry actually refetch via a retry nonce.)

## Phase 6 — Markdown (Engineer)

- [x] Rebuild `MarkdownRenderer.tsx` prose overrides on tokens (headings, links, inline code, tables, lists).
- [x] Alerts (`[!NOTE]`/`[!TIP]`/`[!IMPORTANT]`/`[!WARNING]`/`[!CAUTION]`) → hairline semantic panels using status tokens.
- [x] Code blocks: inset bg + hairline border terminal header, no neon; copy button on tokens (label swaps to "Copied" + Check, reverts after 1.2s).
- [x] Mermaid: `getMermaidTheme(mode)` per active theme; re-init on theme change without losing scroll position (one `requestAnimationFrame` defer so computed tokens match the flipped root class; same container → no scroll jump).

## Phase 7 — Sweep, docs, verification (Engineer)

- [x] Literal-color sweep: no hex/rgb/hsl(a) in `docs/src/**` outside `index.css` and theme configs (only false positives: `&#039;` HTML entity in the escaper; pre-existing scaffold SVGs `docs/src/assets/*.svg`).
- [x] Update root `AGENTS.md`: `docs/` described as Vite + React + Tailwind SPA (structure tree, technology table, build/deploy mentions).
- [x] Update `specs/living/docs/` with the Quiet Console token architecture + theme mechanism summary.
- [x] Verify `npm run build` and `npx oxlint` in `docs/` pass.

## Review follow-ups (Reviewer → Engineer round 1)

- [x] W1: modals now close on ESC and receive initial focus (`tabIndex={-1}` + focus-on-mount) in `LandingPage.tsx`. Full focus-trap still **Deferred** (needs a proper trap implementation; initial focus + ESC covers the critical path).
- [x] W2: skill modal "Read Full Guide" button only renders when the doc page exists (`AVAILABLE_DOC_IDS` from `sidebarConfig.ts`); the 3 skills without pages (`devops-specialist`, `frontend-architect`, `schema-designer`) no longer dead-end into the 404 state. Writing those 3 pages is **Deferred** (docs-writer scope, new task).
- [x] W3: `docs/specs/changes/001-docs-redesign/.spec.yaml` original metadata restored (author/created/scope/affected_files) with `status: superseded` + `superseded_by` annotated instead of overwritten.
- [ ] W4: marketing metrics on the landing (`-94%`/`100%`/`12k+`) — **Deferred** (pre-existing at HEAD; visual-only spec).
- [ ] W5: browser walkthrough — **Deferred** (manual Reviewer checklist; nothing here was visually verified).

## Testing

- [ ] `useTheme` hook tests (new). — **Deferred:** no test runner in `docs/` (see Phase 2).
- [ ] `TerminalSimulator.test.tsx` green. — **Deferred:** cannot run (no runner). Note: its assertions reference copy from an older TerminalSimulator (`crewloop status`, "Discovery phase initiated") — stale before this spec; left untouched.
- [ ] **Deferred (Reviewer manual):** both themes × landing + docs reader, Mermaid legibility both themes, focus rings, reduced motion, mobile layouts, no theme flash on reload.

## Verification

- [x] `npm run build` in `docs/` passes (tsc + vite).
- [x] `npx oxlint` in `docs/` clean. — 0 errors, 1 warning: pre-existing `react-hooks/exhaustive-deps` in `TerminalSimulator.tsx` (dep array `[activeStep]` identical at HEAD; kept verbatim to preserve behavior).
- [ ] `npm test` (docs) passes. — **Deferred:** no `test` script/runner exists in `docs/`.
- [ ] **Deferred:** `npm run dev` visual walkthrough (Reviewer checklist above). Nothing in this spec was visually verified in a browser — compiles clean only.

## Documentation

- [x] Root `AGENTS.md` corrected (docs is a Vite/React/Tailwind SPA, not Docusaurus).
- [x] `specs/living/docs/` updated with the new design system.

## Completion

- [x] Update `.spec.yaml` status to completed.
- [ ] Archive change folder to `specs/archive/` (Shipper responsibility).
- [x] `docs/specs/changes/001-docs-redesign/` — already marked superseded by this spec (see its `.spec.yaml`).
