# Design: Dashboard SaaS Minimalist Redesign

## Overview

This spec restyles the entire presentation layer of the CrewLoop dashboard with a clean SaaS minimalist direction (Linear / Vercel / Raycast influence) and removes the Network 3D view. The work happens in four sequential phases:

1. **Baseline cleanup** — supersede spec 021 and restore a clean working tree if partial 021 changes are present.
2. **Network view removal** — delete Network-related components and types, update `App.tsx`, and remove the unused `react-force-graph-3d` dependency.
3. **Design system reset** — new token values in `index.css` (light-first palette, refined spacing, softer radius, flat/low elevation) and update `tailwind.config.js` if new tokens are added.
4. **Component restyle** — restyle the shell (TopBar, Sidebar, CommandPalette, ViewHeader, FilterBar, SessionSelector) and the six remaining views (Overview, Sessions, Timeline, Files, Skills, Settings) in place.

Visual details (palette, type scale, spacing, motion, per-component specs) are authored by the Designer in `design-ui.md` inside this spec folder. This document defines architecture, boundaries, contracts, and sequencing.

## Proposed Directory & File Structure

```
servers/dashboard/
├── package.json                          (Modified — remove react-force-graph-3d)
├── package-lock.json                     (Modified — sync dependency removal)
├── src/
│   └── lib/
│       └── graph.ts                      (UNCHANGED — no longer imported by UI, kept for history)
└── ui/
    ├── index.html                        (Modified — font loading only if Designer changes pairing)
    ├── tailwind.config.js                (Modified — register any new/renamed tokens)
    └── src/
        ├── styles/
        │   └── index.css                 (Modified — new token values, component classes, keyframes)
        ├── lib/
        │   ├── types.ts                  (Modified — remove 'network' from View union)
        │   └── *.ts                      (UNCHANGED — pure logic, existing tests must stay green)
        ├── contexts/                     (UNCHANGED)
        ├── hooks/                        (UNCHANGED)
        ├── App.tsx                       (Modified — remove network view, graph imports, VIEWS entry)
        ├── components/
        │   ├── TopBar.tsx                (Modified — restyle)
        │   ├── Sidebar.tsx               (Modified — restyle, 6 nav items)
        │   ├── CommandPalette.tsx        (Modified — restyle, no network view items)
        │   ├── ViewHeader.tsx            (Modified — restyle)
        │   ├── FilterBar.tsx             (Modified — restyle)
        │   ├── SessionSelector.tsx       (Modified — restyle)
        │   ├── ActiveSkillPanel.tsx      (Modified — restyle)
        │   ├── TelemetryPanel.tsx        (Modified — restyle)
        │   ├── ActivityGraph.tsx         (Modified — restyle)
        │   ├── Timeline.tsx              (Modified — restyle)
        │   ├── TimelineRow.tsx           (Modified — restyle)
        │   ├── FileList.tsx              (Modified — restyle)
        │   ├── FileDiff.tsx              (Modified — restyle)
        │   ├── FileActivity.tsx          (Modified — restyle)
        │   ├── Network3D.tsx             (DELETED)
        │   ├── ui/
        │   │   ├── Icon.tsx              (Modified — only if icon set/weight changes)
        │   │   └── StatusBadge.tsx       (Modified — restyle)
        │   └── views/
        │       ├── NetworkView.tsx       (DELETED)
        │       ├── Overview.tsx          (Modified — restyle)
        │       ├── SessionsView.tsx      (Modified — restyle)
        │       ├── TimelineView.tsx      (Modified — restyle)
        │       ├── FilesView.tsx         (Modified — restyle)
        │       ├── SkillsView.tsx        (Modified — restyle)
        │       └── SettingsView.tsx      (Modified — restyle)
```

No new files outside `specs/`. Two UI files are deleted (`Network3D.tsx`, `views/NetworkView.tsx`).

## Code Architecture & Design Patterns

- **Architecture Model:** Unidirectional presentational layer over stable domain types. The redesign touches only the "view" ring — components render `ClientSession`/`ClientEvent` data and never own state beyond local UI state. This mirrors a Ports & Adapters split already present: `lib/` + `hooks/` + `contexts/` are the application core; `components/` are swappable adapters to the DOM.
- **Design Patterns Used:**
  - **Token-driven theming (Strategy via CSS variables):** all color/spacing/motion decisions live in `index.css` custom properties mapped into Tailwind. Components consume semantic tokens (`bg-surface`, `text-secondary`, `border-default`, etc.), never raw values. The redesign changes token *values* and component class composition, not the token *vocabulary* — this is what makes a full restyle possible without touching logic. Any new semantic token must be added in both `:root` (dark) and `html.light` scopes and registered in `tailwind.config.js`.
  - **Composition over configuration:** views compose existing panels; restyle happens inside each component's class lists. No new wrapper components, no prop API changes.
  - **Observer (unchanged):** WebSocket → `useSessions` → contexts → views. Untouched.
- **Non-goal patterns:** no new state management, no CSS-in-JS, no component library adoption.

## Data Model

The only contract change is the removal of `'network'` from the `View` union.

```typescript
// servers/dashboard/ui/src/lib/types.ts

export type View =
  | 'overview'
  | 'sessions'
  | 'timeline'
  | 'files'
  | 'skills'
  | 'settings';
```

All other types remain unchanged:

```typescript
export type Theme = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'comfortable';

export interface FilterState {
  query: string;
  sources: AgentSource[];
  skills: string[];
  statuses: EventStatus[];
  tools: string[];
  opTypes: ('read' | 'edit' | 'other')[];
  timeRange: TimeRange;
}

export interface DashboardSettings {
  theme: Theme;
  density: Density;
  reducedMotion: boolean;
  autoFollowActive: boolean;
  maxEvents: number;
}

export interface CommandPaletteItem {
  id: string;
  type: 'view' | 'session' | 'skill' | 'tool' | 'file' | 'event' | 'action';
  title: string;
  subtitle?: string;
  icon?: string;
  keywords?: string[];
  action(): void;
}
```

## API Contracts

No new or changed server contracts. UI component prop contracts are preserved — only internal markup and class lists change. The only exception is the removal of Network-specific props from `App.tsx` and the deletion of `NetworkView`/`Network3D` components.

```typescript
// Component prop boundary for every restyled component:
interface RestyleBoundary {
  props: "unchanged";        // no prop added, removed, or retyped
  contextUsage: "unchanged"; // same contexts/hooks consumed
  domOutput: "free";         // markup and classes may change freely
}

// Theme tokens — values come from design-ui.md (Designer). Vocabulary contract:
//   Surfaces:  --bg-base --bg-surface --bg-elevated --bg-inset
//   Borders:   --border-default --border-strong
//   Text:      --text-primary --text-secondary --text-muted
//   Semantic:  --accent --accent-dim --success --error --running --warning
//   Overlay:   --overlay
// Rule: a token may be renamed or added only if the rename/addition is applied
// atomically across index.css, tailwind config, and all consuming components.
```

## Flow Diagrams

### Baseline cleanup

1. Update `specs/changes/021-dashboard-console-redesign/.spec.yaml` → `status: superseded`, `superseded_by: 022-dashboard-saas-minimalist-redesign`.
2. If the working tree contains partial 021 changes that conflict with the new direction, restore those files to HEAD or to a clean baseline before styling begins.
3. Verify `npm run build` + `npm test` pass on the clean baseline.

### Network view removal

1. Remove `'network'` from `View` union in `ui/src/lib/types.ts`.
2. Remove the `{ key: 'network', ... }` entry from `VIEWS` in `ui/src/App.tsx`.
3. Remove `NetworkView` and `Network3D` imports and the `network` case from `renderView()` in `App.tsx`.
4. Remove `buildGraph3D` and `filterGraph` imports and usage from `App.tsx`.
5. Delete `ui/src/components/views/NetworkView.tsx`.
6. Delete `ui/src/components/Network3D.tsx`.
7. Remove `react-force-graph-3d` from `package.json` and regenerate `package-lock.json`.
8. Verify build and tests pass.

### Redesign flow

1. Designer publishes `design-ui.md` with tokens, per-component specs, and motion table.
2. Engineer rewrites token values in `index.css` (light + dark) — one atomic change.
3. Engineer updates `tailwind.config.js` if new tokens are added.
4. Engineer restyles shell components (TopBar → Sidebar → CommandPalette → ViewHeader → FilterBar → SessionSelector).
5. Engineer restyles views one at a time (Overview → Sessions → Timeline → Files → Skills → Settings), each verified in the browser in light + dark + compact density.
6. Reviewer validates the full diff against this spec and `design-ui.md`.

## State Management

Unchanged. `SettingsContext` (theme, density, reducedMotion, autoFollowActive, maxEvents), `PinnedSessionsContext`, `FilterContext` keep their exact APIs. The theme toggle continues to flip `html.light`; density continues to toggle the `density-compact` class on the app root. The redesign may not introduce new persisted settings.

## Error Handling

- Baseline cleanup: if restoring files shows conflicts, stop and escalate rather than resolving by hand.
- Network removal: TypeScript will report any remaining `'network'` references after the type change. Fix all references before claiming the phase complete.
- Redesign phase: a broken token (e.g. missing light-mode value) must fail visibly in the browser during per-view verification — no silent fallbacks invented per component.
- No runtime error paths are added or removed by this spec.

## Performance Considerations

- Motion limited to `transform` and `opacity` (existing convention); the motion kill-switch for `prefers-reduced-motion` must survive the `index.css` rewrite.
- Removing `react-force-graph-3d` reduces bundle size and eliminates the WebGL canvas overhead.
- No new fonts beyond what `index.html` already loads unless the Designer explicitly changes the pairing — and then exactly one swap, not additions.

## Security Considerations

- Redesign adds no network calls, no `dangerouslySetInnerHTML`, no new dependencies — security posture unchanged.
- Removing the Network view does not affect backend event ingestion or sanitization.
- Reviewer still scans the diff for AI artifacts and secrets per standard checklist.
