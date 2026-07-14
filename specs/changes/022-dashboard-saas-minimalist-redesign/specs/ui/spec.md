# Spec Delta: Dashboard UI

## Current State

The dashboard currently reflects a mix of two visual directions:

- The committed baseline (spec 017 era) uses an amber-accented Vercel command-center aesthetic.
- Spec 021 partially introduced a dark industrial / lime-phosphor developer-console direction, but that work is incomplete and now superseded.
- The UI has seven primary views: Overview, Sessions, Timeline, Network, Files, Skills, Settings.
- The shell consists of `TopBar`, `Sidebar`, `CommandPalette`, `ViewHeader`, `FilterBar`, and `SessionSelector`.
- Styling is token-driven via CSS custom properties in `ui/src/styles/index.css` and mapped into Tailwind in `ui/tailwind.config.js`.

## Changes

### ADDED

- New SaaS minimalist design system tokens (colors, spacing, radius, elevation, motion) documented in `design-ui.md` and implemented in `ui/src/styles/index.css`.
- Light-first palette with a clean dark counterpart.
- Possibly one or two new semantic tokens if required by the Designer spec (e.g. `--bg-overlay`); any addition must be mirrored in `:root`, `html.light`, `tailwind.config.js`, and all consuming components.

### MODIFIED

- `ui/src/styles/index.css` — full rewrite of token values, component classes (`.panel`, `.chip`, `.btn-primary`, `.btn-ghost`, `.kbd`, `.label`), density overrides, keyframes, focus rings, and scrollbar styles.
- `ui/tailwind.config.js` — register any new/renamed tokens; keep existing semantic color mapping.
- `ui/src/lib/types.ts` — remove `'network'` from the `View` union.
- `ui/src/App.tsx` — remove `NetworkView` import, remove `network` case from `renderView()`, remove `network` from `VIEWS`, remove `buildGraph3D`/`filterGraph` imports and usage, remove network-related command palette items (handled automatically by `VIEWS` iteration).
- `ui/src/components/TopBar.tsx` — restyle per `design-ui.md`.
- `ui/src/components/Sidebar.tsx` — restyle, now shows 6 nav items instead of 7.
- `ui/src/components/CommandPalette.tsx` — restyle, no network view items.
- `ui/src/components/ViewHeader.tsx` — restyle.
- `ui/src/components/FilterBar.tsx` — restyle.
- `ui/src/components/SessionSelector.tsx` — restyle.
- `ui/src/components/ActiveSkillPanel.tsx` — restyle.
- `ui/src/components/TelemetryPanel.tsx` — restyle.
- `ui/src/components/ActivityGraph.tsx` — restyle.
- `ui/src/components/Timeline.tsx` — restyle.
- `ui/src/components/TimelineRow.tsx` — restyle.
- `ui/src/components/FileList.tsx` — restyle.
- `ui/src/components/FileDiff.tsx` — restyle.
- `ui/src/components/FileActivity.tsx` — restyle.
- `ui/src/components/views/Overview.tsx` — restyle.
- `ui/src/components/views/SessionsView.tsx` — restyle.
- `ui/src/components/views/TimelineView.tsx` — restyle.
- `ui/src/components/views/FilesView.tsx` — restyle.
- `ui/src/components/views/SkillsView.tsx` — restyle.
- `ui/src/components/views/SettingsView.tsx` — restyle.
- `ui/src/components/ui/Icon.tsx` — only if icon weight/size changes per design-ui.md.
- `ui/src/components/ui/StatusBadge.tsx` — restyle.

### REMOVED

- `ui/src/components/views/NetworkView.tsx` — deleted.
- `ui/src/components/Network3D.tsx` — deleted.
- `react-force-graph-3d` dependency from `servers/dashboard/package.json` and `package-lock.json`.
- All references to the `network` view in command palette and navigation.

## Migration Notes

- Any open branches or in-progress work that depends on the `network` view or `react-force-graph-3d` must rebase or drop those changes.
- The backend `src/lib/graph.ts` file is left untouched; it is no longer imported by the UI but may still exist for history. A future cleanup spec can remove it if desired.

## Backward Compatibility

- This is a **breaking visual change** — the entire dashboard look and feel changes.
- Data contracts and behavior are backward compatible: `ClientSession`, `ClientEvent`, filter state, settings context, and WebSocket protocol remain unchanged.
- The Network view removal is a **UI breaking change** for users who navigated to it, but no public API is affected.
