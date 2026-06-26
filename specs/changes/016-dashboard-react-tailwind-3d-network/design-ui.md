# UI/UX Design Spec: CrewLoop Dashboard Rewrite

## Aesthetic Direction

**Industrial / Tactical Control Room.**

The dashboard is a mission-control surface for monitoring autonomous agents. Every pixel serves a function: high-contrast data, monospace typography, and an amber warning-light accent on a near-black ground. The personality is serious, precise, and quietly confident — designed to look credible when demoed to others while remaining comfortable for long debugging sessions. Decorative elements are banned; depth comes from grid lines, subtle panel borders, and choreographed motion, not from gradients or ornament.

---

## Color System

### Semantic tokens (CSS variables)

| Token | Dark value | Light value | Usage |
|-------|------------|-------------|-------|
| `--bg-base` | `#070708` | `#f4f4f5` | Page background |
| `--bg-surface` | `#0e0e10` | `#ffffff` | Panels/cards |
| `--bg-elevated` | `#16161a` | `#e4e4e7` | Hover states, selected rows |
| `--bg-inset` | `#050506` | `#d4d4d8` | Code blocks, diff backgrounds |
| `--border-default` | `#27272a` | `#d4d4d8` | Panel borders, dividers |
| `--border-strong` | `#3f3f46` | `#a1a1aa` | Focus rings, active borders |
| `--text-primary` | `#f4f4f5` | `#18181b` | Headings, primary text |
| `--text-secondary` | `#a1a1aa` | `#52525b` | Labels, metadata |
| `--text-muted` | `#52525b` | `#a1a1aa` | Timestamps, hints |
| `--accent` | `#f59e0b` | `#d97706` | Primary accent: active skill strip, selected tab, icons |
| `--accent-dim` | `#78350f` | `#fcd34d` | Accent backgrounds (badges) |
| `--success` | `#22c55e` | `#16a34a` | Success/end states |
| `--error` | `#ef4444` | `#dc2626` | Error states |
| `--warning` | `#eab308` | `#ca8a04` | Starting/warning states |
| `--running` | `#38bdf8` | `#0284c7` | Running/live states |

### Notes

- **Amber replaces the previous cyan** as the signature accent. Cyan is retained only for the `running` state to preserve semantic clarity (blue = live, amber = attention).
- Surfaces are layered using lightness steps, not shadows.
- All semantic colors maintain ≥4.5:1 contrast against their respective backgrounds.

---

## Typography System

### Font families

- **Display / brand / large skill name:** `Teko` (Google Fonts) — tall, condensed, industrial.
- **UI / body / labels / data:** `JetBrains Mono` (Google Fonts) — technical, monospace, readable at small sizes.

### Type scale

| Element | Font | Size | Weight | Line-height | Letter-spacing | Case |
|---------|------|------|--------|-------------|----------------|------|
| Brand logo | Teko | 1.5rem (24px) | 600 | 1 | 0.08em | uppercase |
| Active skill name | Teko | 4rem (64px) | 600 | 0.9 | 0.02em | uppercase |
| Panel title | JetBrains Mono | 0.75rem (12px) | 500 | 1 | 0.08em | uppercase |
| Telemetry value | JetBrains Mono | 2rem (32px) | 600 | 1 | -0.02em | — |
| Telemetry label | JetBrains Mono | 0.6875rem (11px) | 500 | 1 | 0.06em | uppercase |
| Timeline tool | JetBrains Mono | 0.875rem (14px) | 600 | 1.4 | 0 | — |
| Timeline detail | JetBrains Mono | 0.875rem (14px) | 400 | 1.4 | 0 | — |
| Timeline time | JetBrains Mono | 0.75rem (12px) | 400 | 1 | 0 | — |
| Body / button | JetBrains Mono | 0.875rem (14px) | 500 | 1.5 | 0 | — |
| File path / code | JetBrains Mono | 0.8125rem (13px) | 400 | 1.6 | 0 | — |
| Status badge | JetBrains Mono | 0.6875rem (11px) | 600 | 1 | 0.04em | uppercase |

### Notes

- Use tabular nums for all numeric data (`font-variant-numeric: tabular-nums`).
- Truncate long paths with `…` and show full path in a native `title` attribute or tooltip.

---

## Layout Structure

### Desktop (≥1024px)

```
+--------------------------------------------------------+
|  CREWLOOP · DASHBOARD          [⚙] [SESSION ▼]       |
+--------------+-----------------------------------------+
|              |                                         |
|  ACTIVE      |  SKILL ACTIVITY  (mini bar chart)       |
|  SKILL       |                                         |
|              +-----------------------------------------+
|  TELEMETRY   |                                         |
|              |  [TIMELINE] [NETWORK] [FILES]           |
|              |                                         |
|              |  <scrollable content>                   |
|              |                                         |
+--------------+-----------------------------------------+
```

- Header height: `56px`.
- Sidebar width: `320px`.
- Activity graph height: `180px`.
- Main content fills remaining viewport.
- All panels use `1px solid var(--border-default)` borders and `border-radius: 4px`.
- Gap between panels: `16px`.

### Tablet (768–1023px)

- Sidebar becomes a full-width top strip (active skill + telemetry inline).
- Content area sits below.

### Mobile (<768px)

- Header collapses into a single row (hamburger/session only).
- Panels stack vertically.
- Files view becomes drill-in: list full width; selecting a file replaces the list with the diff and a back button.

---

## Component Specs

### Header

- Background: `var(--bg-surface)`.
- Border-bottom: `1px solid var(--border-default)`.
- Left: brand logo (`Teko`, amber dot before "CREWLOOP" when connected).
- Right: theme toggle icon button (44×44px touch target) + session selector.
- Focus: `2px solid var(--accent)` outline, `2px` offset.

### Active Skill Panel

- Accent strip at top: `4px` height, color reflects lifecycle (`starting` warning, `running` running-cyan, `ended` muted).
- Skill icon: `64×64px` square, `1px` border, `4px` radius, amber icon.
- Skill name: `Teko 4rem`, uppercase, single line, truncate if too long.
- Status badge + confidence badge + lifecycle badge in a row, wrapped.
- Source line: source icon + source name, uppercase, muted color.
- Empty state: centered icon + "NO ACTIVE SESSION" + subtext.

### Telemetry Panel

- Three cards in a single column.
- Card background: `var(--bg-inset)`.
- Border: `1px solid var(--border-default)`, radius `4px`.
- Value: `2rem` amber, tabular.
- Label: uppercase, muted.

### Activity Graph

- Canvas-based bar chart.
- Bars: amber fill on `var(--bg-inset)` background.
- 40 buckets max.
- No animation on the bars; update only on data change.
- Reduced motion: same behavior (no motion to reduce).

### View Tabs

- Button style: uppercase, `0.75rem`, letter-spacing `0.06em`.
- Inactive: muted text, transparent bottom border.
- Active: amber text, `2px` amber bottom border.
- Hover (inactive): secondary text.
- Focus: outline on the button.

### Timeline

- Reverse chronological (newest at top).
- Vertical guide line: `1px` border color, left-aligned at `32px`.
- Each row:
  - Grid: `56px 16px 1fr auto`.
  - Time column right-aligned.
  - Status dot: `8px` circle, centered on guide line.
  - Running dot pulses with `lifecycle-pulse` animation.
  - Tool name + detail + duration pill.
  - Outcome icon (spinner/check/x).
- Row hover: `var(--bg-elevated)` background.
- Running row: subtle cyan tint background + cyan left border.
- Success row: subtle green tint background + green left border.
- Error row: subtle red tint background + red left border.
- Expanded row: inset detail panel with `input` and `output` code blocks.
- Hovering anywhere inside the timeline pauses live updates and queues them.

### Network 3D

- Full-panel canvas with transparent background.
- Node colors:
  - Skill: amber (`var(--accent)`)
  - Tool: cyan (`var(--running)`)
  - File: muted secondary (`var(--text-secondary)`)
- Node sizes scale by weight, clamped between `4` and `12`.
- Link color: `var(--border-strong)`, opacity `0.5`.
- Hover: hovered node and its direct links brighten; others dim to `0.3` opacity.
- Click node: camera smoothly pans to center it and opens a floating detail card.
- Detail card: top-right, `280px` wide, surface background, border, shows id/type/label and neighbor count.
- Reduced motion: disable auto-rotation and use instantaneous camera moves.

### Files

- Two-pane: list `280px` + detail flex.
- List item: icon + truncated path + op pills + latest status badge.
- Selected item: `1px solid var(--accent)` border, elevated background.
- Diff viewer:
  - Background: `var(--bg-inset)`.
  - Lines starting with `+`: green text, subtle green bg.
  - Lines starting with `-`: red text, subtle red bg.
  - Lines starting with `@@/---/+++`: muted text.
  - Max `80` lines shown; truncate with a "content truncated" hint.

---

## Motion Choreography

### Page load

1. Header fades in (`opacity 0→1`, `200ms`, `ease-out`).
2. Sidebar panels slide up `12px` and fade in, staggered `80ms` apart (`300ms`, `ease-out`).
3. Content panels slide up `12px` and fade in, staggered `80ms` after sidebar (`300ms`, `ease-out`).
4. Activity graph bars draw in from bottom (`scaleY 0→1`, `400ms`, `ease-out`).

### Tab switch

- Outgoing panel: fade out `100ms`.
- Incoming panel: fade in + slide up `8px`, `150ms`, `ease-out`.
- No width/height animation.

### Timeline updates

- New rows slide in from top `8px` + fade in (`200ms`, `ease-out`).
- Status transitions (running → success/error) animate background color over `250ms`.
- Expanded panel opens with `scaleY 0→1` on the detail block (`200ms`, `ease-out`), transform-origin top.

### Network 3D

- Initial graph entry: nodes fade in (`opacity 0→1`, `400ms`) as force simulation settles.
- Hover: non-adjacent nodes/links transition opacity `150ms`.
- Click focus: camera transition `400ms` with `ease-in-out`.

### Hover / focus micro-interactions

- Buttons: border color transition to accent `150ms`.
- List items: background transition `150ms`.
- Focus rings: appear instantly, `2px` accent outline.

### Reduced motion

- All translations and fades become instantaneous.
- 3D graph disables continuous rotation and camera easing.
- Pulsing running dot becomes static.

---

## Asset List

- **Icons:** `@phosphor-icons/react` — use outline/regular weight.
  - Skill icons mapped by skill name.
  - Source icons: `chat-teardrop-text` (kimi), `terminal` (codex), `planet` (agy), etc.
- **Fonts (Google Fonts):**
  - `Teko:wght@400;500;600`
  - `JetBrains Mono:wght@400;500;600`
- **Textures/effects:** Optional `noise.png` overlay at `2%` opacity on the base background (static, no animation). Not required for MVP.
- **No images or illustrations.**

---

## Pre-Implementation Checklist

- [x] Aesthetic direction chosen and documented (Industrial / Tactical Control Room).
- [x] Color contrast ratios verified conceptually (amber `#f59e0b` on `#070708` = ~8.5:1; text on surfaces ≥4.5:1).
- [x] Touch targets ≥44×44px specified for all icon buttons, tabs, and list items.
- [x] Reduced motion alternative defined (instant transitions, no rotation, static pulse).
- [x] Mobile layout preserves personality (monospace data, amber accent, panel stacking).
- [x] Focus states designed (`2px solid var(--accent)` outline, `2px` offset).
- [x] No emoji used as structural icons.
- [x] Typography limited to two families (Teko + JetBrains Mono).
