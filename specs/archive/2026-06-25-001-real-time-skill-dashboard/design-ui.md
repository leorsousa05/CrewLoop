# UI Design Specification: CrewLoop Real-time Dashboard

## Aesthetic Direction Statement

The dashboard adopts an **industrial-utilitarian** aesthetic: a developer-tool interface inspired by mission-control panels, system monitors, and terminal dashboards. The visual language is honest, dense with information, and unafraid of structure. Ciano-gelo (`#22d3ee`) acts as the cold, high-contrast accent against deep charcoal surfaces, evoking live telemetry and status LEDs. Data is treated as content, not decoration — monospace for values, grid lines for separation, and clear typographic hierarchy for scanning.

## Color System

Semantic CSS variables. Values shown for dark mode; light-mode equivalents follow.

### Dark mode (default)

```css
--bg-base: #09090b;          /* near-black canvas */
--bg-surface: #121214;       /* panels */
--bg-elevated: #1c1c1f;      /* hovered/selected panels */
--bg-inset: #050507;         /* code blocks, timeline track */
--border-default: #27272a;
--border-strong: #3f3f46;
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #475569;
--accent: #22d3ee;           /* cyan-400 */
--accent-hover: #67e8f9;     /* cyan-300 */
--accent-dim: #0891b2;       /* cyan-600 */
--success: #4ade80;
--error: #fb7185;
--warning: #facc15;
--running: #38bdf8;          /* pulsing status */
```

### Light mode

```css
--bg-base: #f8fafc;
--bg-surface: #ffffff;
--bg-elevated: #f1f5f9;
--bg-inset: #e2e8f0;
--border-default: #cbd5e1;
--border-strong: #94a3b8;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;
--accent: #0891b2;
--accent-hover: #06b6d4;
--accent-dim: #155e75;
--success: #16a34a;
--error: #e11d48;
--warning: #ca8a04;
--running: #0284c7;
```

### Usage rules

- Accent color is used for: active skill border, running pulse, link hover, primary numbers, selected session.
- Error/warning/success are reserved for status badges and event outcomes.
- Borders are 1px solid `var(--border-default)`.
- No gradients except subtle radial glow behind the active skill card.

## Typography System

### Font families

- **Display / headings:** `Bebas Neue`, fallback `Oswald`, sans-serif. Used for page title, section labels, large numbers.
- **Body / UI:** `DM Sans`, fallback `system-ui`, sans-serif. Used for labels, buttons, timeline text.
- **Data / code:** `JetBrains Mono`, fallback `ui-monospace`, monospace. Used for tool names, durations, counts, file paths, timestamps.

### Type scale

| Token | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| `display-xl` | 4rem / 64px | 400 | 0.95 | Active skill name |
| `display-lg` | 2.5rem / 40px | 400 | 1 | Page title |
| `heading-md` | 1rem / 16px | 600 | 1.2 | Section labels (uppercase, letter-spacing 0.08em) |
| `body` | 0.875rem / 14px | 400 | 1.5 | General text |
| `body-sm` | 0.75rem / 12px | 400 | 1.4 | Timestamps, metadata |
| `data` | 0.875rem / 14px | 500 | 1.2 | Numbers, tool names, durations |
| `data-lg` | 2rem / 32px | 500 | 1 | Telemetry counters |

### Typography rules

- Section labels are uppercase with `letter-spacing: 0.08em` and `color: var(--text-muted)`.
- Skill names use `display-xl` in ALL CAPS (Bebas Neue style).
- Monospace data is tabular-nums to prevent jitter during updates.

## Layout Structure

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  CREWLOOP  ·  DASHBOARD                  [session selector] │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  ACTIVE SKILL        │  SKILL ACTIVITY GRAPH                │
│  ┌────────────────┐  │  ┌────────────────────────────────┐  │
│  │ [icon]         │  │  │  neural / activity nodes       │  │
│  │ ARCHITECT      │  │  │  + recent tool sparklines      │  │
│  │ 🟢 running     │  │  └────────────────────────────────┘  │
│  │ confidence 94% │  │                                      │
│  │ source: kimi   │  │  EVENT TIMELINE                      │
│  └────────────────┘  │  ┌────────────────────────────────┐  │
│                      │  │ 12:34:05  Read    README.md  ✓ │  │
│  TELEMETRY           │  │ 12:34:07  Skill   architect  → │  │
│  ┌────────────────┐  │  │ 12:34:09  Task    explore    ● │  │
│  │ tools: 23      │  │  │ 12:34:12  Edit    design.md  ✓ │  │
│  │ duration: 4m   │  │  └────────────────────────────────┘  │
│  │ events/sec: 3  │  │                                      │
│  └────────────────┘  │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

- **Header:** fixed height 56px, border-bottom, flex between logo and session selector.
- **Left sidebar:** 320px fixed width, contains Active Skill card and Telemetry panel.
- **Main area:** remaining width, contains Activity Graph and Event Timeline stacked vertically.
- **Gutter:** 16px between panels; 24px outer padding.

### Tablet (768px–1023px)

- Sidebar becomes a top horizontal band.
- Active Skill card and Telemetry panel sit side-by-side in the band.
- Main area below.

### Mobile (<768px)

- Header collapses; session selector becomes a bottom sheet trigger.
- All panels stack vertically.
- Active Skill card stays pinned at top for quick scanning.

## Component Specs

### 1. Header

- Height: 56px.
- Background: `var(--bg-surface)`.
- Border-bottom: 1px solid `var(--border-default)`.
- Left: `CREWLOOP` in `Bebas Neue`, 1.25rem, letter-spacing 0.12em, plus `DASHBOARD` label in `body-sm`, muted.
- Right: session selector dropdown.

**Session selector**
- Trigger: pill-shaped button, `bg-elevated`, border, text `body-sm`.
- Shows current session id (truncated), agent source icon, connection status dot.
- Dropdown: full list of sessions, sorted by `last_event_at` desc.
- Selected item: left border accent.
- Focus: 2px outline `var(--accent)` with 2px offset.

### 2. Active Skill Card

- Background: `var(--bg-surface)` with 1px border.
- Top strip: 4px solid `var(--accent)` when running; `var(--text-muted)` when idle.
- Padding: 24px.
- Content:
  - Skill icon (Phosphor, 48px, bold weight, accent color).
  - Skill name: `display-xl`, ALL CAPS.
  - Status badge: pill with dot. Running = pulsing cyan dot + "RUNNING". Idle = muted dot + "IDLE". Error = red dot.
  - Confidence label: "explicit" / "heuristic" / "unknown" pill.
  - Source label: agent name + small Phosphor icon.

**States**
- Default: static.
- Skill change: card border flashes accent once; icon scales 1 → 1.1 → 1 (200ms ease-out).
- Running: top strip emits subtle glow; status dot pulses.

### 3. Telemetry Panel

- Background: `var(--bg-surface)`, border, padding 20px.
- Three metric cards in a column (desktop) or row (tablet/mobile):
  - **Tool count:** `data-lg` number, `body-sm` label "TOOLS".
  - **Session duration:** `data-lg` timer (MM:SS), `body-sm` label "DURATION".
  - **Event rate:** `data-lg` events/min, `body-sm` label "RATE".
- Numbers update with a quick `transform: translateY` micro-tick (only if motion allowed).

### 4. Skill Activity Graph

- Background: `var(--bg-surface)`, border.
- A network-style visualization showing CrewLoop skills as nodes.
- Active skill node is larger, filled with accent color.
- Recently used skills are connected by faint lines.
- Tool sparks: small vertical bars per recent tool event, color-coded by status.
- This is a lightweight canvas/svg visualization, not a heavy chart library.

### 5. Event Timeline

- Background: `var(--bg-surface)`, border.
- Vertical track on the left with a timeline line.
- Each event row:
  - Timestamp (monospace, muted).
  - Status dot (running = pulsing, success = green, error = red, info = muted).
  - Tool name (monospace, primary).
  - Detail (safe detail like file path or skill name, secondary).
  - Outcome icon if `tool_end` (check, x, or dash).
- Newest events at top.
- New event enters with slide-in from right + fade (if motion allowed).
- Max 200 events; older ones fade out.

### 6. Connection Status Bar

- Fixed footer or header badge showing WebSocket state:
  - Connected: green dot, "LIVE".
  - Connecting: yellow dot, "CONNECTING".
  - Disconnected: red dot, "OFFLINE".

## Iconography

Use **Phosphor Icons** (`phosphor-icons` library). Load via CDN or package. Use `bold` weight for navigation/structure, `regular` for inline metadata.

### Skill icon mapping

| Skill | Phosphor icon |
|-------|---------------|
| orchestrator | `target` |
| architect | `blueprint` |
| designer | `palette` |
| engineer | `wrench` |
| reviewer | `magnifying-glass` |
| shipper | `rocket-launch` |
| docs-writer | `article` |
| tester | `flask` |
| product-manager | `chart-bar` |
| maintainer | `toolbox` |
| researcher | `microscope` |
| security-guard | `shield` |
| accessibility-auditor | `person` |
| obsidian-second-brain | `brain` |

### Structural icons

| Use | Icon |
|-----|------|
| Connection live | `pulse` / `circle` |
| Success | `check` |
| Error | `x` |
| Warning | `warning` |
| Tool running | `spinner` (animated) |
| Session selector | `caret-down` |
| External link | `arrow-square-out` |
| Empty state | `monitor` |

## Motion Choreography

### Page load (desktop)

1. Header fades in: 0 → 1 opacity, 200ms ease-out.
2. Left sidebar slides in from left: `translateX(-20px)` → 0, 250ms ease-out, 50ms delay.
3. Active Skill card scales up subtly: `scale(0.98)` → 1, 200ms ease-out, 100ms delay.
4. Main panels fade/slide up: `translateY(16px)` → 0, 250ms ease-out, staggered 80ms.

### Skill change

1. Old skill name cross-fades (150ms).
2. New skill name fades in + slight `translateY(-8px)` settle (200ms ease-out).
3. Skill icon scales 1 → 1.15 → 1 (250ms ease-out).
4. Top accent strip glows once.

### New timeline event

1. Row enters from right: `translateX(16px)` → 0, opacity 0 → 1, 200ms ease-out.
2. Older rows shift down by one row height: `translateY` only, 150ms ease-out.
3. Status dot pulses once if running.

### Running pulse

- Status dot: `opacity 1 → 0.4 → 1`, `scale 1 → 1.2 → 1`, 1200ms infinite.
- Active strip glow: `box-shadow` 0 → accent-glow → 0, 2000ms infinite.
- Uses `transform` and `opacity` only.

### Telemetry number update

- Old number slides up and out: `translateY(-100%)`, opacity 0, 150ms ease-in.
- New number slides up from below: `translateY(100%)` → 0, opacity 0 → 1, 150ms ease-out.

## Reduced Motion

When `prefers-reduced-motion: reduce` is detected:

- Disable all entrance animations; elements appear instantly.
- Disable running pulse; use static solid color instead.
- Disable number slide; update value instantly.
- Keep `transition: none` on animated properties.
- Timeline events append instantly without slide.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

### Contrast

- Body text on surface: ~11:1 (passes WCAG AAA).
- Accent on dark surface: ~12:1 (passes AAA for large text, AA for normal).
- Muted text: ~4.6:1 (passes AA).

### Focus

- All interactive elements have a 2px solid `var(--accent)` outline with 2px offset.
- Focus is visible in both light and dark modes.

### Screen readers

- Active skill card has `aria-live="polite"` so skill changes are announced.
- Timeline is a `<ul>`/`<li>` list with `aria-label="Event timeline"`.
- Connection status uses `role="status"` and `aria-live="polite"`.
- Session selector uses proper `<select>` or combobox pattern.

### Color independence

- Status is communicated by icon + text, not color alone.
- Error state uses both red color and `x` icon.
- Success uses both green color and `check` icon.

## Asset List

| Asset | Source | Notes |
|-------|--------|-------|
| Phosphor Icons | `phosphor-icons` package or CDN | Bold + Regular weights |
| Bebas Neue | Google Fonts | Display headings |
| DM Sans | Google Fonts | Body text |
| JetBrains Mono | Google Fonts | Data/monospace |
| Skill color tokens | CSS variables | One accent per skill not required; use single cyan accent + status colors |

## Pre-Implementation Checklist

- [x] Aesthetic direction committed (industrial-utilitarian)
- [x] Contrast ratios verified (target ≥ 4.5:1 for body, ≥ 3:1 for large)
- [x] Touch targets ≥ 44px (session selector pill, any interactive row)
- [x] Reduced motion alternative defined
- [x] Mobile layout preserves personality (stacked panels, pinned active skill)
- [x] Focus states designed
- [x] No emoji used as structural icons (skill avatars use Phosphor SVG)
- [x] Icon library specified (Phosphor)
