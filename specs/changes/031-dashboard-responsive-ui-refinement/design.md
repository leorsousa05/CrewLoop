# Design: Dashboard Responsive UI Refinement

## Overview

Preserve the current industrial command-center thesis while making hierarchy and interaction semantics explicit. The design system remains graphite/indigo with semantic status colors, Space Grotesk for headings, and JetBrains Mono for operational data, but assets must be available without an external request.

## Proposed Directory & File Structure

```text
specs/changes/031-dashboard-responsive-ui-refinement/
└── design-ui.md                     (New: Designer deliverable)
servers/dashboard/ui/
├── public/fonts/                    (New only if licensed local font assets are required)
└── src/
    ├── App.tsx                      (Modified: overlay/live-region coordination)
    ├── styles/index.css             (Modified: semantic tokens and effective motion)
    ├── hooks/useDialogFocus.ts      (New: shared focus lifecycle)
    ├── components/
    │   ├── TopBar.tsx               (Modified)
    │   ├── Sidebar.tsx              (Modified)
    │   ├── FilterBar.tsx            (Modified)
    │   ├── SessionSelector.tsx      (Modified)
    │   ├── TimelineRow.tsx          (Modified)
    │   └── views/*.tsx              (Modified)
    └── test/                        (New shared DOM test setup if required)
```

## Code Architecture & Design Patterns

- **Industrial/Utilitarian visual thesis:** dense utility stack, visible frames, restrained elevation, and semantic color.
- **Compound interaction separation:** row activation and row actions are sibling controls, never nested controls.
- **Focus lifecycle:** one reusable hook/primitive coordinates modal overlay semantics.
- **Progressive disclosure:** desktop keeps master-detail density; mobile presents one prioritized pane at a time.

## Data Model

```typescript
interface DialogFocusOptions {
  open: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  restoreFocusRef?: RefObject<HTMLElement>;
  closeOnEscape: boolean;
}

interface AnnouncedStatus {
  politeness: 'polite' | 'assertive';
  message: string;
}
```

## API Contracts

```typescript
function useDialogFocus(options: DialogFocusOptions): RefObject<HTMLElement>;

interface InteractiveRowProps {
  onActivate(): void;
  primaryLabel: string;
  actions: ReactNode;
  expanded?: boolean;
}
```

## Flow Diagrams

### Mobile Overlay

1. Trigger records itself as the restoration target.
2. Overlay mounts with dialog semantics and background interaction disabled.
3. Focus moves to heading, search, or first actionable control according to purpose.
4. Tab remains within the overlay; Escape/backdrop closes where safe.
5. Focus returns to the trigger after unmount.

### Responsive Files

1. File tree is the initial mobile pane.
2. Selecting a file updates the hash and opens the detail pane.
3. Back clears only the detail presentation while preserving route/filter context as specified.
4. Desktop renders tree and detail together from the same selected-path contract.

## State Management

Overlay open state remains owned by the nearest shell component. Route, filters, settings, and sessions retain existing owners. Accessibility state is derived from visible state rather than maintained separately.

## Error Handling

Every async surface defines loading, empty, error, stale/offline, success, and retry treatment in `design-ui.md`. Errors are placed near their affected surface and announced without stealing focus unless action is required.

## Performance Considerations

Motion uses transform and opacity only. Fonts are subset/bundled where licensing permits. DOM duplication for desktop/mobile is avoided when CSS and semantic ordering can express both layouts.

## Security Considerations

Payload and diff content render as text, never injected HTML. Focus restoration does not target removed session/file controls. External font requests are removed from the local operational surface.
