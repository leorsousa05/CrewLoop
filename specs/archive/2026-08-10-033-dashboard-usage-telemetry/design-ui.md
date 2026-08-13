# UI/UX Visual Specification: Dashboard Usage Telemetry

## 1. Context Frame

- **Problem:** The dashboard exposes live token totals per selected session but loses history, cannot compare coding-agent products, and spends Overview space on a redundant Skill Activity graph.
- **Audience:** Developers who need to understand which coding product consumes the most tokens, how consumption changes by day, and where telemetry or pricing coverage is incomplete.
- **Surface:** Operational dashboard used repeatedly for long sessions; optimize for scan speed, exact values, and honest uncertainty.
- **Register:** Preserve the existing **Industrial / Utilitarian** direction from spec 031, supported by **Quiet / Product Default** restraint for the new analytics surface.
- **Hierarchy:** Daily product comparison is the dominant surface. Trend is supporting evidence. The exact table is the audit surface and accessible equivalent.
- **Supersession:** This file replaces only spec 031's Overview instruction that pairs ActivityGraph with Live. All other responsive, accessibility, typography, token, and motion decisions in spec 031 remain in force.

Reference grounding:

- `references/surfaces/dashboard.md` — dense data-first anatomy, honest stale/error states, and chart accessibility.
- `references/registers/industrial-utilitarian.md` — operational hierarchy, tabular numerals, visible frames, and restrained effects.
- `references/registers/quiet-product.md` — semantic grouping, unobtrusive controls, and explicit destructive actions.
- `references/layout-patterns.md` — dense utility stack and hierarchy-preserving mobile order.
- `references/color-playbook.md` — semantic color roles rather than decorative palette expansion.
- `references/typography-playbook.md` — semi-condensed heading plus monospaced operational values.
- `references/motion-playbook.md` — instant live data and near-zero transition posture.
- `references/anti-patterns.md` — no generic equal-card dashboard, gradient, glow, or decorative chart.

## 2. Aesthetic Direction Statement

Usage should feel like an instrument panel, not a billing product. It keeps CrewLoop's graphite/indigo frames, compact monospaced data, and visible structural dividers, then uses spacing and one dominant comparison region to make the answer obvious: which product consumed the most tokens in the selected period. Unknown data remains visibly unknown; the interface never beautifies missing telemetry into a zero or a complete dollar figure.

## 3. Color System

Reuse spec 031's semantic tokens without changing the application palette:

| Role | Light | Dark | Usage |
|------|-------|------|-------|
| `--bg-base` | `hsl(216 30% 97%)` | `hsl(224 30% 7%)` | Page atmosphere |
| `--bg-surface` | `hsl(216 25% 100%)` | `hsl(222 28% 10%)` | Comparison, chart, and table surfaces |
| `--bg-elevated` | `hsl(216 24% 94%)` | `hsl(222 26% 14%)` | Controls, skeletons, selected rows |
| `--bg-inset` | `hsl(216 22% 92%)` | `hsl(224 30% 5%)` | Chart plot and recessed numeric areas |
| `--text-primary` | `hsl(222 40% 12%)` | `hsl(210 35% 96%)` | Headings, totals, table values |
| `--text-secondary` | `hsl(217 15% 38%)` | `hsl(215 16% 72%)` | Descriptions and secondary metrics |
| `--text-muted` | `hsl(217 12% 48%)` | `hsl(215 14% 57%)` | Timestamps and non-critical metadata |
| `--accent` | `hsl(232 78% 55%)` | `hsl(230 88% 72%)` | Selected range, primary series, links, focus-adjacent action |
| `--success` | `hsl(153 62% 31%)` | `hsl(153 55% 50%)` | Complete measured coverage only |
| `--warning` | `hsl(38 88% 39%)` | `hsl(38 90% 58%)` | Partial telemetry/pricing, ongoing day |
| `--error` | `hsl(7 70% 47%)` | `hsl(7 75% 62%)` | Fetch/reset failure and destructive action |
| `--border-default` | `hsl(216 18% 84%)` | `hsl(222 20% 19%)` | Frames and dividers |
| `--border-strong` | `hsl(216 16% 68%)` | `hsl(222 18% 31%)` | Hover/selected boundaries |
| `--focus` | `hsl(232 90% 48%)` | `hsl(230 95% 76%)` | 2px focus ring |

Chart series do not introduce five saturated brand colors. All series use a restrained blue-grey range derived from `--accent`, `--text-secondary`, and `--text-muted`, with unique marker shapes and dash patterns. The hovered or keyboard-selected series becomes `--accent`; non-selected series retain sufficient graphical contrast. Product icons and text labels are always present.

| Product | Line pattern | Marker | Visual label |
|---------|--------------|--------|--------------|
| Codex | Solid | Circle | `Codex` |
| Kimi | Long dash | Square | `Kimi` |
| Claude | Short dash | Triangle | `Claude` |
| OpenCode | Dot | Diamond | `OpenCode` |
| AGY | Dash-dot | Cross | `AGY` |

Never use success/warning/error hues merely to distinguish products. Those colors remain semantic.

## 4. Typography System

Use the existing locally served/fallback strategy from spec 031. No external font request and no new family.

| Role | Family | Size / line-height | Weight | Details |
|------|--------|--------------------|--------|---------|
| View heading | Space Grotesk/fallback | 20px / 1.25 | 600 | `Usage`; one visible `h1` |
| Primary total | JetBrains Mono/fallback | 24px / 1.15 | 600 | Tabular figures; never animated/counting |
| Section heading | Space Grotesk/fallback | 16px / 1.3 | 600 | Comparison, trend, daily detail |
| Body | JetBrains Mono/fallback | 13px / 1.5 | 400 | Operational copy and table values |
| Label | JetBrains Mono/fallback | 12px / 1.4 | 600 | Controls, badges, headers |
| Caption | JetBrains Mono/fallback | 11px / 1.4 | 400-600 | Timezone, coverage, last updated |

All numeric cells use `tabular-nums` and align right. Use compact notation (`1.24M`) only in summaries and charts; the table exposes exact localized integers and exact USD precision appropriate to the value. `Unavailable` and `No telemetry` are words, never em dashes without an accessible explanation.

## 5. Design Tokens

- **Spacing:** 4px base; 8px control gap; 12px dense row gap; 16px panel gap/padding; 20px desktop data-surface padding; 24px page gutter on desktop; 16px mobile gutter.
- **Radius:** 0px table/grid cells; 4px panels and controls; 8px only for the destructive confirmation dialog inherited from the global overlay system.
- **Borders:** 1px `--border-default`; selected/hovered rows use `--border-strong`; no borderless floating cards.
- **Elevation:** page is flat; data surfaces use frames; range popover/dialog may use the existing elevated shadow. No chart shadow.
- **Rows:** 40px desktop minimum; 44px mobile. Daily table header is sticky once its own scroll area exceeds one viewport.
- **Focus:** 2px `--focus` ring with 2px offset, never clipped.
- **Content width:** fill available dashboard width; cap internal plot readability near 1600px without turning the page into a centered document.

## 6. Layout Structure

### Desktop (1280px and wider)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Usage                                             7D  [30D]  90D  ALL  ↻     │
│ Daily consumption by coding-agent product · America/Sao_Paulo               │
├──────────────────────────────────────────────────────────────────────────────┤
│ TOTAL TOKENS       REPORTING PRODUCTS       EST. API USD       LAST UPDATED │
│ 18,402,391          2 of 5                   $12.42 · PARTIAL    14:32:08     │
├────────────────────────────────────┬─────────────────────────────────────────┤
│ PRODUCT COMPARISON                 │ DAILY TREND                    TOKENS ▾ │
│ Codex      █████████████  12.8M    │ ─●────────●──...                         │
│ Kimi       ██████          5.6M    │ ┄■────■──────...                         │
│ ───────────────────────────────    │ --△ No telemetry series is omitted      │
│ Claude                  NO DATA    │ Legend: marker + pattern + product      │
│ OpenCode                NO DATA    │                                         │
│ AGY                     NO DATA    │                                         │
├────────────────────────────────────┴─────────────────────────────────────────┤
│ DAILY DETAIL                                                           ⇩    │
│ DATE       PRODUCT    TOTAL      INPUT      OUTPUT      CACHE ...  EST. USD │
│ 2026-08-10 Codex      1,203,442  ...                               $1.22*   │
│             Current day is ongoing · * partial estimate                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

- The page header is one compact row plus one description line; there is no hero.
- The summary strip is one framed surface with hairline dividers, not four independent cards.
- The comparison region occupies 5/12 columns and answers the primary question. The trend occupies 7/12 columns.
- Product bars use the maximum measured product as 100%; unavailable products appear after a divider with no empty bar track.
- The exact daily table spans full width below and is the source for detailed audit.

### Tablet (768-1279px)

- Page header wraps range controls to a second row without detaching them from the heading.
- Summary becomes a 2×2 divided grid while retaining one outer frame.
- Comparison and trend stack, comparison first.
- Daily table remains horizontally scrollable; Date and Product form the sticky left context where browser support allows.

### Mobile (below 768px)

```text
┌────────────────────────────────────┐
│ Usage                         ↻    │
│ Daily by product · local timezone  │
│ [7D] [30D] [90D] [ALL]             │
├────────────────────────────────────┤
│ TOTAL TOKENS        18.4M          │
│ REPORTING           2 OF 5         │
│ EST. API USD        $12.42 PARTIAL │
│ UPDATED             14:32          │
├────────────────────────────────────┤
│ PRODUCT COMPARISON                 │
│ Codex                     12.8M    │
│ ██████████████████████████████     │
│ Kimi                       5.6M    │
│ █████████████                         │
│ 3 products · NO TELEMETRY          │
├────────────────────────────────────┤
│ DAILY TREND        [TOKENS ▾]      │
│ horizontally scrollable plot       │
│ legend remains visible             │
├────────────────────────────────────┤
│ DAILY DETAIL →                     │
│ horizontally scrollable exact table│
└────────────────────────────────────┘
```

- Preserve hierarchy; do not flatten into equal cards.
- Range and refresh controls meet 44px targets.
- The comparison remains before the chart/table.
- Table scrolling does not move the view heading or range controls.

### Overview Delta

```text
BEFORE                                  AFTER
┌──────────────────────┬───────────┐    ┌────────────────────────────────────┐
│ Skill Activity       │ Live      │    │ Live                               │
│ redundant canvas     │ narrow    │    │ full-width, five recent operations│
└──────────────────────┴───────────┘    └────────────────────────────────────┘
```

- Remove only `Skill Activity` and its canvas.
- Live spans the full content width and keeps the existing five-operation preview plus Open Timeline action.
- Recent Sessions remains full width below.
- ActiveSkillPanel, TelemetryPanel, Skills view, and active-skill inference are unchanged.

## 7. Component Specifications

### View Header and Range Controls

- `h1` is `Usage`; description states aggregate scope and pinned timezone.
- Segmented range uses real buttons inside an accessible labelled group: `7 days`, `30 days`, `90 days`, `All history`.
- Selected range uses accent text, subtle accent surface, and a text/ARIA selected state; hover changes border/surface; disabled state remains readable.
- Refresh is an icon button with visible tooltip/accessibility name and last-success timestamp nearby. It does not spin continuously; one 120ms opacity feedback is sufficient.
- `Clear history` is a visible secondary/destructive text action near Daily Detail, never hover-only. It opens a confirmation dialog requiring the explicit confirmation defined by the API contract.

### Summary Strip

- Four columns: Total Tokens, Reporting Products, Estimated API-equivalent USD, Last Updated.
- Total Tokens sums only products with non-null telemetry.
- Reporting Products reads `N of 5`; unavailable products do not disappear.
- Cost value is followed by `Complete`, `Partial`, or `Unavailable`; partial includes priced-token coverage in accessible text.
- Last Updated uses the last successful query time, not render time.
- Default is flat framed surface; hover has no effect because metrics are not controls.

### Product Comparison

- One row per supported product in fixed product label order only for unavailable rows; measured rows sort by total descending.
- Each measured row includes source icon, name, availability/coverage label, horizontal bar, exact total, and optional cost.
- Bar length is visual support. Exact total is always visible.
- Selected/keyboard-focused product highlights its trend series and table rows. Use a real button only if selection/filtering is implemented; otherwise rows are non-interactive groups.
- `No telemetry` rows have muted inset treatment, an explanatory label, and no zero-length bar.
- Measured zero uses a visible `0` and a minimal baseline marker distinct from No telemetry.

### Daily Trend

- Default metric is Tokens. Optional metric selector offers Tokens and Estimated USD; USD is disabled only when every product is unpriced, with an explanation.
- Chart includes title, visible legend, axis labels, hover/focus tooltip, current-day annotation, and an `sr-only` summary naming highest product/day and coverage.
- Series use marker + dash pattern + label in addition to restrained color.
- Missing days create line gaps; they are not interpolated as zero. A measured zero may sit on the baseline.
- Current local day uses an `Ongoing` annotation and warning-toned caption, not a warning-colored series.
- Chart does not animate on refresh. User range/metric changes may crossfade plot opacity for 120ms.

### Daily Detail Table

- Caption: `Daily token usage by coding-agent product` plus active range/timezone.
- Columns: Date, Product, Quality, Total, Input, Output, Cache Read, Cache Write, Reasoning, Estimated API USD.
- Column headers use `scope="col"`; date groups may use `scope="rowgroup"` or repeat explicit dates for reliable screen-reader context.
- Numeric columns right-align with tabular figures. Unknown categories read `Unavailable`; they are not converted to zero.
- Current day includes `Ongoing` after its date.
- Table provides the exact text equivalent for all chart data and supports keyboard scrolling.

### Clear History Confirmation

- Dialog title: `Clear usage history?`
- Copy: `This removes persisted token measurements and comparisons for all products. It cannot be undone. Live agent events are not deleted.`
- Primary destructive action: `Clear history`; secondary: `Cancel`.
- Focus begins on Cancel, is trapped, Escape cancels, and returns to the trigger.
- While submitting, disable both actions and show `Clearing…` as text. On success, close and render the empty state. On failure, keep the dialog open with an inline safe error.

## 8. Real-State Specifications

| State | Treatment | Required copy/action |
|-------|-----------|----------------------|
| Initial loading | Shape-matched skeleton for summary, five comparison rows, chart plot, and table header; container `aria-busy=true` | Polite `Loading usage history` announcement |
| Refreshing | Keep valid data visible; soften Last Updated and disable duplicate refresh | `Refreshing usage history` in polite live region |
| Empty | One framed state in the primary zone; product rows still list all five as No telemetry | `No persisted token telemetry yet.` Explain that supported agents appear when counters arrive |
| Partial telemetry | Warning strip below header, data still visible | Name affected products; never block comparison |
| Partial pricing | Cost metric carries `Partial estimate` and coverage | Explain that tokens remain complete where measured |
| Initial error | Inline error frame in primary zone; no fake zero metrics | `Usage history could not be loaded.` + Retry |
| Refresh error | Retain prior data, mark `Stale`, show last successful update | Retry without clearing valid content |
| Success | Data surfaces render immediately; no success toast | Last Updated timestamp is sufficient |
| Reset success | Transition to true empty state and announce politely | `Usage history cleared` |
| Reset error | Dialog retains context with inline safe error | Retry or Cancel |
| Offline WebSocket | Existing global connection banner remains; historical REST data is still usable | Usage copy must not claim history is stale solely because WebSocket is offline |
| No cost coverage | Tokens remain primary; USD metric reads Unavailable | Explain unknown model/reported-cost requirement |

Skeleton motion is disabled under effective reduced motion. Error and stale states never erase previously valid data.

## 9. Motion

Motion budget is two transitions:

| Motion | Trigger | Property | Duration | Reduced-motion |
|--------|---------|----------|----------|----------------|
| Data crossfade | User changes range or metric | opacity | 120ms ease-out | Instant |
| Confirmation dialog | Open/close | opacity + translateY ≤4px | 160ms ease-out | Opacity 60ms or instant |

Live refresh, bar lengths, chart paths, and numbers update instantly. No count-up, path drawing, stagger, bounce, spring, or decorative entrance.

## 10. Pre-Implementation Checklist

- [ ] Industrial / Utilitarian remains the single dominant direction; no generic SaaS card grid appears.
- [ ] Existing light/dark semantic tokens are reused; product series do not consume status colors.
- [ ] Body text meets 4.5:1; graphical lines, markers, focus rings, and control boundaries meet 3:1.
- [ ] Every mobile control and destructive action target is at least 44×44px.
- [ ] Default, hover, active/selected, focus-visible, disabled, submitting, and error states are defined for controls.
- [ ] Loading, empty, partial, stale, initial error, refresh error, success, reset, offline, and no-pricing states are implemented.
- [ ] No telemetry is distinct from measured zero in summary, comparison, chart, table, and screen-reader copy.
- [ ] Estimated USD is always qualified as API-equivalent and exposes coverage.
- [ ] Chart series combine marker, dash pattern, label, and restrained color; the table is an exact equivalent.
- [ ] `h1`, group labels, table caption/headers, live regions, and dialog semantics form a useful screen-reader path.
- [ ] Range shortcuts, `#/usage` route, sidebar, palette, TopBar, back/forward, and Settings shortcut 7 remain coherent.
- [ ] Usage ignores selected-session changes and does not show a misleading session selector.
- [ ] Overview has no empty grid column after ActivityGraph removal.
- [ ] Reduced motion produces instant data changes and an instant/opacity-only dialog.
- [ ] Desktop ≥1280px, tablet 768-1279px, and mobile <768px preserve comparison-first hierarchy.
- [ ] No external fonts, gradients, glow, glass blur, decorative illustration, oversized radius, or animated numbers are introduced.
