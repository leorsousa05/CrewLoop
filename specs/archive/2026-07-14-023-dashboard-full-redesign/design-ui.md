# Design-UI: Dashboard Full Redesign — "Quiet Console"

Visual specification for spec `023-dashboard-full-redesign`. This document defines **how everything looks**; `design.md` defines what each piece is and how it behaves. The Engineer implements from both.

---

## 1. Case-Study Frame

- **Problem:** A developer running CrewLoop needs to answer, in under two seconds: *what is my agent doing right now, is anything wrong, and where do I look next?* The 022 redesign made the dashboard clean but left it sparse and structurally noisy — duplicated titles, duplicated data, dead hero space, invisible pause state.
- **Audience:** A technical user mid-flow, often with the dashboard on a second monitor or a narrow window, glancing rather than reading. They arrive in a state of *monitoring*, not *exploring*.
- **Insight:** The dashboard is an instrument panel, not a marketing page. Instrument panels win by **density with calm** — every pixel carries signal, and nothing shouts. The 022 palette (graphite + a single restrained indigo) already said this; the layout just didn't.
- **Solution:** Evolve the SaaS minimalist line into a *quiet console*: one title location, one navigation registry, a fixed 8-step type scale, content-driven density, and motion that only ever explains change.

## 2. Aesthetic Direction Statement

**Thesis: Linear-like Minimalist (dominant), composed with the Dense Utility Stack pattern.** Thin hairline borders, compressed mono data type, a display grotesque used sparingly for wayfinding, and one indigo reserved strictly for *live* and *selected* state. The emotional target is **calm precision**: the interface should feel like a well-tuned terminal that happens to be beautiful — never decorated, never empty, never generic. The mono body is the identity anchor; the indigo is the pulse.

**References that shaped this direction:**
- `aesthetic-guidelines.md` — semantic tokens, typography-as-identity, accessibility as a visual constraint (adopted wholesale as the guardrail layer).
- `reference-library.md` — direction selection: Linear-like Minimalist ("developer products, consoles… precise hierarchy"), with the noted risk ("can flatten into bland minimalism") countered by the mono-data identity and the indigo pulse.
- `layout-patterns.md` — Dense utility stack as the compositional base; "let one component dominate" applied per view (Now strip on Overview, the list itself on Timeline/Sessions/Files).
- `typography-playbook.md` — Industrial strategy adapted: weight contrast over decoration; mono reserved for data/paths/meta; display face for wayfinding only.
- `color-playbook.md` — one dominant family (graphite), one accent (indigo), small-dose semantics; the "four good color questions" drove the accent = *live/selected only* rule.
- `motion-playbook.md` — entrance/feedback/layering/data-update families; transform+opacity only; reduced-motion fallbacks everywhere.
- `anti-patterns.md` — explicit guards: no decorative gradients, no equal-weight card grids, no glassmorphism, no center-everything empty states.
- `output-checklist.md` — the final gate this document closes against (section 13).

---

## 3. Color System (evolution of 022 — identity preserved)

The 022 graphite + indigo identity is kept. Changes are **additive and atomic**: two new accent tints for selected/hover states and an explicit focus token. Any token addition is mirrored in `:root`, `html.light`, and `tailwind.config.js` per `design.md`.

### Dark (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `hsl(224, 30%, 7%)` | App background (unchanged) |
| `--bg-surface` | `hsl(222, 28%, 10%)` | Panels, cards (unchanged) |
| `--bg-elevated` | `hsl(222, 28%, 14%)` | Popovers, hover fills, modals (unchanged) |
| `--bg-inset` | `hsl(224, 30%, 5%)` | Wells: code, payloads, graph track (unchanged) |
| `--border-default` | `hsl(222, 20%, 18%)` | Hairlines, card borders (unchanged) |
| `--border-strong` | `hsl(222, 20%, 28%)` | Emphasized borders, scrollbars (unchanged) |
| `--text-primary` | `hsl(210, 40%, 96%)` | Headings, data values (unchanged) |
| `--text-secondary` | `hsl(215, 16%, 70%)` | Supporting text (unchanged) |
| `--text-muted` | `hsl(215, 16%, 50%)` | Meta/timestamps — **caption size or smaller only** (unchanged value, new usage rule) |
| `--accent` | `hsl(230, 90%, 70%)` | Live/selected signal, primary actions (unchanged) |
| `--accent-strong` | `hsl(230, 90%, 78%)` | **NEW** — hover state of accent text/icons/links |
| `--accent-dim` | `hsl(230, 60%, 18%)` | Accent borders, glow base (unchanged) |
| `--accent-subtle` | `hsl(230, 45%, 13%)` | **NEW** — selected-row/nav background tint |
| `--success` | `hsl(152, 55%, 48%)` | Success status (unchanged) |
| `--error` | `hsl(8, 75%, 60%)` | Error status (unchanged) |
| `--warning` | `hsl(38, 92%, 58%)` | Warning status (unchanged) |
| `--running` | `hsl(192, 85%, 58%)` | Running lifecycle (unchanged) |
| `--focus` | `hsl(230, 90%, 70%)` | **NEW (formalized)** — focus-visible ring color (= accent) |
| `--overlay` | `rgba(0, 0, 0, 0.65)` | Modal/sheet scrim (unchanged) |

### Light (`html.light`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `hsl(210, 40%, 98%)` | (unchanged) |
| `--bg-surface` | `hsl(210, 40%, 100%)` | (unchanged) |
| `--bg-elevated` | `hsl(210, 40%, 97%)` | (unchanged) |
| `--bg-inset` | `hsl(210, 40%, 95%)` | (unchanged) |
| `--border-default` | `hsl(214, 20%, 90%)` | (unchanged) |
| `--border-strong` | `hsl(214, 20%, 78%)` | (unchanged) |
| `--text-primary` | `hsl(222, 47%, 11%)` | (unchanged) |
| `--text-secondary` | `hsl(215, 16%, 45%)` | **adjusted** (was 47%) — small contrast bump |
| `--text-muted` | `hsl(215, 16%, 60%)` | **adjusted** (was 63%) — meta only |
| `--accent` | `hsl(230, 90%, 64%)` | (unchanged) — **UI/large-text use only on white** |
| `--accent-strong` | `hsl(230, 90%, 54%)` | **NEW** — accent text on white (passes body contrast) |
| `--accent-dim` | `hsl(230, 90%, 94%)` | (unchanged) |
| `--accent-subtle` | `hsl(230, 80%, 96%)` | **NEW** — selected-row/nav tint |
| `--success` | `hsl(152, 60%, 32%)` | (unchanged) |
| `--error` | `hsl(8, 70%, 48%)` | (unchanged) |
| `--warning` | `hsl(38, 90%, 42%)` | (unchanged) |
| `--running` | `hsl(192, 80%, 38%)` | (unchanged) |
| `--focus` | `hsl(230, 90%, 64%)` | **NEW (formalized)** |
| `--overlay` | `rgba(20, 20, 25, 0.35)` | (unchanged) |

### Contrast verification (targets for Reviewer spot-check)

| Pair | Ratio (approx) | Verdict |
|------|----------------|---------|
| `--text-primary` on `--bg-surface` (dark) | ~13:1 | ✓ AA |
| `--text-secondary` on `--bg-surface` (dark) | ~8:1 | ✓ AA |
| `--text-muted` on `--bg-surface` (dark) | ~4.6:1 | ✓ AA — restricted to meta ≥ caption |
| `--accent` on `--bg-surface` (dark) | ~5:1 | ✓ AA |
| `--text-secondary` on `--bg-surface` (light) | ~7.5:1 | ✓ AA |
| `--text-muted` on `--bg-surface` (light) | ~4.5:1 | ✓ AA — meta only |
| `--accent-strong` on `--bg-surface` (light) | ~4.6:1 | ✓ AA — use for accent *text* in light mode |
| `--accent` on white (light) | ~3.9:1 | large/UI only — never body text |

**Accent discipline (the one rule that keeps the identity):** indigo appears only for *live* (running skill, connection ok), *selected* (nav, row, chip), *focus*, and *primary actions*. Everything else is graphite + semantic status colors. No gradients, no glows beyond the existing `--shadow-live` on the live Now strip.

---

## 4. Typography System

Two families, eight steps, one scale for both themes (sizes don't change with theme; only color does).

- **Display / wayfinding:** Space Grotesk (500–600) — view titles, panel headings, big metric numbers.
- **Data / body / meta:** JetBrains Mono (400–500) — everything operational: values, paths, timestamps, labels, filters.

### Scale (values for both `:root` and `html.light`)

| Token | Size | Line-height | Family | Weight | Tracking | Usage |
|-------|------|-------------|--------|--------|----------|-------|
| `--text-display-2xl` | 36px | `--leading-display` 1.1 | Space Grotesk | 600 | -0.02em | Empty-state headline; rare hero moments |
| `--text-display-xl` | 28px | `--leading-display` 1.1 | Space Grotesk | 600 | -0.01em | Telemetry metric numbers (tabular) |
| `--text-display-lg` | 20px | `--leading-tight` 1.25 | Space Grotesk | 500 | -0.01em | Now strip skill name; empty-state subhead |
| `--text-heading` | 16px | `--leading-tight` 1.25 | Space Grotesk | 500 | 0 | TopBar view title; panel titles; section heads |
| `--text-body` | 13px | `--leading-normal` 1.5 | JetBrains Mono | 400 | 0 | Primary data text, row content, inputs |
| `--text-label` | 12px | `--leading-normal` 1.5 | JetBrains Mono | 500 | 0 | Filter labels, table headers, buttons |
| `--text-caption` | 11px | `--leading-normal` 1.5 | JetBrains Mono | 500 | +0.08em (uppercase) | Group labels, kbd, section eyebrows |
| `--text-micro` | 10px | `--leading-normal` 1.5 | JetBrains Mono | 400 | 0 | Timestamps, durations, counts (tabular) |

Leading tokens: `--leading-display: 1.1`, `--leading-tight: 1.25`, `--leading-normal: 1.5`.

**Rules:**
- Replace every ad-hoc size: `text-[40px]` → `text-display-2xl`; `text-6xl` hero → `text-display-lg` (Now strip); `text-[8px]`/`text-[8.5px]` → `text-micro`; `text-[12.5px]` → `text-body` or `text-label`; `py-0.2` → standard spacing tokens.
- Numbers that change live (metrics, durations, counts) always use `.tabular`.
- Uppercase tracking (`+0.08em`) applies only to `caption` used as eyebrow/label; never to body.
- `body` font-size base on `<body>` becomes 13px (from 14px) — density decision; compact density does not shrink type further, only spacing.

---

## 5. Design Tokens (non-color)

Spacing (4px base — unchanged, one addition):

| Token | Value |
|-------|-------|
| `--space-xs` … `--space-2xl` | 4 / 8 / 16 / 24 / 32 / 48px (unchanged) |
| `--space-3xl` | **NEW** 64px — empty-state vertical rhythm only |

Radius (unchanged): `--radius-sm` 4px (tags, kbd, inputs) · `--radius-md` 6px (buttons, chips) · `--radius-lg` 8px (panels) · `--radius-xl` 12px (modals, sheets — top corners only for sheets).

Elevation (unchanged vocabulary): `--shadow-0` flat · `--shadow-1` resting · `--shadow-2` popovers/sheets · `--shadow-3` modals · `--shadow-live` indigo ring+glow, **only** on the live Now strip.

Layout constants (new, documented for Engineer):
- TopBar height: **48px** (`h-12`), all breakpoints.
- Sidebar widths: desktop **224px** (`w-56`), tablet rail **56px** (`w-14`), mobile drawer **280px** (unchanged).
- Timeline spine: 1px `--border-default` at `left: 27px` (comfortable) — aligned to row padding.
- Max content width: none (dashboard uses full viewport); views pad with `--space-md` (mobile) / `--space-lg` (desktop).

---

## 6. Layout Structure

### 6.1 Shell (desktop ≥1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ TopBar · 48px                                                          │
│ ◆ CrewLoop │ Timeline        sess: architect · 4m 12s   ● Connected  │
│ (brand + view title, Space Grotesk 16px)      ⌘K  ◑ theme           │
├──────────┬───────────────────────────────────────────────────────────┤
│ ▸ 1 Overview│                                                         │
│ ▸ 2 Sessions│              View content area                          │
│ ▸ 3 Timeline│         (internal scroll; padding 24px)                 │
│ ▸ 4 Files   │                                                         │
│ ▸ 5 Skills  │                                                         │
│             │                                                         │
│ ⚙ 6 Settings│                                                         │
│  224px      │                                                         │
└──────────┴───────────────────────────────────────────────────────────┘
```

- **One title location:** TopBar shows brand (left) and the active view title after a 1px vertical divider. Views render **no** page-level heading (ViewHeader is deleted); section eyebrows inside views use `caption` uppercase.
- **Sidebar item (desktop):** 36px height (32px compact), icon 16px + label `text-label` + kbd hint (`text-micro`, muted, right-aligned, hidden on tablet rail). Active: `--accent-subtle` background + 2px `--accent` left inset + `--text-primary`. Hover (inactive): `--bg-elevated`. Focus-visible: `--focus` ring.
- **TopBar right cluster:** SessionSelector chip (max 200px, truncate) → connection indicator → ⌘K button → theme toggle; separated by 8px gaps, 1px divider before the cluster.
- **Connection indicator states:** `connected` = running-cyan dot + "Connected" label (`text-label`); `connecting` = warning dot pulsing + "Reconnecting…"; `disconnected` = error dot + "Offline". Below `sm`: **dot only**, always visible (label moves to `title` attr + screen-reader text).

### 6.2 Overview (the one asymmetric composition)

Desktop (12-col grid, 16px gaps, content-driven heights — **no fixed pixel heights**):

```
┌──────────────────────────────────────────────────────────────────────┐
│ NOW · live                                                    Open ▸   │
│ ◐ architect — reviewing spec 023         ● running · 94% · kimi · 2m41s│  ← Now strip (h ≈ 72px)
├──────────────────────────────────────────────────────────────────────┤
│  TOOLS  │ DURATION │ RATE/MIN │  FILES  │ ERRORS                       │  ← Telemetry strip (5 cells, hairline-divided)
│   142   │  12m 08s │   11.7   │    23   │    0                         │     numbers: display-xl tabular
├────────────────────────────────────┬─────────────────────────────────┤
│ ACTIVITY · last 40 buckets          │ LIVE                            │
│ ▁▃▅▂▇▅▃▆▂▁▃▅▇▆▅▃▂▁▂▃▅▆▇▅▃▁▂▃▅▂   │ 10:41:02 ● Read  design.md      │
│ (canvas, fills panel, RO-resized)   │ 10:41:05 ● Edit  tasks.md      │
│                                     │ 10:41:09 ● Bash  npm test      │
│                                     │ …  Open timeline →             │  ← Live preview (last 5 events)
├────────────────────────────────────┴─────────────────────────────────┤
│ RECENT SESSIONS                                                       │
│ [architect · 2m] [engineer · 14m] [reviewer · 6m] [shipper · 1m]  ▸   │  ← horizontal strip, scroll-snap
└──────────────────────────────────────────────────────────────────────┘
```

- **Now strip (ActiveSkillPanel, recomposed):** single row panel, `--shadow-live` only when the session is running. Left: skill icon (20px, accent) + skill name `text-display-lg` + detail line `text-body` secondary. Right cluster: lifecycle chip, confidence `text-micro`, source icon, elapsed `text-micro tabular`. Idle (no active skill): icon muted, name = "Idle", detail = "No active skill — waiting for events", no live shadow.
- **Telemetry strip:** one panel, five cells divided by 1px `--border-default` insets (not five cards). Cell: `caption` uppercase muted label over `display-xl tabular` value. Errors cell turns `--error` when > 0. Mobile: 2-col mini-grid (Errors spans full width if > 0).
- **ActivityGraph:** canvas inside a panel with `caption` header; bars = `--accent` at 50% opacity, current bucket 100%; track = `--bg-inset`; non-color redundancy: bucket height *is* the value (no color-only meaning); `aria-label` + sr-only text summary ("N events in the last M minutes").
- **Live preview:** 4-col panel, last 5 invocations rendered as compact timeline rows (same row anatomy as Timeline, no expand), footer link "Open timeline →" (ghost, navigates).
- **Recent sessions strip:** horizontal scroll row of session cards (200px each): skill name `text-label`, source icon + duration `text-micro`, lifecycle dot. `scroll-snap-x mandatory`, hidden scrollbar. Clicking selects the session (and updates URL).

**What is deliberately gone:** Top Skills, Top Tools, the sessions-count panel (their data lives in Skills/Sessions views), the `text-6xl` hero, and all fixed-height panels.

### 6.3 Timeline

```
┌──────────────────────────────────────────────────────────────────────┐
│ [search /] [Source▾] [Skill▾] [Status▾] [Tool▾] [Time▾]   142 results│  ← FilterBar
│                                                        ⏸ Pause  ⭳ Export│
├──────────────────────────────────────────────────────────────────────┤
│ ⏸ PAUSED — 12 events buffered                    [ Resume ]          │  ← PauseBanner (only when paused)
├──────────────────────────────────────────────────────────────────────┤
│ 10:41:02  ●  Read      design.md — 12 lines              340ms   ▸   │
│ 10:41:05  ●  Edit      tasks.md — +42 −8                 1.2s    ▸   │
│ ║  expanded payload (inset bg, mono micro, line-numbered)            │
│ 10:41:09  ●  Bash      npm test — exit 0                 4.8s    ▸   │
└──────────────────────────────────────────────────────────────────────┘
```

- **Row anatomy (comfortable / compact):** height 40px / 32px; time `text-micro tabular muted` (w-20); status dot 8px with sr-only status text; tool `text-label` primary; detail `text-body` secondary, single-line truncate; duration `text-micro tabular` right; caret 12px.
- **Row states:** default → hover `--bg-elevated` · keyboard-selected → `--accent-subtle` + 2px `--accent` left inset · expanded → payload well `--bg-inset`, `--radius-md`, `text-micro` · focus-visible → `--focus` ring (row is a real `<button>`).
- **PauseBanner:** full-width strip below FilterBar, `--accent-dim` background (dark) / `--accent-subtle` (light), 1px `--accent` bottom hairline, height 36px: pause icon (accent) + "Paused — N events buffered" `text-label` + Resume `btn-primary` small right. Enters with `banner-in` (below). Manual pause button in FilterBar toggles icon state (⏸/▶) and `aria-pressed`.
- New rows arriving live use `row-in` (existing); while paused they accumulate silently into the banner count.

### 6.4 Sessions

- **Toolbar:** FilterBar + sort segmented control on the right: `Recent · Duration · Events · Name` — ghost buttons, active = `--accent-subtle` + `--text-primary`; reflected in the URL.
- **Row (valid HTML, `div[role=button]`):** height 48px (comfortable) / 40px (compact): pin button (16px star, `--warning` when pinned, real `<button>`) → source icon → skill name `text-label` primary + session id `text-micro` muted → lifecycle dot w/ sr-only label → duration + events `text-micro tabular` right cluster → last-activity `text-micro` muted.
- **States:** hover `--bg-elevated` · selected session → `--accent-subtle` + left inset · focus ring · Enter/Space activates.
- **Empty result (filters match nothing):** inline muted row "No sessions match these filters" + clear-filters ghost button.

### 6.5 Files

Desktop (`md+`, unchanged split):

```
┌──────────────────────────────────────────────────────────────────────┐
│ [search /] [Op▾] [Time▾]                                              │
├──────────────────────┬───────────────────────────────────────────────┤
│ ▾ src/                │ src/lib/route.ts                              │
│   ▸ components/       │ [edit] [success]          [ Diff | Content ]  │
│   ▾ lib/              │ ┌───────────────────────────────────────────┐ │
│     • route.ts   E ✓  │ │ line-numbered diff, +/- coloring          │ │
│     • filter.ts  E ✓  │ │ mono micro                                │ │
│ • App.tsx        E ✓  │ └───────────────────────────────────────────┘ │
│ EXTERNAL FILES        │                                               │
│   • /abs/path   R ✓   │                                               │
└──────────────────────┴───────────────────────────────────────────────┘
```

Mobile (`<md`, drill-down):

```
LIST (selectedPath = null)              DETAIL (selectedPath set)
┌────────────────────────────┐          ┌────────────────────────────┐
│ [search] [filters]         │          │ ‹ Files                    │
│ ▾ src/                     │   tap →  │ src/lib/route.ts [E ✓]     │
│   • route.ts   E ✓         │          │ [ Diff | Content ]         │
│   • filter.ts  E ✓         │          │ ┌────────────────────────┐ │
│ • App.tsx      E ✓         │          │ │ diff/content viewer    │ │
└────────────────────────────┘          │ └────────────────────────┘ │
                                        └────────────────────────────┘
```

- **Tree rows:** 32px height; caret = Phosphor `CaretRight`/`CaretDown` 12px muted (replaces `▼`/`▶`); file name `text-body`; op chips (`R`/`E`/`O`, `text-micro`, bordered) + status badge right. Directory rows: `text-label` secondary, `role="treeitem"` + `aria-expanded`.
- **Mobile detail header:** back button (`CaretLeft` 16px + "Files" `text-label`) sticky top; path `text-label` truncate-middle; op/status chips; Diff|Content segmented tabs.
- **Detail entrance (mobile only):** `drill-in` — translateX(16px)→0 + fade, 200ms.

### 6.6 Skills

- Sole owner of aggregate rankings. Layout: 3 stat cells (skills / tools / files — same hairline-divided strip anatomy as Telemetry) over two ranked bar lists.
- **Bar rows:** name `text-label` (truncate) + count `text-micro tabular` + track `--bg-inset` full-width with fill `--accent` (skill bars) / `--running` (tool bars) at 70% opacity; width = value/max. `bar-in` on mount. Non-color redundancy: count text always present; bars are reinforcement, not the only signal.

### 6.7 Settings

- Sections as panels with `heading` title + `body` secondary description, controls right-aligned: **Appearance** (theme select, density toggle, reduced-motion toggle) · **Behavior** (auto-follow toggle, max-events number input) · **Keyboard shortcuts** (new): two-column table grouped by scope (Global / Timeline), keys as `.kbd`, action as `text-label` secondary. Mobile: sections stack, controls go full-width under their labels.

### 6.8 CommandPalette

- Modal 560px wide, positioned 15vh from top, `--radius-xl`, `--shadow-3`, scrim `--overlay`. Input row: search icon + `text-body` input + `esc` kbd right. Results grouped (`Views`, `Sessions`, `Skills`, `Tools`, `Files`, `Events`, `Actions`) with `caption` uppercase group headers. Row: 36px, icon 16px + title `text-label` + subtitle `text-micro` muted (right) + kbd hint for view items. Selected: `--accent-subtle` + accent left inset. Footer hairline + `↑↓` navigate · `↵` select · `esc` close (`text-micro` muted). Enter: `modal-in` (existing).

### 6.9 FilterBar

- Height 48px (comfortable) / 40px (compact), 1px bottom hairline. Search input: 220px min, `--bg-inset`, `/` kbd hint inside-right when empty and unfocused. Filter triggers: `.chip` with count badge (`text-micro` in `--accent-subtle`) when active. Result count right-aligned `text-micro` muted.
- **Popovers (`sm+`):** 220px, `--bg-elevated`, `--shadow-2`, `--radius-lg`, 4px below trigger; default left-anchored, **flip to right-anchored when the trigger's right edge is within 228px of the viewport edge**. Checkbox rows 32px with check icon (accent) + label `text-label`; **Time group uses radio semantics** (single checkmark). `Esc` closes; outside click closes (existing).
- **Sheet (`<sm`):** bottom sheet — full width, max-height 70vh, `--radius-xl` top corners, `--shadow-2`, drag handle (32×4px `--border-strong` pill, centered, 8px top), scrim `--overlay` with `sheet-scrim-in` fade. Sections accordion-stacked; 44px row heights (touch). Apply is implicit (live filtering) with a "Done" `btn-primary` footer. Enter: `sheet-in`.

---

## 7. Component States (shared primitives)

| Component | Default | Hover | Active/Selected | Focus | Disabled |
|-----------|---------|-------|-----------------|-------|----------|
| Nav item | transparent, secondary text | `--bg-elevated` | `--accent-subtle` + 2px accent inset + primary text | `--focus` ring | — |
| `.chip` | border `--border-default`, secondary | `--bg-elevated` | `.chip-active`: accent border + primary text (existing) | ring | 40% opacity |
| `.btn-primary` | `--accent` fill, near-white text | brightness via `--accent-strong` overlay 10% | scale(0.98) (existing) | ring | 50% opacity, no pointer |
| `.btn-ghost` | transparent, secondary | `--bg-elevated` + primary text | — | ring | 40% opacity |
| List row (timeline/session) | transparent | `--bg-elevated` | `--accent-subtle` + left inset | ring | — |
| Input | `--bg-inset` + `--border-default` | `--border-strong` | — | accent border + ring | muted |
| Toggle | track `--bg-inset` | `--border-strong` | track `--accent`, knob translateX | ring | 50% |
| Status dot | semantic color fill | — | — | — | sr-only label always |

---

## 8. Real-State Specs

| State | Treatment |
|-------|-----------|
| **Loading (initial WS snapshot)** | Skeletons that mirror the final layout: Now strip = two shimmer bars (72px panel), telemetry = 5 shimmer cells, graph = shimmer block, lists = 6 shimmer rows. `.animate-shimmer` (existing). Never a spinner alone for > 1s. |
| **Empty (no sessions at all)** | Centered composition in the view area: Phosphor `TerminalWindow` 32px muted → `text-display-lg` "No sessions yet" → `text-body` secondary "Start a session with a compatible agent; events stream here in real time." No fake CTA buttons. Vertical rhythm uses `--space-3xl`. |
| **Empty (filters match nothing)** | Inline muted row inside the list area: "Nothing matches these filters" + ghost "Clear filters" action. |
| **Error (REST fetch, e.g. file content/diff)** | Inline error well in the detail pane: `--error` left border, `--bg-inset`, message `text-label` + "Retry" `btn-ghost`. |
| **Offline (WS disconnected)** | TopBar connection dot → error color + "Offline" (dot-only on mobile); a one-line strip under TopBar: `--error`-tinted hairline banner "Connection lost — reconnecting…" while status is `connecting`. Last-known data stays visible; no layout shift. |
| **Success (copy to clipboard)** | Toast bottom-right, `--bg-elevated` + success left border, `toast-in` (existing), auto-dismiss 2s: "Copied". |
| **Paused (timeline)** | PauseBanner per 6.3. |

---

## 9. Motion Choreography

All animations transform/opacity only; the existing global `prefers-reduced-motion` kill-switch covers every entry below. Durations follow "short entrances, shorter exits".

| Animation | Trigger | Property | Duration | Easing | Reduced-motion fallback |
|-----------|---------|----------|----------|--------|------------------------|
| View enter | route change | opacity | 150ms | ease-out | instant (existing `fade-in`) |
| Row enter (live) | new timeline row | opacity, translateY(4px) | 200ms | `cubic-bezier(0.25, 1, 0.5, 1)` | instant (existing `row-in`) |
| Bar fill (skills) | mount | opacity, translateX(-4px) | 200ms | ease-out | instant (existing `bar-in`) |
| Modal/palette enter | open | opacity, scale(0.96→1) | 200ms | `cubic-bezier(0.25, 1, 0.5, 1)` | opacity only (existing `modal-in`) |
| **Sheet enter (new `sheet-in`)** | filter open `<sm` | translateY(100%→0) | 250ms | `cubic-bezier(0.25, 1, 0.5, 1)` | opacity only |
| **Sheet scrim (new `sheet-scrim-in`)** | with sheet | opacity | 200ms | ease-out | none needed |
| **Banner enter (new `banner-in`)** | pause starts | opacity, translateY(-4px) | 150ms | ease-out | instant |
| **Drill enter (new `drill-in`)** | file detail `<md` | opacity, translateX(16px→0) | 200ms | `cubic-bezier(0.25, 1, 0.5, 1)` | opacity only |
| Row select change | keyboard/click | background-color | 120ms | ease-out | instant (color transition, no motion) |
| Button press | click | scale(0.98) | 120ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | instant (existing) |
| Toast | copy/success | opacity, translateY(4px) | 200ms | `cubic-bezier(0.25, 1, 0.5, 1)` | opacity only (existing) |
| Data value change | metric update | opacity crossfade | 150ms | ease-out | instant swap — **no count-up animations** |

New keyframes to add in `index.css`: `sheet-in`, `sheet-scrim-in`, `banner-in`, `drill-in` (+ utility classes `.animate-sheet-in`, etc.).

---

## 10. Responsive Rules

| Breakpoint | Shell | Content |
|------------|-------|---------|
| `<768px` (mobile) | TopBar 48px, hamburger left, brand text hidden (mark only), connection **dot-only**, theme toggle visible; sidebar = 280px drawer with scrim | Padding 16px; Overview stacks (telemetry 2-col, preview capped at 3 events, sessions strip scrolls); FilterBar → search + "Filters" button opening the bottom sheet; Files = drill-down; Timeline rows keep anatomy, detail truncates harder; touch targets ≥44px in sheet/drawer |
| `768–1023px` (tablet) | Sidebar = 56px icon rail (labels via tooltips + sr-only); connection label visible from `sm` | Padding 16–24px; Overview: graph + preview stack (graph full width); Files keeps split if ≥`md` per Tailwind; popovers still edge-flip |
| `≥1024px` (desktop) | Full shell per 6.1 | Padding 24px; full compositions |

Density (`density-compact`) affects spacing only (panel padding, row heights) — never type size. Mobile drawer/sheet respect safe-area insets (`env(safe-area-inset-*)`) on bottom edges.

---

## 11. Mockups (contextual)

1. **Browser-frame desktop — Overview (dark):** The shell from 6.1 framing the Overview from 6.2. The eye lands on the Now strip's indigo-edged live panel, drops to the five-cell telemetry strip, then splits between the activity graph and the live preview. Compared to 022: same palette, but the 656px hero void is gone — the fold now carries ~3× the signal.
2. **Device mobile — Files drill + paused Timeline (dark):** 390px viewport. Files shows the list with chevrons; tapping a file drills into the detail with a `‹ Files` back header. Timeline shows the accent-edged PauseBanner ("Paused — 12 events buffered · Resume") above rows; the FilterBar is one search field + a Filters button that raises the bottom sheet with its drag handle.
3. **Before/after — 022 vs 023 (same view, Timeline):** Before: 40px duplicate ViewHeader under a TopBar that already says "Timeline", rows clickable only by mouse, pause-on-hover invisible. After: one title, rows with visible keyboard selection (accent inset), a pause button with state, and a banner that counts buffered events. Same colors, same fonts — the upgrade is structural honesty, not new paint.

---

## 12. Assets

- **Icons:** Phosphor (`@phosphor-icons/react`, existing). Additions to the `Icon.tsx` map if missing: `CaretRight`, `CaretDown`, `CaretLeft`, `Pause`, `Play`, `ArrowDown`, `ArrowUp`, `ArrowsDownUp` (sort), `TerminalWindow`, `Star`. Weight: regular; sizes 12/16/20px per spec above. No emoji as structural icons.
- **Images/textures:** none. No gradients, no noise, no glassmorphism.
- **Fonts:** unchanged — Space Grotesk + JetBrains Mono via existing `index.html` links.
- **Export spec:** not applicable (no new static assets).

## 13. Data Visualization Spec

- **ActivityGraph (canvas):** track `--bg-inset`; bars `--accent` at 50% opacity, current bucket 100%; no grid lines (bucket spacing provides rhythm); values readable via height + the sr-only summary; Reviewer verifies canvas redraw on resize (ResizeObserver per `design.md`).
- **Ranked bars (Skills):** per 6.6 — fill colors carry *category* (skill vs tool), counts carry the value in text; contrast of fills against `--bg-inset` ≥3:1 in both themes.

## 14. Interaction & Flow Spec

- **Primary navigation:** sidebar (3 modes) + digits 1–6 + command palette — all routed through `navigate()` per `design.md`, all reflecting `NAV_ITEMS`.
- **Overlays:** command palette (focus-trapped, `Esc` closes — existing), filter popovers (edge-flip, `Esc` closes), filter sheet `<sm` (scrim tap or `Esc` or "Done" closes), session selector listbox (arrow keys + `Esc`).
- **Keyboard:** per `design.md` shortcut table; `.kbd` styling for all hints; shortcuts reference lives in Settings.
- **Focus order:** TopBar → sidebar → view toolbar → content; skip is not needed (single-screen app), but every interactive element must be reachable in DOM order.

## 15. Accessibility Constraints (summary gate)

- Contrast per section 3 table; `--text-muted` restricted to meta ≥ caption size.
- Focus-visible ring (`--focus`, 2px, offset 2px) on every interactive element (existing global rule retained).
- Touch targets ≥44px in mobile sheet/drawer and all `<sm` interactive rows; desktop pointer rows may be 32–40px.
- Color-only meanings eliminated: status dots get sr-only labels; graph/bars have text redundancy.
- All overlays: focus trap or natural DOM order, `Esc` to close, scrim click to close (sheet/palette).
- `prefers-reduced-motion` kill-switch retained; new keyframes covered by it.

## 16. Pre-Implementation Checklist (output-checklist.md gate)

- [x] Brand narrative ties direction to audience/problem (section 1).
- [x] Singular explicit thesis: Linear-like Minimalist + Dense utility stack (section 2).
- [x] Reference files cited (section 2).
- [x] Semantic custom color system; no boilerplate values (section 3 — 022 palette retained by decision, two atomic additions).
- [x] Intentional typography: 8-step scale, family assignment, exact sizes/leading/tracking (section 4).
- [x] Tokens cover spacing, radius, elevation, typography (sections 3–5).
- [x] Contrast targets verified and restricted usages flagged (section 3).
- [x] Touch targets specified per breakpoint (section 10/15).
- [x] Focus states specified (sections 6, 7, 15).
- [x] Real states: loading, empty (both kinds), error, offline, success, paused (section 8).
- [x] Three contextual mockups described (section 11).
- [x] Motion table with reduced-motion fallbacks (section 9).
- [x] No emoji as structural icons (section 12).
- [x] Chart contrast + non-color indicators (section 13).
- [x] Overlay behaviors: focus, `Esc`, scrim (section 14).
- [x] Keyboard shortcuts + palette spec'd (sections 6.8, 14).
- [x] Slop detector passed: identity rests on mono-data typography + single indigo pulse + instrument-panel density — remove the logo and it still reads as a developer console, not a generic SaaS template.
- [x] Layout asymmetry/tension: Overview 8+4 split, hairline telemetry strip, one dominant component per view (section 6).

---

**Handoff:** Engineer implements per `design.md` phases 3–6 with the visual values above. `tasks.md` Phase 2 is complete with this document.
