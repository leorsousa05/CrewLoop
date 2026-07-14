# UI/UX Design: Dashboard SaaS Minimalist Redesign (Spec 022)

## 1. Brand Narrative & Case-Study Frame

- **Problem:** Developers running CrewLoop need to observe AI agent sessions in real time — which skill is active, what tools fired, which files changed — while staying focused on their own terminal and editor. The dashboard is a secondary screen, not a primary workspace.
- **Audience:** A senior developer mid-debugging-session, alt-tabbing between terminal and browser. They arrive with high cognitive load and want *answers in under 2 seconds*: "what is the agent doing right now, and did anything break?"
- **Insight:** The dashboard is read like a precision instrument, not a marketing page. Its users trust clean data, visible structure, and restrained color far more than decorative surfaces. The interface should feel like a well-designed observability panel bolted next to the editor — calm, fast, and precise.
- **Solution:** A Linear / Vercel / Raycast-inspired minimalist SaaS console: soft neutral surfaces, one refined accent for live state and primary actions, a geometric sans display face, JetBrains Mono data density, and motion that only fires when state actually changes.

## 2. Aesthetic Direction Statement

**Thesis: Linear-like Minimalist (dominant), with Bento Grid / Modular as supporting influence** — selected per `reference-library.md`: "Developer products, consoles; thin borders, compressed type, crisp spacing, precise hierarchy." The Bento influence (asymmetric card sizing, one oversized anchor) tempers the "bland minimalism" risk noted in the library row. The emotional target: the calm of a well-organized cockpit — everything visible, nothing shouting, one quiet accent telling you where the live thing is. This replaces both the amber Vercel command-center (spec 017) and the superseded industrial phosphor console (spec 021) with a cleaner, more contemporary SaaS identity.

**References that shaped this spec (traceability):**
- `aesthetic-guidelines.md` — one thesis + one accent, semantic color, authored density, WCAG AA, 44px touch targets, token vocabulary.
- `reference-library.md` — thesis selection (Linear-like Minimalist row; Bento Grid row as supporting influence and its "default if all cards are equal" risk consciously countered by the asymmetric anchor card).
- `anti-patterns.md` — no gradient heroes, no glassmorphism decoration, no interchangeable rounded cards, no equal-weight card grids, no system-font identity.
- `color-playbook.md` — one dominant neutral family + one accent reserved for action/live state; neutrals that support rather than hide.
- `typography-playbook.md` — Linear/Minimalist strategy: geometric display face + monospace utility layer + weight contrast.
- `layout-patterns.md` — dense utility stack; bento matrix with one oversized anchor card; hierarchy preserved on mobile.
- `motion-playbook.md` — transform/opacity only; data-update crossfades; entrances short, exits shorter; complete reduced-motion fallbacks.
- `case-study-template.md` — narrative frame above.
- `output-checklist.md` — final gate checklist (section 16).

## 3. Color System

Custom-derived cool-gray neutrals + single refined indigo accent ("the live signal"). All values authored for this product — not boilerplate. Accent hue (230°) is deliberately distant from success (152°) to avoid live-state/success confusion, and warmer than the rejected cool-blue of spec 020.

### Light mode (`html.light`, primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `hsl(210, 40%, 98%)` | App background, deep chrome |
| `--bg-surface` | `hsl(210, 40%, 100%)` | Panels, sidebar, cards |
| `--bg-elevated` | `hsl(210, 40%, 97%)` | Hover, inputs, active rows, popovers |
| `--bg-inset` | `hsl(210, 40%, 95%)` | Graph canvas, diff bodies, deep insets |
| `--border-default` | `hsl(214, 20%, 90%)` | Panel borders, dividers |
| `--border-strong` | `hsl(214, 20%, 78%)` | Focused/hover borders |
| `--text-primary` | `hsl(222, 47%, 11%)` | Primary text (≈13:1 on base) |
| `--text-secondary` | `hsl(215, 16%, 47%)` | Secondary text, labels (≈7:1) |
| `--text-muted` | `hsl(215, 16%, 63%)` | Meta, placeholders (≥12px only, ≈4.6:1) |
| `--accent` | `hsl(230, 90%, 64%)` | Live/active signal, primary actions, active nav |
| `--accent-dim` | `hsl(230, 90%, 94%)` | Accent glows, subtle accent fills |
| `--success` | `hsl(152, 60%, 32%)` | Success status, edit ops |
| `--error` | `hsl(8, 70%, 48%)` | Error status, deleted lines |
| `--running` | `hsl(192, 80%, 38%)` | Running status, read ops |
| `--warning` | `hsl(38, 90%, 42%)` | Starting/warning states |
| `--overlay` | `rgba(20, 20, 25, 0.35)` | Modal/palette backdrop |

### Dark mode (`:root`, default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `hsl(224, 30%, 7%)` | App background, deep chrome |
| `--bg-surface` | `hsl(222, 28%, 10%)` | Panels, sidebar, cards |
| `--bg-elevated` | `hsl(222, 28%, 14%)` | Hover, inputs, active rows, popovers |
| `--bg-inset` | `hsl(224, 30%, 5%)` | Graph canvas, diff bodies, deep insets |
| `--border-default` | `hsl(222, 20%, 18%)` | Panel borders, dividers |
| `--border-strong` | `hsl(222, 20%, 28%)` | Focused/hover borders |
| `--text-primary` | `hsl(210, 40%, 96%)` | Primary text (≈13:1 on base) |
| `--text-secondary` | `hsl(215, 16%, 70%)` | Secondary text, labels (≈7:1) |
| `--text-muted` | `hsl(215, 16%, 50%)` | Meta, placeholders (≥12px only, ≈4.6:1) |
| `--accent` | `hsl(230, 90%, 70%)` | Live/active signal, primary actions, active nav |
| `--accent-dim` | `hsl(230, 60%, 18%)` | Accent glows, subtle accent fills |
| `--success` | `hsl(152, 55%, 48%)` | Success status, edit ops |
| `--error` | `hsl(8, 75%, 60%)` | Error status, deleted lines |
| `--running` | `hsl(192, 85%, 58%)` | Running status, read ops |
| `--warning` | `hsl(38, 92%, 58%)` | Starting/warning states |
| `--overlay` | `rgba(0, 0, 0, 0.65)` | Modal/palette backdrop |

**Color doctrine:**
- Indigo accent appears *only* for: active view indicator, live/active skill state, primary action buttons, focus rings, pinned items, key telemetry values. If everything glows, nothing is live.
- Semantic colors always paired with an icon or text label (never color-only meaning).
- No gradients anywhere — flat only. Glow limited to a single subtle `box-shadow` on the live skill card.

## 4. Typography System

Swap the display face from `Teko` to `Space Grotesk` (Google Fonts) to align with the minimalist SaaS direction. Keep `JetBrains Mono` for body, data, and UI. This is a one-for-one display swap; no additional fonts are added.

- **Display:** `Space Grotesk` (Google Fonts, new) — brand, view titles, hero numerals. Clean geometric sans with technical character.
- **Body / data / UI:** `JetBrains Mono` — everything else. Tabular numerals for all metrics.

| Level | Font | Size | Line-height | Letter-spacing | Weight | Usage |
|-------|------|------|-------------|----------------|--------|-------|
| Display-xl | Space Grotesk | 64px | 1.0 | 0 | 500 | Active skill name, Overview hero |
| Display-lg | Space Grotesk | 40px | 1.05 | 0 | 500 | View titles |
| Display-md | Space Grotesk | 32px | 1.1 | 0 | 500 | Section headlines |
| Heading | JetBrains Mono | 16px | 1.4 | 0.02em | 600 | Panel headers, card titles |
| Body | JetBrains Mono | 14px | 1.5 | 0 | 400 | Timeline rows, file lists, body |
| Body-sm | JetBrains Mono | 13px | 1.5 | 0 | 400 | Compact-density lists |
| Caption | JetBrains Mono | 12px | 1.4 | 0.02em | 500 | Timestamps, metadata |
| Label | JetBrains Mono | 11px | 1.3 | 0.12em | 600 | Uppercase labels, badges, section eyes |
| Button | JetBrains Mono | 13px | 1 | 0.04em | 600 | Buttons, chips |

Rules: all metrics use `font-variant-numeric: tabular-nums`. Space Grotesk never appears below 24px. Labels are always uppercase. The `Teko` font loading is removed from `ui/index.html` and replaced with `Space Grotesk`.

## 5. Design Tokens

### Spacing (4px base — existing rhythm retained)

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

Panel gap: `--space-md` comfortable / `--space-sm` compact. Main content padding: `--space-lg` desktop, `--space-md` mobile.

### Radius (SaaS minimalist: softer than industrial, tighter than playful)

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Tags, inputs, badges, diff lines |
| `--radius-md` | 6px | Buttons, chips, small cards |
| `--radius-lg` | 8px | Panels (`.panel`), sidebar items |
| `--radius-xl` | 12px | Command palette, modals |
| `--radius-full` | 9999px | Status dots, pills, avatars |

### Elevation (near-flat; shadow reserved for floating layers)

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--shadow-0` | `none` | `none` | All resting panels — borders do the work |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.4)` | `0 1px 2px rgba(0,0,0,0.06)` | Inputs, inset wells |
| `--shadow-2` | `0 4px 16px rgba(0,0,0,0.5)` | `0 4px 12px rgba(0,0,0,0.08)` | Popovers, dropdowns |
| `--shadow-3` | `0 12px 40px rgba(0,0,0,0.6)` | `0 8px 24px rgba(0,0,0,0.10)` | Command palette, modals |
| `--shadow-live` | `0 0 0 1px var(--accent-dim), 0 0 16px -6px var(--accent)` | `0 0 0 1px var(--accent-dim)` | Live skill card only (the single allowed glow) |

### Component classes (defined in `index.css`)

- `.panel` — `bg-surface`, `1px solid --border-default`, `radius-lg`, padding `--space-md` (comfortable) / `--space-sm` (compact via `.density-compact`).
- `.panel-hoverable` — adds 150ms background transition to `--bg-elevated` on hover.
- `.panel-live` — `--shadow-live` + 1px accent-dim border when active.
- `.label` — 11px uppercase tracking-widest `text-muted`.
- `.kbd` — inline keyboard hint: `bg-elevated`, `radius-sm`, 1px border, 11px, padding `2px 6px`.
- `.chip` — filter/status chip: `radius-full`, 1px border, 12px, padding `4px 10px`.
- `.btn-primary` — `bg-accent`, text `hsl(210, 40%, 98%)` (light-on-indigo), `radius-md`, 600 weight.
- `.btn-ghost` — transparent, `text-secondary`, hover `bg-elevated`.
- Focus ring (global): `outline: 2px solid var(--accent); outline-offset: 2px`.
- Scrollbar: 8px, thumb `--border-strong`, track transparent.

## 6. Layout Structure

### Global chrome (unchanged geometry — proven in spec 017, restyled visually)

```
+-------------------------------------------------------------+
| TopBar  56px  [brand · view]      [search] [conn] [theme]  |
+----------+--------------------------------------------------+
|          |  ViewHeader: title + actions                     |
| Sidebar  |  FilterBar (where relevant)                      |
| 240px    |                                                  |
|          |  View content (internal scroll)                  |
|          |                                                  |
+----------+--------------------------------------------------+
```

- TopBar fixed, 56px, `z-50`, `bg-surface`, bottom border.
- Sidebar fixed left, 240px desktop / 64px tablet rail / drawer mobile, `z-40`.
- All scrolling inside main or panels; chrome never scrolls.

### Overview — asymmetric bento (one anchor, per `layout-patterns.md`)

```
+-----------------------------+----------------+---------------+
|                             |  TELEMETRY     |  ACTIVITY     |
|  ACTIVE SKILL  (anchor,     |  events/min    |  GRAPH        |
|  2 rows tall, 2 cols)       |  tools  files  |  (2 cols)     |
|                             |  errors        |               |
+-----------------------------+                |               |
|  RECENT EVENTS (2 cols)     |                |               |
+-----------------------------+----------------+---------------+
|  TOP SKILLS (1 col)  |  TOP TOOLS (1 col)  |  TOP FILES     |
+----------------------+---------------------+---------------+
```

- Anchor card = Active Skill (spans 2×2 on desktop): the only element allowed the `--shadow-live` glow when a skill is active.
- Numbers in telemetry: Space Grotesk 40px, `text-accent` only for the live rate; others `text-primary`.
- Breakpoints: ≥1440px as drawn; 1024–1439px graph drops to 1 col; tablet 2-col; mobile single column, anchor first.

### Sessions / Timeline / Files — dense utility stack

```
Sessions:
[ViewHeader] ────────────────────────────────────────────────
[FilterBar: search · chips · count · export]                 48/40px
[Session row .............................................]  48px
[Session row .............................................]
   row = [pin][dot] id/skill ............ source  duration
```

```
Timeline:
[FilterBar]
  │  56px   8px dot   content                    duration
  │──time───●─────── tool · file ...............  120ms
  │         │       └ expanded: bg-inset detail (input/output)
  │──time───◌─────── running row (pulsing dot)
  connector: 1px --border-default through dots
```

```
Files (desktop two-pane):
+-----------------280px------+--------------------------------+
| FileList (tree)            | Diff header: path + op pills   |
| ▸ src/                     +--------------------------------+
|   ▸ server.ts  [+12 −4]    | diff body: whitespace-pre      |
|   ▸ state.ts   [+3 −1]     |  + green / − red / @@ muted    |
+----------------------------+--------------------------------+
Mobile: list full-width; tap → diff replaces list + back button
```

### Skills / Settings

- **SkillsView:** ranked list rows — rank numeral (Space Grotesk), skill name, invocation bar (1px-track horizontal bar using `--accent` fill), count + last-used. No pie charts (identity is tabular precision).
- **SettingsView:** single column of `.panel` sections (Appearance, Behavior, Data). Each row: label left, control right. Toggles styled as 40×22px switches with accent fill when on.

## 7. Component Specs

### TopBar (56px)
- Left: hamburger (mobile/tablet only) → brand `CREWLOOP` Space Grotesk xl tracking-widest → `·` muted → view title (Label style, `text-secondary`).
- Right: search trigger (`.btn-ghost` + `.kbd` ⌘K, icon-only tablet) → connection dot (8px, `--success` connected / `--error` down / `--warning` connecting, pulse only when connecting) → theme toggle (icon button) → session selector.
- Hover states 150ms background only. No shadow; bottom border separates.

### Sidebar
- Item: 40px (comfortable) / 32px (compact), 44px touch target mobile; 24px icon + 12px gap + Label-style label (12px, not uppercase for nav — sentence case for readability; nav is the exception to the label rule).
- States: default `text-secondary`; hover `bg-elevated text-primary`; active `bg-elevated text-primary` + 3px `--accent` left bar via `::before`, animates `translateX(-4px)→0` + opacity 200ms.
- Groups: main nav top; Settings pinned bottom above a 1px divider. No group headers needed (6 items).
- Tablet rail: icons centered, tooltips (`bg-elevated`, `radius-md`, 12px, appears 150ms after hover intent).

### CommandPalette
- Modal: `max-width 640px`, `width calc(100% - 32px)`, `bg-surface`, `radius-xl`, `shadow-3`, border. Backdrop `--overlay` + `backdrop-blur-sm`.
- Input: transparent, bottom border, `py-3 px-4`, placeholder muted, `Esc` hint right.
- Section headers: Label style, `px-4 py-2`. Rows: `px-4 py-2.5`, icon 20px (`text-accent` for views/actions, `text-secondary` for data), title Body, subtitle Caption muted. Active row: `bg-elevated` + 2px accent left edge.
- Motion per section 11. Focus trap, `role="dialog"`, `aria-modal`, focus restore on close.
- No Network view items.

### ViewHeader
- Row: Display-lg view title + Caption description (right-aligned actions slot). Bottom margin `--space-md`. No card chrome — it's typography, not a panel.

### FilterBar
- 48px / 40px compact, bottom border only. Search input with leading icon + clear button; chips showing active counts (`.chip`, accent border when active); right side: result count (Caption muted) + export icon button.
- Popover: `bg-surface` + `shadow-2`, `radius-lg`, `min-width 180px`, checkbox rows 32px, accent checkmark. Opens with 150ms opacity + `translateY(-4px)→0`.

### SessionSelector
- Trigger: `.chip`-like button: session dot + truncated id (mono) + chevron. Dropdown: `bg-surface`, `shadow-2`, rows = session dot + id + duration; pinned section first with 1px divider.

### ActiveSkillPanel (Overview anchor)
- `bg-surface` panel; when `activeSkill` present: `--shadow-live` + 1px accent-dim border. Contents: Label "ACTIVE SKILL", Display-xl skill name (Space Grotesk, `text-primary` — accent is the glow, not the text), confidence bar (1px track, accent fill), current tool + file (Body-sm secondary). Idle state: dot `--text-muted`, text "No active skill — waiting for events".
- Anchor sizing: spans 2 cols × 2 rows on desktop bento.

### TelemetryPanel / ActivityGraph
- Telemetry: 3 stat cells (events/min, tools, files changed); numeral Space Grotesk 40px tabular; delta arrow (↑/↓, success/error) vs previous minute.
- ActivityGraph: `bg-inset` canvas; bars `--accent` at 60% opacity, current minute 100%; grid lines `--border-default` 1px; no axes labels except Caption timestamps at edges.

### Timeline / TimelineRow
- Row grid: `56px 16px 1fr auto`, gap 12px, padding `py-2 px-2.5` (compact `py-1 px-2`). Status dot 8px centered on 1px connector: `--running` running (pulse), `--success` done, `--error` failed, `--text-muted` queued.
- Row hover: `bg-elevated` 150ms + reveal copy icon button. Expanded detail: `bg-inset`, `radius-sm`, padding 12px, `whitespace-pre-wrap`, input/output sections with Label headers.

### FileList / FileDiff / FileActivity
- Tree rows 32px, indent 16px per depth; folder chevron 12px; op pills: `+n` success, `−n` error, 11px tabular. Selected row: `bg-elevated` + 2px accent left.
- Diff: header sticky (path mono + pills); body `bg-inset`, 13px/1.6 mono, `+` lines `text-success` on `hsl(152,55%,48%,0.08)` wash, `−` lines `text-error` on `hsl(8,75%,60%,0.08)` wash, `@@` muted.

### StatusBadge / Icon
- StatusBadge: `.chip` + 6px dot; variants map to semantic tokens; text always present (no color-only).
- Icon: Phosphor regular default, bold for active nav states; sizes 16/20/24.

## 8. Real-State Specs (per view)

| State | Treatment |
|-------|-----------|
| **Loading (initial)** | Skeleton panels mirroring final layout: `bg-elevated` blocks with 1.2s opacity shimmer (0.4↔0.7), `radius-lg`; no spinners in panels. TopBar shows instantly. |
| **Empty (no sessions)** | Centered in main: Phosphor icon 48px `text-muted`, Heading "No sessions yet", Caption "Start an agent with CrewLoop hooks configured — events appear here live." No fake CTAs. |
| **Empty (filtered)** | Inline in list area: Caption muted "No events match these filters" + "Clear filters" ghost button. |
| **Error (WS disconnect)** | Connection dot → `--error` + TopBar label "reconnecting…"; subtle 200ms `bg-error/10` flash on TopBar (once, not looping); auto-retry (existing logic). |
| **Error (API/route)** | Inline banner in view: 1px `--error` left border, `bg-error/10`, Body-sm text + retry ghost button. Never full-screen for partial failures. |
| **Success (export, copy)** | Inline toast bottom-right: `bg-elevated`, `shadow-2`, 6px success dot + message; 200ms enter (`translateY(4px)`+opacity), auto-dismiss 2.5s, 150ms leave. |
| **Offline/stale data** | When WS down >5s: Caption "showing cached snapshot" pill next to view title (warning dot). |
| **Skeleton granularity** | Overview: 6 skeleton blocks matching bento. Lists: 5 skeleton rows. Diff: header + 8 line blocks. |

## 9. Presentation Mockups

- **Browser-frame (desktop 1440):** Clean light console filling a browser chrome — 56px TopBar with `CREWLOOP · OVERVIEW` left and `⌘K` pill right; bento below with the Active Skill anchor card showing a subtle indigo glow on the left, telemetry numerals reading `142 / 38 / 12` mid-grid, activity bars climbing on the right. Reads as a contemporary observability panel, not a webpage.
- **Device (mobile 390):** TopBar with hamburger + brand + connection dot only; Active Skill card full-width, telemetry 3-up below, timeline rows with 44px targets; sidebar as 280px drawer with scrim. The anchor card survives the breakpoint — hierarchy preserved, not flattened.
- **Before/after:** Before (spec 021, superseded) — dark industrial phosphor, heavier shadows, terminal-native feel. After — soft neutral surfaces, indigo accent, flat elevation, cleaner type rhythm; identity shifts from "local developer instrument" to "modern SaaS observability console". Also contrasted against the rejected spec-020 blue: the indigo accent keeps the technical clarity while moving to a warmer, more refined hue.

## 10. Motion Choreography

Properties: `transform`, `opacity` only. Durations: entrances ≤250ms, exits ≤150ms. Easing standard: `cubic-bezier(0.25, 1, 0.5, 1)` (out); exits `ease-in`.

| Animation | Trigger | Property | Duration | Easing | Stagger | Reduced-motion fallback |
|-----------|---------|----------|----------|--------|---------|------------------------|
| View switch | nav | opacity | 150ms | out | none | instant swap |
| Sidebar active bar | nav | translateX, opacity | 200ms | out | none | instant |
| Palette open | ⌘K | backdrop opacity; container scale 0.96→1 + translateY 8→0 | 200ms | out | none | opacity fade only |
| Palette close | Esc | reverse | 150ms | in | none | instant |
| Popover open | click | opacity, translateY −4→0 | 150ms | out | none | instant |
| Panel hover | hover | background-color transition | 150ms | out | none | none |
| New timeline event | data | opacity 0→1 + translateY 4→0 | 200ms | out | none | instant append |
| Live data update (numerals) | data | opacity crossfade 0.5→1 | 150ms | out | none | instant swap |
| Running dot | status | opacity pulse 0.4↔1 | 1s loop | in-out | none | static dot |
| Toast | action | translateY 4→0 + opacity | 200/150ms | out/in | none | instant |
| Button press | click | scale 0.98 | 120ms | `cubic-bezier(0.34,1.56,0.64,1)` | none | instant |

Global `prefers-reduced-motion: reduce` block collapses all transitions to 0.01ms and disables the pulse loop — preserved from existing CSS, must survive the `index.css` rewrite.

## 11. Asset List

- **Icons:** `@phosphor-icons/react` (existing). Regular weight default, bold for active nav.
- **Images:** none. No raster hero, no photography.
- **Textures/effects:** none by default. The indigo glow (`--shadow-live`) on the live skill card is the single atmospheric effect.
- **Fonts:** `Space Grotesk` (new) + `JetBrains Mono` (existing). `Teko` removed.

## 12. Asset Export Spec

Not applicable — no new raster/vector assets. The only export touched is the existing JSON export button (restyled, format unchanged). New after-screenshot for `assets/screenshots/dashboard-overview.png` is produced in Phase 5 verification.

## 13. Data Visualization Spec

| Element | Token | Non-color indicator |
|---------|-------|---------------------|
| Activity bars | `--accent` @ 60% (current min 100%) | height encodes value; Caption timestamps |
| Invocation bars (SkillsView) | `--accent` fill on `--bg-elevated` track | width + numeric count label |
| Telemetry delta | `--success` / `--error` | ↑/↓ arrows always accompany color |
| Timeline status dots | `--running`/`--success`/`--error`/`--text-muted` | position on connector + row text state |
| Diff lines | `--success`/`--error` text + 8% wash | `+`/`−` glyphs |
| Grid lines (graph) | `--border-default` 1px | — |
| Tooltips (graph) | `bg-elevated`, `radius-md`, Caption | value always textual |

Chart text minimum 12px; all chart-adjacent text meets ≥4.5:1 on its background.

## 14. User Flow & Interaction Spec

- **Primary nav:** Sidebar (desktop) / rail (tablet) / drawer (mobile). Active view = accent bar + `aria-current="page"`. Keyboard: sidebar items reachable via Tab; drawer opens from hamburger with focus trap.
- **Command palette:** `⌘K` / `Ctrl+K` global (existing hook); groups Views → Sessions → Skills → Tools → Files → Events → Actions; arrows navigate, Enter activates, Esc closes and restores focus. No Network view items.
- **Overlays:** popovers close on outside click and Esc; tooltips on hover intent (150ms) and focus; no right-click menus introduced.
- **Session switching:** SessionSelector in TopBar; pinned sessions first; switching preserves current view.
- **Timeline interaction:** row click expands detail; copy button per row (hover) and inside detail; pause-on-hover buffering preserved.
- **No conversion flow** — internal tool; the "CTA" equivalent is the live data itself.

## 15. Responsive Behavior

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | TopBar hamburger; sidebar drawer 280px + scrim; single-column views; Files drill-in with back button; palette full-width minus 16px |
| Tablet | 768–1023px | 64px icon rail + tooltips; bento 2-col; Files keeps two-pane if ≥900px |
| Desktop | 1024–1439px | Full sidebar; bento as section 6 |
| Wide | ≥ 1440px | Same layout, max content width 1600px centered — beyond that the console stays left-anchored, no stretched panels |

Touch targets ≥44×44px everywhere (expand hit area when visual is smaller).

## 16. Pre-Implementation Checklist

- [x] Brand narrative ties direction to audience (developer mid-debug) and problem (2-second answers).
- [x] Aesthetic direction singular and named: Linear-like Minimalist + Bento support; not a template.
- [x] Color system: custom HSL, authored values (not copied from SKILL.md examples).
- [x] Typography: exact sizes/weights/leading; Space Grotesk + JetBrains Mono retained intentionally.
- [x] Tokens: spacing, radius, elevation, component classes defined.
- [x] Contrast: primary/secondary text ≥4.5:1 both modes; muted restricted to ≥12px meta; verify accent-on-surface for large text ≥3:1 during implementation.
- [x] Touch targets ≥44px specified.
- [x] Focus states: global accent ring + per-component specs.
- [x] Real states: loading/empty/error/skeleton/success/offline spec'd per view.
- [x] Three mockups described (browser, mobile, before/after).
- [x] Motion: transform/opacity only, durations/easings defined, reduced-motion fallbacks per row + global kill-switch.
- [x] No emoji as structural icons (Phosphor only).
- [x] Charts: non-color indicators mapped; contrast noted.
- [x] Modal: focus trap, Esc, backdrop behavior spec'd.
- [x] Keyboard: palette shortcut and nav behavior spec'd.
- [x] Slop check: no gradients, no glassmorphism decoration, no equal cards, no purple-blue, no system fonts, asymmetric bento with one anchor.
- [x] References cited (section 2).
- [x] Layout asymmetry: 2×2 anchor + varied cell spans; no default 3-col grid.
