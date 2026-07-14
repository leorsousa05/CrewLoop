# Proposal: Dashboard Full Redesign — Structure & Visual System

## Status

- **State:** active
- **Created:** 2026-07-14
- **Author:** Architect
- **Builds on:** `022-dashboard-saas-minimalist-redesign` (completed, uncommitted — the current working tree is the baseline)

## Problem Statement

Spec 022 replaced the dashboard's skin (SaaS minimalist tokens, indigo accent, Space Grotesk) but deliberately did not touch the skeleton. The structural debt underneath is now the main thing holding the product back:

1. **Duplicated information architecture.** The view title renders twice (TopBar + 40px `ViewHeader` on every view). The navigation registry is defined twice (`VIEWS` in `App.tsx:27`, `ITEMS` in `Sidebar.tsx:11`). The Overview replicates data that the Skills and Sessions views already own (Top Skills, Top Tools, session counter).
2. **Wasted space.** `ActiveSkillPanel` renders the skill name at `text-6xl` in a 656px hero with mostly empty space; `TelemetryPanel` fills a full-height panel with only 3 stat cards.
3. **No deep-linking.** View, selected session, and filters live only in React state. Refresh loses all context; nothing is shareable; back/forward do nothing.
4. **Weak interaction model.** One global shortcut (⌘K). Timeline rows are `<li onClick>` — not keyboard-focusable. SessionsView nests a `<button>` inside a `<button>` (invalid HTML). Timeline pause-on-hover has no visible indicator and no buffered-event count.
5. **Broken responsive behavior.** The Files split-pane is unusable below `md` (detail pane squashed). FilterBar popovers overflow the right edge on narrow screens. `ActivityGraph` canvas sizes once on mount (no ResizeObserver). The connection chip disappears on mobile.
6. **Ad-hoc typography.** `text-[40px]`, `text-6xl`, `text-[8px]`, `text-[8.5px]`, `text-[12.5px]`, `py-0.2` — no consistent scale.
7. **Dead code.** `hooks/useTheme.ts` (no importers), `filterGraph` + `Graph3D` types and tests (Network view leftovers), `vendor-graph` manual chunk in `vite.config.ts` for dependencies already removed from `package.json`.

The user approved a full redesign scope: rethink structure (navigation, views, hierarchy) **and** redo every component, evolving the SaaS minimalist direction toward something more polished, denser, more functional, and responsive.

## Goals

1. **Single-source information architecture** — one navigation registry consumed by App, Sidebar, CommandPalette, and TopBar; one title location; no duplicated data between views.
2. **Deep-linkable UI** — hash-based routing (no new dependencies): view, selected session, filters, and selected file survive refresh and are shareable.
3. **Keyboard-first interaction** — global view shortcuts, filter focus shortcut, keyboard-navigable timeline and session lists, visible pause control with buffered-event count.
4. **Consistent type system** — a fixed named type scale registered in Tailwind; arbitrary font-size values forbidden.
5. **Real responsiveness** — Files master-detail drill-down on mobile, FilterBar that cannot overflow, ResizeObserver-driven ActivityGraph, connection feedback on all breakpoints.
6. **Hygiene** — remove all Network-era dead code and the unused `useTheme` hook.

## Non-Goals

- No new dependencies (no router, no component library, no virtualization library).
- No changes to WebSocket/REST contracts, server types, or event ingestion.
- No changes to the persisted settings schema (`DashboardSettings`) or contexts' public APIs.
- No timeline virtualization (deferred — see Risks).
- No backend work of any kind.

## Constraints

- Stack is fixed: Vite 6 + React 18 + TypeScript + Tailwind CSS v3 (`darkMode: 'class'`) + `@phosphor-icons/react`.
- Token-driven theming stays: all visual decisions flow through CSS custom properties in `ui/src/styles/index.css` mapped into `tailwind.config.js`.
- The working tree (spec 022 state) is the baseline — it must NOT be reverted; `npm run build` and `npm test` pass on it today.
- UI imports shared logic from `../../src/*` — those imports must not change.
- The dashboard must still run with `npm run dev` / `npm start` from `servers/dashboard/` with no new config.
- All existing tests must continue to pass (except those explicitly removed with the dead code).
- Visual direction: evolve the SaaS minimalist line (indigo accent, Space Grotesk display, JetBrains Mono body/mono). Detailed visual decisions belong to the Designer in `design-ui.md`.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hash routing introduces state-sync bugs (URL vs contexts) | High | `useHashRoute` is the single owner of URL state; pure `parseRoute`/`serializeRoute` functions are unit-tested; contexts keep their APIs and are hydrated from URL on load only |
| Removing `ViewHeader` leaves views without action slots | Med | Views that need actions render their own compact toolbar (FilterBar already covers Sessions/Timeline/Files/Skills); Overview and Settings get section headers per `design-ui.md` |
| Mobile master-detail for Files loses the "see list while viewing diff" workflow | Low | Drill-down only applies below `md`; desktop keeps the split pane; selected file is in the URL so back returns to the list |
| Type-scale migration misses ad-hoc values | Med | Reviewer greps the diff for `text-\[` and `py-0\.2`-style arbitrary values; design-ui.md provides the mapping table |
| Keyboard shortcuts conflict with browser/OS | Low | Shortcuts use plain digits (no modifiers) and only fire when no input/textarea is focused; ⌘K unchanged |
| Timeline virtualization absent on huge sessions | Low | Deferred with reason: no virtualization library allowed and hand-rolled windowing is high-risk for row-expand UX; `maxEvents` setting already caps rendered events |
| Scope creep into logic/backend | Med | affected_files in `.spec.yaml` is the boundary; Reviewer checks the diff against it |

## Success Criteria

- [ ] `NAV_ITEMS` registry in `lib/navigation.ts` is the single source for App, Sidebar, CommandPalette, TopBar; `VIEWS`/`ITEMS` duplication gone.
- [ ] `ViewHeader.tsx` deleted; view title renders in exactly one place.
- [ ] Overview no longer duplicates Top Skills / Top Tools / session counter; dead hero space eliminated.
- [ ] URL round-trip: refresh on any view restores view, selected session, filters, and selected file; browser back/forward works between views.
- [ ] Global shortcuts: digits 1–6 switch views, `/` focuses filter search, `Esc` closes popovers/palette; timeline rows navigable via `j`/`k` + `Enter`.
- [ ] Timeline pause shows a visible banner with buffered-event count and a resume action; manual pause toggle exists.
- [ ] SessionsView rows are valid HTML (no nested buttons) and keyboard-operable; sort control present (recent/duration/events/name; pins first).
- [ ] Files view usable below `md` via list → detail drill-down; FilterBar cannot overflow the viewport; ActivityGraph redraws on container resize; connection indicator visible on mobile.
- [ ] Named type scale registered in `tailwind.config.js`; zero arbitrary font-size values in the diff.
- [ ] Dead code removed: `useTheme.ts`, `filterGraph`/`Graph3D` leftovers, `vendor-graph` chunk.
- [ ] `npm run build` and `npm test` pass in `servers/dashboard/`.
- [ ] Light + dark themes, both densities, and reduced-motion remain functional.
