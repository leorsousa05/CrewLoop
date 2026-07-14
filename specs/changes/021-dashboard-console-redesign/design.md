# Design: Dashboard Developer-Console Redesign

## Overview

Two sequential phases in one spec:

1. **Revert phase** — return the working tree to HEAD baseline by undoing spec 020's uncommitted changes.
2. **Redesign phase** — restyle the entire presentation layer (design tokens + shell + 7 views) in place, with a developer-console / minimalist aesthetic. Visual direction details (palette, type scale, spacing, motion) are defined by the Designer in `design-ui.md` inside this spec folder; this document defines the architecture, boundaries, contracts, and sequencing the redesign must respect.

## Proposed Directory & File Structure

```
servers/dashboard/
├── src/
│   ├── server.ts                       (Reverted to HEAD — removes /api/cli/* wiring)
│   └── api/
│       └── cli.ts                      (DELETED — spec 020 leftover)
└── ui/
    ├── index.html                      (Modified — font loading only if Designer changes pairing)
    └── src/
        ├── styles/
        │   └── index.css               (Reverted to HEAD, then rewritten: new token system, .panel, density, keyframes)
        ├── App.tsx                     (Reverted, then restyled — shell layout classes only)
        ├── lib/
        │   ├── types.ts                (Reverted to HEAD — removes 'cli' view type; no further changes)
        │   ├── tree.test.ts            (Reverted to HEAD)
        │   └── *.ts                    (UNCHANGED — pure logic, existing tests must stay green)
        ├── contexts/                   (UNCHANGED — Settings, PinnedSessions, Filter APIs preserved)
        ├── hooks/                      (UNCHANGED)
        └── components/
            ├── TopBar.tsx              (Reverted, then restyled)
            ├── Sidebar.tsx             (Reverted, then restyled)
            ├── CommandPalette.tsx      (Restyled)
            ├── ViewHeader.tsx          (Restyled)
            ├── FilterBar.tsx           (Restyled)
            ├── SessionSelector.tsx     (Restyled)
            ├── ActiveSkillPanel.tsx    (Restyled)
            ├── TelemetryPanel.tsx      (Restyled)
            ├── ActivityGraph.tsx       (Restyled)
            ├── Timeline.tsx            (Restyled)
            ├── TimelineRow.tsx         (Restyled)
            ├── FileList.tsx            (Restyled)
            ├── FileDiff.tsx            (Restyled)
            ├── FileActivity.tsx        (Restyled)
            ├── Network3D.tsx           (Restyled — canvas colors via tokens)
            ├── CLIConfigPanel.tsx      (DELETED — spec 020 leftover)
            ├── ui/
            │   ├── Icon.tsx            (Restyled only if icon set/weight changes)
            │   └── StatusBadge.tsx     (Restyled)
            └── views/
                ├── Overview.tsx        (Restyled — layout grid may change per design-ui.md)
                ├── SessionsView.tsx    (Restyled)
                ├── TimelineView.tsx    (Restyled)
                ├── NetworkView.tsx     (Restyled)
                ├── FilesView.tsx       (Restyled)
                ├── SkillsView.tsx      (Restyled)
                └── SettingsView.tsx    (Restyled)
```

No new files outside `specs/`. No deleted files beyond the two spec-020 leftovers.

## Code Architecture & Design Patterns

- **Architecture Model:** Unidirectional presentational layer over stable domain types. The redesign touches only the "view" ring — components render `ClientSession`/`ClientEvent` data and never own state beyond local UI state. This mirrors a Ports & Adapters split already present: `lib/` + `hooks/` + `contexts/` are the application core; `components/` are swappable adapters to the DOM.
- **Design Patterns Used:**
  - **Token-driven theming (Strategy via CSS variables):** all color/spacing/motion decisions live in `index.css` custom properties mapped into Tailwind. Components consume semantic tokens (`bg-surface`, `text-secondary`, `border-default`, etc.), never raw values. The redesign changes token *values* and component class composition, not the token *vocabulary* — this is what makes a full restyle possible without touching logic. Any new semantic token must be added in both `:root` (dark) and `html.light` scopes and registered in `tailwind.config.*`.
  - **Composition over configuration:** views compose existing panels; restyle happens inside each component's class lists. No new wrapper components, no prop API changes.
  - **Observer (unchanged):** WebSocket → `useSessions` → contexts → views. Untouched.
- **Non-goal patterns:** no new state management, no CSS-in-JS, no component library adoption.

## Data Model

No changes. Existing contracts remain the source of truth:

```typescript
// servers/dashboard/ui/src/lib/types.ts (after revert — unchanged from HEAD)
// ClientSession: id, source, activeSkill, confidence, lifecycle, events, toolCounts, workspaceRoot
// ClientEvent: tool, operationType ('read' | 'edit' | 'other'), status, duration, input, output
// ViewName: 'overview' | 'sessions' | 'timeline' | 'network' | 'files' | 'skills' | 'settings'
//   ('cli' removed by the revert)
```

## API Contracts

No new or changed contracts after revert. Constraints the redesign must honor:

```typescript
// Component prop contracts — signatures preserved, only internal markup/classes change.
// Illustrative boundary for every restyled component:
interface RestyleBoundary {
  props: "unchanged";        // no prop added, removed, or retyped
  contextUsage: "unchanged"; // same contexts/hooks consumed
  domOutput: "free";         // markup and classes may change freely
}
```

```typescript
// Theme tokens — the ONLY new "interface" introduced by this spec.
// Exact values come from design-ui.md (Designer). Vocabulary contract:
//   Surfaces:  --bg-base --bg-surface --bg-elevated --bg-inset
//   Borders:   --border-default --border-strong
//   Text:      --text-primary --text-secondary --text-muted
//   Semantic:  --accent --accent-dim --success --error --running --warning
//   Overlay:   --overlay
// Rule: a token may be renamed or added only if the rename/addition is applied
// atomically across index.css, tailwind config, and all consuming components.
```

## Flow Diagrams

### Revert flow (must complete first, as its own commitable unit)
1. `git restore` the 7 modified files to HEAD.
2. Delete `servers/dashboard/src/api/cli.ts` and `servers/dashboard/ui/src/components/CLIConfigPanel.tsx`.
3. Update spec 020 `.spec.yaml` → `status: cancelled`, `superseded_by: 021-dashboard-console-redesign`, and move the folder to `specs/archive/2026-07-14-020-dashboard-redesign/`.
4. Verify: `npm run build` + `npm test` in `servers/dashboard/` pass on the clean baseline.

### Redesign flow (per component, repeatedly)
1. Designer publishes `design-ui.md` with tokens, per-component specs, and motion table.
2. Engineer rewrites token values in `index.css` (dark + light) — one atomic change.
3. Engineer restyles shell components (TopBar → Sidebar → CommandPalette → ViewHeader → FilterBar → SessionSelector).
4. Engineer restyles views one at a time (Overview → Sessions → Timeline → Network → Files → Skills → Settings), each verified in the browser in dark + light + compact density.
5. Reviewer validates the full diff against this spec and `design-ui.md`.

## State Management

Unchanged. `SettingsContext` (theme, density, reducedMotion, autoFollowActive), `PinnedSessionsContext`, `FilterContext` keep their exact APIs. The theme toggle continues to flip `html.light`; density continues to toggle the `density-compact` class on the app root. The redesign may not introduce new persisted settings.

## Error Handling

- Revert phase: if `git restore` shows conflicts (it should not — files are simply dirty), stop and escalate to the user rather than resolving by hand.
- Redesign phase: a broken token (e.g. missing light-mode value) must fail visibly in the browser during per-view verification — no silent fallbacks invented per component.
- No runtime error paths are added or removed by this spec.

## Performance Considerations

- Motion limited to `transform` and `opacity` (existing convention); the motion kill-switch for `prefers-reduced-motion` must survive the `index.css` rewrite.
- No new fonts beyond what `index.html` already loads unless the Designer explicitly changes the pairing — and then exactly one swap, not additions.
- `Network3D` canvas reads colors from CSS tokens; ensure token lookup happens on theme change, not per frame (existing behavior — do not regress).

## Security Considerations

- Revert *removes* attack surface (`/api/cli/*` routes that shell out to the CLI).
- Redesign adds no network calls, no `dangerouslySetInnerHTML`, no new dependencies — security posture unchanged.
- Reviewer still scans the diff for AI artifacts and secrets per standard checklist.
