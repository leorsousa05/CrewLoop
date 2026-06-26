# UI/UX Design Specification: Dashboard Search, Filters, Sorting, Export, and Keyboard Shortcuts

## Aesthetic Direction

**Industrial Command-Center, refined.** The dashboard is a live operations panel for agent sessions: high-density, dark surfaces, cyan signal color for active state, and monospace for raw tool data. This enhancement adds a control toolbar and filter panel that feel like part of the same console — precise, scannable, and fast to operate. Nothing decorative; every element exists to reduce noise and surface the right event.

## Color System

Reuse existing CSS variables. Add a small set of toolbar-specific semantic tokens that alias the base palette so light mode flips automatically.

```css
:root {
  /* existing tokens preserved */
  --bg-base: #09090b;
  --bg-surface: #121214;
  --bg-elevated: #1c1c1f;
  --bg-inset: #050507;
  --border-default: #27272a;
  --border-strong: #3f3f46;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --accent: #22d3ee;
  --accent-hover: #67e8f9;
  --accent-dim: #0891b2;
  --success: #4ade80;
  --error: #fb7185;
  --warning: #facc15;
  --running: #38bdf8;

  /* new toolbar tokens */
  --toolbar-bg: var(--bg-surface);
  --toolbar-border: var(--border-default);
  --toolbar-input-bg: var(--bg-inset);
  --toolbar-input-focus: var(--accent);
  --toolbar-text: var(--text-secondary);
  --toolbar-chip-bg: var(--bg-elevated);
  --toolbar-chip-active-bg: rgba(34, 211, 238, 0.12);
  --toolbar-chip-active-border: rgba(34, 211, 238, 0.40);
  --toolbar-meta-text: var(--text-muted);
}
```

Light mode inherits the existing `[data-theme="light"]` base tokens; the new toolbar tokens alias them and flip automatically.

Status colors (already present):

| State | Color | Usage |
|-------|-------|-------|
| running | `--running` | blue dot/spinner, running chip |
| success | `--success` | green check, success chip |
| error | `--error` | red cross, error chip |
| meta/default | `--text-muted` | neutral chips |

## Typography System

Keep existing fonts:

- **Display:** `Bebas Neue` — panel titles, large active skill name.
- **Body:** `DM Sans` — tabs, labels, toolbar inputs, buttons.
- **Mono:** `JetBrains Mono` — timestamps, tool names, file paths, result counts.

Scale for new controls:

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `toolbar-label` | 0.6875rem | 600 | fieldset legends, chip labels |
| `toolbar-input` | 0.875rem | 400 | search field, selects |
| `toolbar-button` | 0.75rem | 600 | export/clear/filter buttons |
| `toolbar-meta` | 0.75rem | 500 | result count, shortcut hint |
| `filter-chip` | 0.75rem | 500 | checkbox + label inside filter panel |

Letter spacing: 0.04em on labels, 0.06em on uppercase buttons.

## Layout Structure

### Desktop (≥1024px)

```
+-------------------------------------------------------------+
|  CREWLOOP · DASHBOARD              [theme] [session ▼]      |
+--------------------------------+-----------------------------+
|                                |  [search][scope][Filters▼]  |
|  ACTIVE SKILL                  |  [Sort ▼][JSON][CSV][Clear] |
|  ┌──────────────┐             |  ┌───────────────────────┐  |
|  │   icon       │             |  │ 24 events · / search  │  |
|  │  ENGINEER    │             |  +───────────────────────+  |
|  │  ● RUNNING   │             |  ┌───────────────────────┐  |
|  └──────────────┘             |  │ [Timeline][Network]   │  |
|                                |  │ [Files]               │  |
|  Telemetry                     |  +───────────────────────+  |
|                                |  │                       │  |
|                                |  │   Active view panel   │  |
|                                |  │   (scrollable)        │  |
|                                |  │                       │  |
+--------------------------------+-----------------------------+
```

- Sidebar stays 320px.
- Toolbar sits directly above the view tabs, inside the same panel.
- Filter panel opens as a compact grid below the toolbar row.
- Active view panel fills remaining height and scrolls internally.

### Tablet (768–1023px)

- Sidebar stacks horizontally above the main content.
- Toolbar wraps into two rows: search + scope on the first; filters, sort, exports, clear on the second.
- Filter panel becomes a two-column grid.
- Files view keeps list + detail side-by-side, but list shrinks to 220px.

### Mobile (<768px)

- Sidebar becomes a compact horizontal summary strip.
- Toolbar stacks vertically: full-width search, then a row of filter toggle + sort + export/clear.
- Filter panel is a single column.
- Files view becomes drill-in: list full width; selecting a file replaces the list with the detail panel and shows a back button.
- No horizontal scroll on the main viewport.

## Component Specs

### Toolbar Root

```css
.dashboard-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px 0;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--toolbar-border);
  flex-shrink: 0;
}
```

### Toolbar Row

```css
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 40px;
}
```

All direct children have `flex-shrink: 0` except the search wrapper, which uses `flex: 1; min-width: 0;`.

### Search Input

```css
.toolbar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  background: var(--toolbar-input-bg);
  border: 1px solid var(--toolbar-border);
  border-radius: 8px;
}

.toolbar-search i {
  color: var(--text-muted);
  font-size: 1rem;
  flex-shrink: 0;
}

.toolbar-search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  outline: none;
}

.toolbar-search select {
  background: var(--bg-surface);
  border: 1px solid var(--toolbar-border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 4px 8px;
  cursor: pointer;
}

.toolbar-search:focus-within {
  border-color: var(--toolbar-input-focus);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
}
```

Placeholder text: `"Search events..."` in `--text-muted`.

Search scope options: `All`, `Tool`, `Detail`, `Skill`, `Path`, `Snippet`.

### Toolbar Buttons

```css
.toolbar-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--toolbar-border);
  background: var(--bg-elevated);
  color: var(--toolbar-text);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  min-height: 36px;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.toolbar-button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.toolbar-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toolbar-button.active {
  background: var(--toolbar-chip-active-bg);
  border-color: var(--toolbar-chip-active-border);
  color: var(--accent);
}
```

Buttons:

- **Filters** — toggles the filter panel; uses `.active` when panel is open. Icon: `ph-faders`.
- **JSON** — export JSON. Icon: `ph-file-json`.
- **CSV** — export CSV. Icon: `ph-file-csv`.
- **Clear** — resets search/filters/sort. Icon: `ph-x`.

Icon-only buttons on mobile still have visible text when space allows; on very small screens, collapse to icon-only with `aria-label`.

### Sort Dropdown

```css
.toolbar-sort {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--toolbar-border);
  background: var(--bg-elevated);
  color: var(--toolbar-text);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  min-height: 36px;
}

.toolbar-sort:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Options:

- `Newest first` (time desc)
- `Oldest first` (time asc)
- `Status` (status asc)
- `Type` (type asc)
- `Skill` (skill asc)

### Filter Panel

```css
.toolbar-filters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 14px 0 4px;
  border-top: 1px solid var(--toolbar-border);
}

.toolbar-filters[hidden] {
  display: none;
}

.filter-group {
  border: 1px solid var(--toolbar-border);
  border-radius: 8px;
  padding: 12px;
  margin: 0;
  background: var(--bg-inset);
}

.filter-group legend {
  padding: 0 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.75rem;
  transition: background-color 0.15s ease;
}

.filter-chip:hover {
  background: var(--toolbar-chip-bg);
}

.filter-chip input {
  accent-color: var(--accent);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.filter-chip.active {
  background: var(--toolbar-chip-active-bg);
  color: var(--accent);
}
```

Groups:

1. **Status** — chips for `running`, `success`, `error`. Each chip shows a small colored dot + label.
2. **Tool type** — chips for each distinct tool seen in the session (e.g. `Read`, `Write`, `Bash`, `Edit`).
3. **Skill** — chips for each distinct skill seen in the session.
4. **Time range** — a single `<select>` with `All`, `Last 1 minute`, `Last 5 minutes`, `Last 15 minutes`, `Last hour`.

When a chip is checked, apply `.active` to the label wrapper for a subtle filled background.

### Toolbar Meta Row

```css
.toolbar-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 12px;
  font-size: 0.75rem;
  color: var(--toolbar-meta-text);
}

.result-count {
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.shortcut-hint {
  display: flex;
  align-items: center;
  gap: 6px;
}

.shortcut-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--toolbar-border);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-secondary);
}
```

- Left: `"24 events"`.
- Right: `Press <kbd>/</kbd> to search · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> switch tabs · <kbd>Esc</kbd> clear`.

### Scroll Containers

Ensure panels never expand the viewport:

```css
.view-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.view-panel {
  flex: 1;
  display: none;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.view-panel.active {
  display: flex;
}

.panel-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
```

Apply `.panel-scroll-container` to `.timeline`, `.files-list`, and `.file-diff`. The Network view already uses a canvas that fills its container.

## Motion Choreography

| Interaction | Animation | Timing | Easing |
|-------------|-----------|--------|--------|
| Filter panel open/close | `grid-template-rows` is not animatable; use `opacity` 0→1 and `translateY(-6px)→0` on the panel content | 200ms | ease-out |
| Toolbar button hover | `border-color`, `color`, `background-color` | 150ms | ease |
| Search focus | `box-shadow` opacity + `border-color` | 150ms | ease |
| Chip active toggle | `background-color` | 150ms | ease |
| New filtered rows entering | reuse existing `slideIn` from timeline rows; do not add new animation |
| Sort change | rows cross-fade opacity 0.15→1 | 150ms | ease |
| Export button click | quick scale `1→0.96→1` | 100ms | ease-in-out |
| Shortcut hint kbd press | `background-color` flash to `--accent-dim` | 100ms | ease |

**Reduced motion:** wrap all transitions inside a `prefers-reduced-motion` block that sets transition durations to `0.01ms` and disables panel translate/opacity animation. The filter panel toggles instantly.

```css
@media (prefers-reduced-motion: reduce) {
  .dashboard-toolbar,
  .dashboard-toolbar *,
  .toolbar-filters,
  .filter-chip {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

## Responsive Behavior

### Breakpoints

- **Desktop:** ≥1024px
- **Tablet:** 768px–1023px
- **Mobile:** <768px

### Toolbar responsive rules

```css
@media (max-width: 1023px) {
  .toolbar-row {
    gap: 8px;
  }

  .toolbar-filters {
    grid-template-columns: repeat(2, 1fr);
  }

  .files-list {
    width: 220px;
  }
}

@media (max-width: 767px) {
  .dashboard-toolbar {
    padding: 12px 16px 0;
  }

  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-search,
  .toolbar-button,
  .toolbar-sort {
    width: 100%;
  }

  .toolbar-button-row {
    display: flex;
    gap: 8px;
  }

  .toolbar-button-row .toolbar-button {
    flex: 1;
  }

  .toolbar-filters {
    grid-template-columns: 1fr;
  }

  .files-viewport {
    flex-direction: column;
  }

  .files-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-default);
  }

  .files-list.hidden {
    display: none;
  }

  .file-diff {
    width: 100%;
  }

  .file-diff-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

### Mobile Files drill-in

When a file is selected on mobile:

- Hide `.files-list` (`display: none`).
- Show `.file-diff` full width.
- Render a back button at the top of `.file-diff`:
  - Icon: `ph-arrow-left`
  - Text: `"Back to files"`
  - Style: `.toolbar-button` with left alignment.

## Accessibility

- **Color is not the only signal:** each status chip includes a text label; timeline rows already show an outcome icon.
- **Focus states:** all buttons, inputs, selects, and checkbox labels have a visible `outline: 2px solid var(--accent)` on `:focus-visible`.
- **Labels:** every input and select has an associated `<label>` or `aria-label`. Icon-only buttons on mobile have `aria-label`.
- **Keyboard navigation:** tab order follows visual order; checkboxes are focusable; filter panel toggles with the Filters button.
- **Screen reader:** `result-count` is announced on change using `aria-live="polite"` on the meta row.
- **Reduced motion:** all motion is suppressed via the media query above.

## Asset List

- **Icons:** Phosphor Icons (already loaded). New icons used:
  - `ph-magnifying-glass` — search
  - `ph-faders` — filters toggle
  - `ph-sort-ascending` — sort (optional)
  - `ph-file-json` — JSON export
  - `ph-file-csv` — CSV export
  - `ph-x` — clear
  - `ph-arrow-left` — mobile files back
- **No new images or custom illustrations.** All visuals are CSS + canvas.

## Pre-Implementation Checklist

- [ ] Contrast ratios verified for toolbar text on `--toolbar-bg` and `--bg-inset`.
- [ ] Touch targets ≥44×44px for all toolbar buttons, selects, and chips.
- [ ] Reduced motion alternative defined and scoped to `.dashboard-toolbar` and children.
- [ ] Mobile layout preserves command-center density without horizontal scroll.
- [ ] Focus states designed for search, buttons, selects, and filter chips.
- [ ] No emoji used as structural icons.
- [ ] `aria-label` added to any icon-only button on narrow screens.
