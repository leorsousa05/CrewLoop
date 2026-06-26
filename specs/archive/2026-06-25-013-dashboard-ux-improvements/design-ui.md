# UI/UX Design Specification: Dashboard Improvements

## Aesthetic Direction

**Industrial Command-Center.** The dashboard is a developer tool, not a marketing page. Keep the existing dark, high-density, data-first atmosphere: near-black surfaces, cyan accent for the active skill, monospace for tool data, and generous use of semantic color (blue/green/red) to encode state. The new views (Network, Files) should feel like adjacent panes of the same control room, not separate apps.

## Color System

Reuse existing CSS variables. Add semantic timeline tokens for consistency:

```css
:root {
  /* existing tokens preserved */
  --accent: #22d3ee;
  --success: #4ade80;
  --error: #fb7185;
  --running: #38bdf8;

  /* new timeline-specific tokens */
  --timeline-running: var(--running);
  --timeline-success: var(--success);
  --timeline-error: var(--error);
  --timeline-running-bg: rgba(56, 189, 248, 0.10);
  --timeline-success-bg: rgba(74, 222, 128, 0.10);
  --timeline-error-bg: rgba(251, 113, 133, 0.10);
  --timeline-hover-bg: rgba(255, 255, 255, 0.03);
}
```

Light mode uses the existing flipped values; the new tokens flip automatically because they alias the base tokens.

## Typography

Keep existing fonts:

- **Display:** `Bebas Neue` — large active skill name, section titles.
- **Body:** `DM Sans` — tabs, labels, file paths.
- **Mono:** `JetBrains Mono` — timestamps, tool names, detail JSON.

Scale:

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `timeline-time` | 0.75rem | 400 | timestamp |
| `timeline-tool` | 0.875rem | 500 | tool name |
| `timeline-detail` | 0.875rem | 400 | summary |
| `tab-label` | 0.75rem | 600 | view tabs |
| `file-path` | 0.875rem | 500 | file path |
| `diff-line` | 0.8125rem | 400 | diff content |

## Layout Structure

```
+-------------------------------------------------------------+
|  CREWLOOP · DASHBOARD              [theme] [session ▼]      |
+--------------------------------+-----------------------------+
|                                |  [Timeline][Network][Files] |
|  ACTIVE SKILL                  |  +-----------------------+  |
|  ┌──────────────┐             |  |                       |  |
|  │   icon       │             |  |   Main view panel     |  |
|  │  ENGINEER    │             |  |   (timeline/network/  |  |
|  │  ● RUNNING   │             |  |    files)             |  |
|  └──────────────┘             |  |                       |  |
|                                |  +-----------------------+  |
|  Telemetry                     |                             |
+--------------------------------+-----------------------------+
```

- Sidebar stays fixed at 320px.
- Main content gets a tab bar just below the header.
- Each view panel fills the remaining height and scrolls independently.

## Component Specs

### View Tabs

```css
.view-tabs {
  display: flex;
  gap: 8px;
  padding: 0 0 12px;
}

.view-tab {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.view-tab:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.view-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg-base);
}

.view-tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Timeline Row

Grid: `56px 16px 1fr auto` (time | dot | main | outcome).

```css
.timeline-item {
  display: grid;
  grid-template-columns: 56px 16px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 0;
  border-left: 2px solid transparent;
  border-radius: 0 6px 6px 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.timeline-item.running { border-left-color: var(--timeline-running); background: var(--timeline-running-bg); }
.timeline-item.success { border-left-color: var(--timeline-success); background: var(--timeline-success-bg); }
.timeline-item.error   { border-left-color: var(--timeline-error);   background: var(--timeline-error-bg); }

.timeline-item:hover { background-color: var(--timeline-hover-bg); }
.timeline-item.expanded { background-color: var(--bg-elevated); }

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  justify-self: center;
  margin-top: 6px;
}

.timeline-dot.running { background: var(--timeline-running); animation: pulse 1.2s ease-in-out infinite; }
.timeline-dot.success { background: var(--timeline-success); }
.timeline-dot.error   { background: var(--timeline-error); }
```

**Expanded detail panel:**

```css
.timeline-detail-panel {
  grid-column: 3 / -1;
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.timeline-item.expanded .timeline-detail-panel {
  opacity: 1;
  transform: translateY(0);
}
```

Use `<pre><code>` blocks for JSON; escape HTML. Add labels "INPUT" / "OUTPUT" above each block.

### Hover Pause Overlay

When the mouse enters the timeline container, show a subtle badge:

```css
.timeline-pause-badge {
  position: absolute;
  top: 12px;
  right: 20px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.timeline:hover .timeline-pause-badge {
  opacity: 1;
}
```

Cursor becomes `ns-resize` or default; do not change to `pointer` unless hovering a clickable row.

### Network Graph

Full-panel canvas. Nodes:

| Type | Shape | Size | Fill | Stroke |
|------|-------|------|------|--------|
| skill | circle | 24px | var(--accent) | var(--accent-hover) |
| tool | rounded square (6px radius) | 16px | var(--bg-elevated) | var(--border-strong) |
| file | diamond (rotate 45deg) | 12px | var(--text-secondary) | var(--border-strong) |

Edges: 1px `var(--border-default)` with 40% opacity.

Labels: skill/tool labels in `var(--font-body)` 0.75rem; file labels only on hover to avoid clutter.

Legend top-right, compact row of icon + label.

### File Activity

Two-column layout on desktop: list on the left (40%), diff/preview on the right (60%).

```css
.file-list {
  border-right: 1px solid var(--border-default);
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-default);
  cursor: pointer;
  transition: background 0.15s ease;
}

.file-item:hover,
.file-item.active {
  background: var(--bg-elevated);
}

.file-item.read i { color: var(--accent); }
.file-item.edit i { color: var(--success); }

.file-diff {
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  overflow-x: auto;
}
```

Diff lines:

- added: `color: var(--success); background: rgba(74,222,128,0.08);`
- removed: `color: var(--error); background: rgba(251,113,133,0.08);`
- context: `color: var(--text-secondary);`

## Motion Choreography

| Interaction | Animation | Timing | Easing |
|-------------|-----------|--------|--------|
| New timeline row | `opacity 0→1`, `translateY(8px)→0` | 200ms | ease-out |
| Status class swap | `background-color`, `border-color` | 200ms | ease |
| Expand detail | `opacity`, `translateY(-4px)→0` | 200ms | ease-out |
| Tab switch | cross-fade panels `opacity` | 150ms | ease |
| Pause badge | `opacity` | 150ms | ease |
| Graph node enter | `scale(0)→scale(1)` | 250ms | ease-out (stagger 20ms) |
| Graph edge enter | `opacity` | 200ms | ease |

**Reduced motion:** all animations become instant (`transition: none`) when `prefers-reduced-motion: reduce` is active.

## Asset List

- **Icons:** Phosphor Icons (already loaded). Use:
  - `ph-clock` for timestamp
  - `ph-play-circle` / `ph-check-circle` / `ph-x-circle` for running/success/error
  - `ph-file-text` for read files
  - `ph-pencil-simple` for edited files
  - `ph-brain` for skill node
  - `ph-wrench` for tool node
  - `ph-share-network` for network tab
  - `ph-list-dashes` for timeline tab
- **No images or custom illustrations required.** The graph is generated on canvas.

## Responsive Behavior

- **Desktop (≥1024px):** sidebar + main with tabs; file view split.
- **Tablet (768–1023px):** sidebar stacks above main; file view split.
- **Mobile (<768px):** sidebar becomes horizontal summary strip; file view becomes full-width list with drill-in detail panel.

## Accessibility

- Color alone never communicates state: each status row also shows an outcome label or icon.
- All interactive elements (tabs, rows, file items) have visible `:focus-visible` outlines.
- Tool detail JSON is escaped and rendered as plain text.
- Reduced motion preference disables movement animations.
- Timeline hover pause does not prevent keyboard users from accessing new events via scroll.

## Pre-Implementation Checklist

- [ ] Contrast ratios verified (body text ≥4.5:1, large text ≥3:1).
- [ ] Touch targets ≥44×44px for tabs and file rows.
- [ ] Reduced motion alternative defined.
- [ ] Mobile layout preserves the command-center density.
- [ ] Focus states designed for tabs, rows, and file items.
- [ ] No emoji used as structural icons.
