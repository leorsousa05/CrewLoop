# UI/UX Design: Dashboard Vercel-Style Command Center

## Aesthetic direction

The dashboard adopts a **developer command-center** aesthetic inspired by Vercel: high-contrast, geometric, and information-dense without feeling cluttered. The personality is utilitarian but refined — monospace data, crisp borders, an amber accent against near-black surfaces, and generous use of negative space inside panels. Every element should feel like a precision instrument: clear hierarchy, predictable alignment, and motion that communicates state rather than decorating it.

## Design pillars

### 1. Typography

Keep the existing type pairing. It already matches the industrial direction.

- **Display / view titles:** `Teko`, uppercase, wide tracking.
- **Body / data:** `JetBrains Mono`, 14px base, 1.5 line-height.
- **Labels / captions:** `JetBrains Mono`, 11px–12px, uppercase, wide tracking (`tracking-widest`).

Type scale:

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `display-xl` | 64px | 500 | Active skill name in Overview hero |
| `display-lg` | 40px | 500 | View titles ("TIMELINE", "SETTINGS") |
| `display-md` | 32px | 500 | Section headlines in Overview |
| `heading` | 18px | 600 | Card titles, panel headers |
| `body` | 14px | 400 | Timelines, file lists, body copy |
| `caption` | 12px | 500 | Metadata, timestamps |
| `label` | 11px | 600 | Uppercase labels, badges |

### 2. Color system

Reuse the existing CSS variable tokens. Extend only with density-aware surface tints if necessary.

Dark mode (default):

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#070708` | App background |
| `--bg-surface` | `#0e0e10` | Panels, sidebar, cards |
| `--bg-elevated` | `#16161a` | Hover states, input backgrounds, active row |
| `--bg-inset` | `#050506` | Activity graph canvas, deep insets |
| `--border-default` | `#27272a` | Panel borders, dividers |
| `--border-strong` | `#3f3f46` | Focused/hover borders |
| `--text-primary` | `#f4f4f5` | Primary text |
| `--text-secondary` | `#a1a1aa` | Secondary text, labels |
| `--text-muted` | `#52525b` | Disabled, placeholders, inactive icons |
| `--accent` | `#f59e0b` | Active view indicator, primary buttons, telemetry values |
| `--accent-dim` | `#78350f` | Amber glows and very subtle accents |
| `--success` | `#22c55e` | Success status, edit operations |
| `--error` | `#ef4444` | Error status, deleted lines |
| `--running` | `#38bdf8` | Running status, read operations |
| `--warning` | `#eab308` | Starting/warning states |

Light mode: invert surfaces to white/gray-100 and keep the same semantic mapping. The accent shifts to a slightly deeper amber (`#d97706`) for contrast.

New optional token:

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.35)` | Command palette backdrop |

### 3. Spatial composition

Global chrome:

```
+----------------------------------------------------------+
| TopBar        56px height                                |
+----------+-----------------------------------------------+
| Sidebar  | Main Content                                  |
| 240px    |                                               |
| desktop  |                                               |
+----------+-----------------------------------------------+
```

- **TopBar** is fixed, full-width, `height: 56px`, `z-index: 50`.
- **Sidebar** is fixed left, `width: 240px`, full height minus TopBar, `z-index: 40`.
- **Main Content** sits to the right of the sidebar with `padding: 24px`, internal scrolling.
- All scrolling happens inside panels or main content; the chrome never scrolls.

Panel rules:

- Border radius: `8px` (`rounded-lg`).
- Border: `1px solid var(--border-default)`.
- Internal padding: `16px` default, `12px` in compact density.
- Shadow: none by default; use a subtle shadow only for floating layers (command palette, dropdowns).

Grid rhythm:

- Base gap: `16px` between panels.
- Compact gap: `12px`.
- Use a 4px base grid for all spacing, heights, and radii.

### 4. Layout structure

#### TopBar

Left section:
- Hamburger menu button on mobile/tablet.
- Brand wordmark: `CREWLOOP` in `font-display`, `text-xl`, `tracking-widest`.
- Breadcrumb separator (`·`) in `text-muted`.
- Current view title in `text-secondary`, `text-xs`, `uppercase`, `tracking-widest`.

Right section:
- Connection status dot + label (optional on desktop, icon-only on tablet).
- Command palette trigger: button showing `⌘K` / `Ctrl+K` hint plus "Search" label on desktop.
- Theme toggle icon button.
- Session selector (same component as today, restyled to match top bar).

Height: `56px`.
Background: `bg-surface`.
Border bottom: `1px solid var(--border-default)`.

#### Sidebar

Navigation items stacked vertically with `8px` gap.

Each item:
- Height: `40px` desktop, `44px` touch target.
- Layout: `24px` icon + `12px` gap + label.
- Border radius: `8px`.
- Inactive: `text-secondary`, transparent background, hover `bg-elevated`.
- Active: `text-primary`, `bg-elevated`, left `3px` accent border.
- Active indicator animates with a 200ms translate-x slide.

Sections:
- Top group: Overview, Sessions, Timeline, Network, Files, Skills.
- Bottom group: Settings (visually separated by a divider).

At tablet width, collapse to icon-only rail `64px` wide with tooltips on hover/focus.
At mobile width, hide behind a slide-out drawer with a scrim overlay.

#### Main content area

Always contains:
1. `ViewHeader` — title + actions.
2. `FilterBar` (where relevant) — search + filter chips.
3. View-specific content.

### 5. Density modes

Apply a wrapper class `density-compact` or `density-comfortable` on the app root.

Comfortable (default):
- Sidebar item height: `40px`, padding `8px 12px`.
- Timeline row padding: `py-2 px-2.5`.
- File list button padding: `p-2.5`.
- FilterBar height: `48px`.
- Panel gap: `16px`.

Compact:
- Sidebar item height: `32px`, padding `6px 10px`.
- Timeline row padding: `py-1 px-2`.
- File list button padding: `p-2`.
- FilterBar height: `40px`.
- Panel gap: `12px`.
- Font size in lists: `13px` (from `14px`).

Use CSS custom properties or Tailwind arbitrary utilities driven by the density class. Do not redefine the entire theme.

### 6. Component specs

#### Command palette

Trigger appearance:
- Button in TopBar with `MagnifyingGlass` icon, "Search" label, and a small kbd-style `⌘K` badge.
- On tablet/mobile: icon-only button with `aria-label="Open command palette"`.

Modal behavior:
- Centered vertically, `max-width: 640px`, `width: calc(100% - 32px)`.
- Backdrop: `--overlay` with `backdrop-blur-sm`.
- Container: `bg-surface`, `rounded-xl`, `border border-border-default`, subtle shadow.
- Animation: fade backdrop 150ms, scale container from `0.96` to `1` + translate-y `8px` to `0` over 200ms `ease-out`. Exit: 150ms `ease-in` reversed.

Internal structure:
- Search input at top: transparent background, `border-b border-border-default`, `py-3 px-4`, placeholder "Search views, sessions, skills, tools, files...".
- Shortcut hint on right side of input: `Esc to close`.
- Results grouped by type: Views, Sessions, Skills, Tools, Files, Events, Actions.
- Section header: `text-[11px] uppercase tracking-widest text-text-muted px-4 py-2`.
- Result row: `px-4 py-2.5 flex items-center gap-3 hover:bg-elevated cursor-pointer`.
- Active row: `bg-elevated` + accent left border.
- Result icon: `20px`, `text-accent` for view/action, `text-secondary` for data items.
- Result title: `text-sm text-text-primary`.
- Result subtitle: `text-xs text-text-muted`.
- Empty state: centered `text-text-muted` with `MagnifyingGlass` icon.

Keyboard behavior:
- `ArrowUp`/`ArrowDown` moves active item.
- `Enter` activates selected item.
- `Esc` closes palette and restores focus to trigger.
- Focus trap inside modal.

#### FilterBar

Default state:
- Horizontal bar with: search input, filter chips dropdown, clear button, result count, export button.
- Height: `48px` comfortable / `40px` compact.
- Background: transparent (part of the view header area).
- Border bottom: `1px solid var(--border-default)`.

Search input:
- Left `MagnifyingGlass` icon.
- Clear button appears when query is non-empty.
- Placeholder: "Filter events...".

Filter chips:
- Each chip is a small button showing the active count for that dimension (e.g., "Status 2").
- Click opens a popover panel below the chip.
- Popover: `bg-surface`, `border`, `rounded-lg`, `shadow-lg`, `p-3`, `min-width: 180px`.
- Each option is a checkbox row.
- Selected options use an accent checkmark.

Active filter summary:
- If filters are active, show a "Clear all" text button and a count pill (e.g., "3 filters").
- Result count: "24 events" in `text-muted`.

Export button:
- Icon-only `DownloadSimple` button with `aria-label="Export JSON"`.
- On click, shows a small dropdown with "Export JSON" (CSV deferred).

#### Sidebar item

```
+--------------------------------+
|  [icon]  Label                 |
+--------------------------------+
```

States:
- Default: `text-secondary`, `bg-transparent`.
- Hover: `bg-elevated`, `text-primary`.
- Active: `bg-elevated`, `text-primary`, left `3px` accent border via `::before` pseudo-element.
- Focus-visible: global `outline: 2px solid var(--accent)`.

Active indicator:
- `::before` element `3px` wide, full height, `bg-accent`, positioned absolute left.
- Animate from `translateX(-4px) opacity(0)` to `translateX(0) opacity(1)` on activation.

#### Session list item (SessionsView)

Layout:
```
+--------------------------------------------------+
| [pin] [status]  id / skill        source   time  |
+--------------------------------------------------+
```

- Pin icon: `PushPin` / `PushPinSlash`, `text-muted` when unpinned, `text-accent` when pinned.
- Status dot: same lifecycle colors as ActiveSkillPanel.
- Primary text: truncated session id or skill name, `font-mono`.
- Secondary text: duration and last activity.
- Source badge: small uppercase pill on the right.
- Hover: `bg-elevated`.
- Active: left accent border + `bg-elevated`.

#### Overview cards

Use a Bento-style grid:

```
+------------+------------+------------+
| Active     | Telemetry  | Activity   |
| Skill      | cards      | Graph      |
+------------+------------+------------+
| Recent     | Top Skills | Top Files  |
| Events     |            |            |
+------------+------------+------------+
```

- Cards use the same `.panel` style.
- Numbers are `font-display`, `text-4xl`, `text-accent`.
- Labels are `label` style.
- Activity graph spans 2 columns on desktop.

#### Timeline

Keep the existing timeline visual language but adapt to density.

- Container: `overflow-y-auto`, internal padding `px-5 py-3`.
- Connector line: `1px` vertical line through status dots, `var(--border-default)`.
- Row: grid `56px 16px 1fr auto`, gap `12px`.
- Status dot: `8px` circle, centered on the connector.
- Running dot: `animate-pulse` unless reduced motion.
- Expanded detail: `bg-inset`, `border`, `rounded`, `p-3`.
- Copy button inside expanded detail and on hover of the row (icon-only `Copy`, `aria-label="Copy event"`).

#### Network view

- 3D graph fills the panel.
- Overlay detail card: absolute top-right, `w-72`, `bg-surface`, `border`, `rounded-lg`, `shadow-lg`, `p-4`.
- Bottom-left floating legend: small pills for skill/tool/file colors.
- No spinning auto-rotation; camera is user-controlled.

#### Files view

- Two-pane layout: file list `280px` wide, diff viewer fills remaining space.
- File list item: icon, truncated path, op pills.
- Diff viewer: header with path and op pills, body with `whitespace-pre` lines.
- Line colors: `+` green, `-` red, `@@` muted.

### 7. Motion choreography

Allowed properties: `transform`, `opacity`.
Disallowed: `width`, `height`, `top`, `left`, `margin`, `padding`.

| Interaction | Duration | Easing | Effect |
|-------------|----------|--------|--------|
| Sidebar active indicator | 200ms | `ease-out` | `translateX(-4px)` → `0`, `opacity` 0 → 1 |
| Command palette open | 200ms | `ease-out` | Backdrop fade; container `scale(0.96)` + `translateY(8px)` → normal |
| Command palette close | 150ms | `ease-in` | Reverse of open |
| Filter popover open | 150ms | `ease-out` | `opacity` 0 → 1, `translateY(-4px)` → 0 |
| Panel hover | 150ms | `ease-out` | Background color transition only |
| View switch | 150ms | `ease-out` | Fade opacity 0 → 1 on content swap |
| Toast / inline confirmation | 200ms enter, 150ms leave | `ease-out` / `ease-in` | `translateY(4px)` + opacity |
| Running spinner | 1s | linear | `rotate` (honor reduced motion) |

Reduced motion:
- All transitions collapse to `0.01ms` via existing CSS media query.
- Command palette appears instantly without scale/translate.
- No hover lift or running spinner.

### 8. Iconography

Continue using **Phosphor Icons** (`@phosphor-icons/react`). Weight: `regular` default, `bold` for active states.

Required icons:

| Purpose | Icon name |
|---------|-----------|
| Overview | `House` |
| Sessions | `Rows` |
| Timeline | `Clock` |
| Network | `Graph` |
| Files | `Files` |
| Skills | `ChartPie` |
| Settings | `Gear` |
| Search / Command palette | `MagnifyingGlass` |
| Theme dark | `Moon` |
| Theme light | `Sun` |
| Density compact | `ArrowsInLineVertical` |
| Density comfortable | `ArrowsOutLineVertical` |
| Pin | `PushPin` |
| Pin filled | `PushPinSlash` |
| Export | `DownloadSimple` |
| Copy | `Copy` |
| Close | `X` |
| Clear filters | `XCircle` |
| Filter | `Faders` |
| Check | `Check` |
| Menu (mobile) | `List` |

### 9. Responsive behavior

Breakpoints:

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | TopBar only; Sidebar is a drawer; single-column views; Files drill-in |
| Tablet | 768–1023px | Icon-only sidebar rail (64px); views keep two columns where possible |
| Desktop | 1024–1439px | Full sidebar (240px); Bento grid in Overview |
| Wide | ≥ 1440px | Full sidebar; wider main content, larger Bento cells |

Mobile specifics:
- TopBar hamburger opens Sidebar drawer.
- Drawer: `width: 280px`, slides from left, scrim backdrop.
- Sessions list becomes full-width cards.
- Files view: list full width; selecting a file replaces list with diff + back button.
- Command palette stays centered modal but uses full width minus 16px.

Tablet specifics:
- Sidebar rail shows icons only.
- Labels appear as tooltips on hover/focus.
- TopBar keeps search trigger and session selector.

### 10. Accessibility

- Focus visible: all interactive elements use the global `outline: 2px solid var(--accent)` with `2px` offset.
- Icon-only buttons must have `aria-label` or tooltip.
- Command palette: focus trap, `role="dialog"`, `aria-modal="true"`, restore focus on close.
- Sidebar: use `<nav aria-label="Main">` and `<a>` or `<button>` with `aria-current="page"` for active view.
- Filter popovers: associate trigger with panel via `aria-controls` and `aria-expanded`.
- Color meaning: every status color is paired with an icon or text label.
- Reduced motion: honor `prefers-reduced-motion: reduce`.
- Touch targets: minimum `44×44px` for all interactive elements; expand invisible hit area if visual is smaller.

### 11. Asset list

- No raster images required.
- All icons from `@phosphor-icons/react`.
- Fonts already loaded via Google Fonts (`Teko`, `JetBrains Mono`).
- Optional: subtle noise texture overlay (`opacity: 0.03`, `pointer-events: none`) for atmosphere — defer if it impacts performance.

## Pre-implementation checklist

- [ ] Contrast ratios verified for `--text-primary` on `--bg-surface` and `--accent` on dark surfaces.
- [ ] All touch targets ≥ 44×44px.
- [ ] Reduced-motion alternatives defined for every animation.
- [ ] Mobile layout preserves the command-center personality (drawer, full-width lists).
- [ ] Focus states designed for Sidebar, TopBar, CommandPalette, and FilterBar.
- [ ] No emoji used as structural icons.
- [ ] Icon names mapped in the existing `Icon` component map.
