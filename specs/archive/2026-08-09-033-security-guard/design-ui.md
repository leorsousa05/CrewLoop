# UI/UX Design: Security View

## 1. Context Frame

The Security view surfaces decisions made by `crewloop-guard` for the currently selected session. It is a monitoring/audit surface aimed at users who want to verify that their guard policy is working without leaving the dashboard. The design must feel consistent with the existing Vercel-style command center: quiet, information-dense, and reactive.

**Register:** Quiet Console (same as the rest of the dashboard). No expressive marketing aesthetic.

**References used:**
- `servers/dashboard/ui/src/styles/index.css` — color tokens, spacing, radius, typography
- `servers/dashboard/ui/src/lib/navigation.ts` — view registration pattern
- `servers/dashboard/ui/src/components/views/Overview.tsx` — panel and empty-state patterns
- `servers/dashboard/ui/src/components/views/SessionsView.tsx` — list row and badge patterns
- `servers/dashboard/ui/src/components/ui/StatusBadge.tsx` — badge component reference

## 2. Aesthetic Direction Statement

The Security view uses the existing cool-graphite surface palette and relies on semantic color (success/error) only for decision badges. Layout is a single scrolling panel with a sticky summary header, keeping the visual weight low so that large decision logs remain scannable.

## 3. Color System

Reuse existing semantic tokens; no new colors.

| Token | Usage |
|-------|-------|
| `--bg-base` | Page background |
| `--bg-surface` | Decision cards/table background |
| `--bg-elevated` | Hover state on rows |
| `--border-default` | Card/row borders |
| `--text-primary` | Tool names, counts |
| `--text-secondary` | Rule names, reasons |
| `--text-muted` | Timestamps, empty-state copy |
| `--success` | Allowed badge |
| `--error` | Blocked badge |
| `--warning` | Audit-only mode notice |

## 4. Typography System

Use the existing Quiet Console scale.

| Element | Token | Weight |
|---------|-------|--------|
| View title | `text-heading` | 600 |
| Summary numbers | `text-display-lg` | 700 |
| Summary labels | `text-caption` | 600 uppercase |
| Decision tool | `text-body` / `font-mono` | 500 |
| Decision rule/reason | `text-label` | 400 |
| Timestamp | `text-micro` | 400 |
| Empty state title | `text-display-lg` | 600 |
| Empty state body | `text-body` | 400 |

## 5. Design Tokens

- **Spacing:** `space-md` (16px) page padding; `space-sm` (8px) inside summary cards; `space-xs` (4px) between inline elements.
- **Radius:** `radius-lg` (8px) for panels, `radius-md` (6px) for badges.
- **Borders:** 1px solid `border-default`.

## 6. Component Specs

### 6.1 DecisionBadge

Variant of `StatusBadge` adapted for guard decisions.

| Decision | Text | Border | Dot |
|----------|------|--------|-----|
| `allow` | "allow" | `border-success/35` | `bg-success` |
| `block` | "block" | `border-error/35` | `bg-error` |

- Font: `text-micro font-semibold uppercase px-1.5 py-0.5 rounded border inline-flex items-center gap-1.5`.

### 6.2 Summary Cards

Three horizontal cards in a row at the top of the view:

1. **Mode** — shows current guard mode: "Block" or "Audit". In audit mode, show a `warning` colored helper text: "Decisions are logged but tools are not blocked."
2. **Allowed** — large number + "allowed" label.
3. **Blocked** — large number + "blocked" label.

Card style: `panel flex flex-col gap-1 p-4`.

### 6.3 Decision Row

Each decision is a row inside a `panel`:

| Column | Content |
|--------|---------|
| Time | `text-micro text-text-muted tabular` formatted as `HH:MM:SS` |
| Tool | `font-mono text-body text-text-primary` |
| Decision | `DecisionBadge` |
| Rule | `text-label text-text-secondary` (empty if no rule) |
| Reason | `text-label text-text-secondary truncate` (empty if no reason) |

Row style: `flex items-center gap-4 px-4 py-2.5 border-b border-border-default last:border-0 hover:bg-elevated transition-colors cursor-default`.

### 6.4 Empty State

When the selected session has no security decisions:

- Centered vertically and horizontally.
- Icon: `Shield` at `w-8 h-8 text-text-muted`.
- Title: "No security decisions yet" (`text-display-lg text-text-primary`).
- Body: "Guard events will appear here once `crewloop-guard` is installed and the agent runs a PreToolUse hook." (`text-body text-text-secondary max-w-sm`).

When no session is selected, mirror the Overview empty-state copy style: "Select a session to view guard decisions."

### 6.5 Loading State

Show 6 shimmering row skeletons with `animate-shimmer` class. Background uses `bg-elevated` blocks.

## 7. Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar  │  Security                                       │
│           │  ┌─────────┬──────────┬──────────┐             │
│           │  │ Mode    │ Allowed  │ Blocked  │             │
│           │  │ Audit   │   42     │    3     │             │
│           │  └─────────┴──────────┴──────────┘             │
│           │                                                 │
│           │  ┌─────────────────────────────────────────┐   │
│           │  │ Decisions                               │   │
│           │  │ ─────────────────────────────────────── │   │
│           │  │ 12:34:56  Read      allow  safe-path    │   │
│           │  │ 12:34:58  Bash      block  destructive  │   │
│           │  │          rm -rf matched                 │   │
│           │  │ 12:35:01  Write     allow  workspace    │   │
│           │  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- Page padding: `p-4 md:p-6`.
- Summary grid: `grid grid-cols-1 md:grid-cols-3 gap-4`.
- Decisions panel: `panel mt-4` with header `text-caption uppercase tracking-wide text-text-muted px-4 py-3 border-b border-border-default`.

## 8. Real-State Specs

| State | Visual Treatment |
|-------|------------------|
| **Loading** | 6 shimmer rows in decisions panel; summary cards show `—` instead of numbers. |
| **Empty (session selected)** | Centered icon + title + body as defined in §6.4. |
| **Empty (no session)** | "Select a session to view guard decisions." |
| **Error fetching decisions** | Inline banner at top: `bg-error/10 border-b border-error/30 text-micro text-error px-4 py-2`. Message: "Unable to load security decisions." |
| **Audit mode active** | Mode card includes `warning` colored micro text: "Tools are logged, not blocked." |
| **New decision arrives** | Row animates in with `animate-row-in`; badge pulses once if decision is `block`. |

## 9. Motion

- New rows: `animate-row-in` (200ms, opacity + translateY).
- Blocked decision badge: single 200ms pulse on arrival (reuse `animate-pulse` with one iteration via JS or class toggle).
- Hover transitions: 150ms background-color.
- Reduced motion: all animations collapse to instant via existing `prefers-reduced-motion` media query.

## 10. Pre-Implementation Checklist

- [ ] Contrast: success/error text on surface meets WCAG AA (existing tokens already verified).
- [ ] Touch targets: decision rows are not interactive, but any buttons (e.g., refresh) are ≥44×44 px.
- [ ] Focus states: inherited from `:focus-visible` in `index.css`.
- [ ] Keyboard: view reachable via sidebar shortcut `7`; no custom shortcuts required.
- [ ] Navigation: add `security` to `View` union in `lib/types.ts` and to `NAV_ITEMS` with icon `Shield`, shortcut `7`, description "Guard decisions and policy status".
