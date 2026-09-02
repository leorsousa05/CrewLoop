# Dashboard Responsive UI Design

## Design context

CrewLoop's dashboard is an internal operational console for developers and AI-workflow operators. Its job is to make the current session, active skill, event stream, files, usage, and settings legible while the system is changing. The six existing views and their routes remain unchanged:

| View | Primary question | Primary surface |
| --- | --- | --- |
| Overview | What is happening now? | Active-skill state, current session summary, recent activity |
| Timeline | What happened, in what order? | Filtered event stream with expandable event details |
| Sessions | Which session should I inspect? | Sortable session list with explicit selection and pin actions |
| Files | What source or diff is attached to this session? | Session-scoped file tree and file content/diff |
| Usage | How much activity and cost are present? | Usage summary and readable chart data |
| Settings | Which local dashboard behaviors are enabled? | Grouped persisted preferences and reset actions |

The implementation must preserve the current CrewLoop quiet-console identity and the existing hash navigation, filters, settings, and protocol contracts. This document is the design handoff for `spec-031-dashboard-responsive-ui-refinement` and is intentionally limited to UI structure, interaction, accessibility, and visual tokens.

## Aesthetic direction

**Quiet operational console.** The visual language is restrained, dense, and tool-like: dark or light neutral canvas, thin borders, indigo as the single brand accent, monospaced operational data, and clear semantic status colors. Hierarchy comes from spacing, type weight, border strength, and alignment rather than large cards, gradients, blur, or decorative animation.

The current typography and semantic token names in `servers/dashboard/ui/src/styles/index.css` remain the source of truth. The refinement tightens their usage instead of replacing the visual identity. Surfaces should read as adjacent work areas, not floating SaaS cards. Rounded corners remain small on panels and controls; pill treatment is reserved for compact status/filter chips.

Design references: `skills/crewloop-design/references/surfaces/dashboard.md`, `skills/crewloop-design/references/registers/quiet-product.md`, `skills/crewloop-design/references/aesthetic-guidelines.md`, and `skills/crewloop-design/references/output-checklist.md`.

## Color and semantic status

Retain the existing light/dark semantic tokens (`--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-inset`, `--border-default`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--success`, `--error`, `--warning`, and `--running`). Do not introduce view-specific hex colors or additional accent families.

Status is always redundant:

| State | Color token | Required non-color cue |
| --- | --- | --- |
| Connected/healthy | `--success` | “Connected” text and/or success icon |
| Connecting/reconnecting | `--running` / `--warning` | Explicit “Connecting” or “Reconnecting” text and live announcement |
| Error | `--error` | Error icon, visible message, and `role="alert"` where asynchronous |
| Paused | `--warning` | Pause icon, “Updates paused” text, and live announcement |
| Selected/current | `--accent` | Background/border treatment plus `aria-current`, `aria-selected`, or `aria-pressed` |
| Copied | `--success` | Copy/check icon with an accessible name and a short live announcement |

Body and interactive text must meet WCAG AA in both themes. Muted text is restricted to metadata and must not carry the only meaning of an action or state. Focus uses the existing accent focus ring and remains visible on both surface themes. Borders are supportive, never the only indicator of focus or selection.

## Typography

- Preserve the current local/system fallback stack; do not add a font CDN, `@import`, or runtime font request.
- Use the existing display face only for product/view titles where it improves orientation. Use the existing mono face for timestamps, paths, event metadata, filters, and telemetry values.
- Base UI text: approximately 13px with a comfortable line height.
- Labels and control text: 12–13px, medium weight, sentence case.
- Micro metadata: 10–11px, only where it remains readable at the selected density.
- Each view has one visible `h1`; subareas use `h2`/`h3` in reading order. Do not use typography alone to communicate a status.

## Spacing, density, and elevation

Use the current spacing scale and preserve compact desktop density. On touch layouts, controls and row-level primary actions have a minimum 44px hit area, even if their visual glyph is smaller. Extra whitespace is added around the hit area, not by making the data table unnecessarily tall on desktop.

| Element | Desktop | Narrow layout |
| --- | --- | --- |
| Top bar | 48px high | 48px high, compressed horizontal padding |
| Sidebar | about 224px wide | 56px icon rail at tablet; modal drawer on mobile |
| Main content gutter | 24px outer / 16px section | 16px outer / 12px section |
| Panel padding | 16px | 12–16px |
| Control hit area | 36px where pointer-only desktop density is safe | minimum 44px |
| Panel radius | small, consistent radius | same radius; no full-screen floating-card treatment |

Use one subtle elevation step for an open menu/dialog over the base surface. Scrims are opaque enough to establish modality, but the underlying UI is not blurred. Avoid glassmorphism and avoid shadow as the sole separation cue.

## Shell and responsive compositions

### Desktop: 1024px and wider

```text
┌──────────────────────────────────────────────────────────────┐
│ menu / brand      session selector  connection  search  theme │ 48
├───────────────┬──────────────────────────────────────────────┤
│ primary nav   │ h1 View title                    view summary │
│               │ filter/action row                             │
│               │ main operational surface                      │
│               │                                                │
└───────────────┴──────────────────────────────────────────────┘
```

The sidebar is persistent. The main content owns the visible heading, summary, filters, and result state. Keep the active-session surface visually dominant on Overview; do not let secondary telemetry or recent sessions become equal-weight card grids.

### Tablet: 768–1023px

The sidebar becomes a compact icon rail with an accessible tooltip/label on each item. The top bar keeps the session selector and connection state but allows search/theme controls to shrink. Main content remains a single column; dense panels may use two columns only when their minimum readable width is preserved.

### Mobile: below 768px

```text
┌──────────────────────────────┐
│ menu  CrewLoop   session  ⋯  │ 48
├──────────────────────────────┤
│ h1 View title                │
│ summary / connection state   │
│ primary action + filters    │
│                              │
│ primary content              │
│ secondary content            │
└──────────────────────────────┘
```

The closed navigation drawer is not rendered as a reachable off-screen subtree. When open, it is a modal dialog with a scrim, an accessible name, initial focus, Escape/backdrop dismissal, Tab containment, and focus restoration to the menu trigger. The filter sheet follows the same lifecycle. A bottom sheet may use the full viewport width with safe insets; its action row remains reachable without scrolling past the final option.

All view content remains one readable column at narrow widths:

- **Overview:** active skill and connection/paused states first; recent sessions/activity below.
- **Timeline:** compact timestamp/status rail, then event content; event actions sit outside the primary row action. Expanded details become a full-width block.
- **Sessions:** the session selection action and pin action are sibling controls, never nested. Secondary source/time metadata wraps or moves below the title.
- **Files:** tree rows become full-width touch rows; file content follows the selected path and exposes loading/error/empty states without horizontal clipping.
- **Usage:** summary values stack before the chart; chart data has a readable tabular/text alternative.
- **Settings:** sections stack, controls use full-width or clearly sized rows, and helper text follows its control.

## Interaction and component contracts

### Top bar, navigation, and session selector

- The menu trigger is a real button with an accessible name and `aria-expanded`/`aria-controls` when applicable.
- The session selector is a combobox/listbox pattern: trigger exposes expanded state and controls the listbox; options have stable IDs, selected state, keyboard navigation, and a clear empty/loading state.
- Connection state is announced through text and a polite live region. The dot is supporting decoration only.
- Global shortcuts yield to the topmost open overlay. Escape closes the topmost overlay first and must not also navigate or toggle unrelated controls.

### Dialogs, popovers, and sheets

Every transient surface follows one lifecycle:

1. Opening captures the invoking element and moves focus to the first meaningful control (or the dialog heading when no control exists).
2. While open, Tab and Shift+Tab cycle within the surface; no hidden/off-screen control participates.
3. Escape and the scrim dismiss only the topmost surface. Clicking inside does not dismiss it.
4. Closing restores focus to the invoking element when it still exists; otherwise focus moves to the nearest stable shell control.

Use `role="dialog"`, `aria-modal="true"`, and a visible or referenced accessible name for modal sheets and dialogs. Non-modal desktop popovers still have a role/name and return focus to their trigger. Do not use a blurred backdrop as a substitute for modality.

### Timeline and Sessions rows

Rows are structural containers. The primary selection/expansion action is a sibling button covering the content region; Copy and Pin are separate sibling buttons. This preserves a single, predictable tab stop per action and eliminates nested interactive semantics. Selected/expanded state is expressed with ARIA and a non-color visual treatment.

### Live regions and async states

Provide a small, stable `aria-live="polite"` status region for connection, pause/resume, copy success, and session removal. Use `role="status"` for non-error progress and `role="alert"` for actionable asynchronous failures. Keep announcements concise and do not replace visible state text with screen-reader-only text.

Each view has explicit loading, empty, error, and offline/paused states. Loading uses a restrained opacity/transform treatment or static text under reduced motion; error states offer the existing retry/action where available.

## State matrix

| Component | Default | Focus/selected | Disabled | Loading | Empty/error |
| --- | --- | --- | --- | --- | --- |
| Nav item | neutral text | accent rail + `aria-current` | reduced contrast, no pointer | n/a | n/a |
| Session option | plain option row | accent background + `aria-selected` | unavailable label | “Loading sessions” status | explicit “No sessions” |
| Filter control | label + count | visible ring and expanded state | disabled explanation | n/a | “No matching results” |
| Timeline row | timestamp/status/content | `aria-expanded` and accent edge | n/a | “Loading events” | “No events match…” |
| File row | path/name | selected background + `aria-selected` | unavailable path | “Loading file” | empty/error with retry |
| Settings control | label/helper/control | visible ring, `aria-pressed` where relevant | disabled explanation | saving status if applicable | validation error beside field |
| Connection/pause banner | visible text + icon | n/a | n/a | connecting/reconnecting | error text/action |

## Motion

Limit motion to three purposeful families:

1. Modal/sheet entry and exit: opacity plus a short translate on the relevant axis.
2. Selection/focus feedback: color, border, and opacity transitions only.
3. Live data arrival: no layout-shifting animation; at most a short opacity transition on the changed region.

Do not animate width/height/top/left, use bounce/easing overshoot, or apply decorative motion. Remove backdrop blur from transient surfaces. The existing manual reduced-motion root state and `prefers-reduced-motion` media query must both make transitions instant and disable non-essential animation.

References: `skills/crewloop-design/references/motion-playbook.md`, `skills/crewloop-design/references/registers/quiet-product.md`, and `skills/crewloop-design/references/output-checklist.md`.

## Engineering handoff checklist

- [ ] Add/reuse one focus-trap lifecycle primitive for the mobile nav, filter sheet, desktop filter popovers, and command palette.
- [ ] Ensure closed mobile navigation has no mounted reachable controls; apply modal semantics only while open.
- [ ] Normalize session selector combobox/listbox keyboard and selection semantics.
- [ ] Refactor Timeline and Sessions rows so content actions are sibling controls.
- [ ] Add stable live-region announcements and explicit async states across shell and views.
- [ ] Apply narrow-layout stacking, 44px touch targets, and readable overflow handling to all six views.
- [ ] Retain both theme token sets, strengthen any metadata token that fails AA for its actual usage, and verify status cues without color alone.
- [ ] Remove blur/bounce motion and verify manual/OS reduced-motion behavior.
- [ ] Verify there are no external font requests and add component tests for keyboard, focus, semantics, states, and responsive class contracts.

## Acceptance mapping

| Spec 031 criterion | Design contract |
| --- | --- |
| AC-01 | Conditional closed drawer + modal open lifecycle |
| AC-02 | Shared focus initialization, trap, Escape/backdrop dismissal, restoration |
| AC-03 | Structural row containers with sibling primary/copy/pin controls |
| AC-04 | Desktop/tablet/mobile shell and six-view compositions |
| AC-05 | Redundant status cues and stable live-region contract |
| AC-06 | Semantic theme tokens, AA audit, contextual 44px touch sizing |
| AC-07 | Transform/opacity-only motion and dual reduced-motion controls |
| AC-08 | Existing fallback fonts only; no network font source |

