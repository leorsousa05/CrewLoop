# UI/UX Visual Specification: Dashboard Responsive Refinement

## Case Study Frame

- **Problem:** The dashboard displays operational truth, but inconsistent hierarchy, inaccessible overlays, nested controls, and weak mobile composition make that truth harder to trust.
- **Audience:** Developers monitoring live agent activity while debugging, reviewing changes, or switching rapidly between sessions and files.
- **Insight:** An observability interface earns confidence by making state transitions and control boundaries feel deterministic before it adds visual personality.
- **Solution:** Refine CrewLoop into a precise industrial instrument with restrained surfaces, explicit status signals, and responsive progressive disclosure.

## Aesthetic Direction

The dominant thesis is **Industrial / Utilitarian**. Cool graphite surfaces, visible frames, compressed headings, monospaced operational data, and one indigo action family make the interface feel engineered rather than decorated. The refinement preserves the current identity while replacing equal-weight SaaS cards with a dense utility stack and one dominant operational surface per view.

Reference traceability:

- `reference-library.md` selects Industrial / Utilitarian for developer tools and dense operational surfaces.
- `layout-patterns.md` supplies the dense utility stack and hierarchy-preserving mobile rule.
- `typography-playbook.md` supports a semi-condensed display layer plus monospace operational metadata.
- `color-playbook.md` keeps one dominant neutral family and one action accent family.
- `motion-playbook.md` restricts movement to state explanation through transform and opacity.
- `anti-patterns.md` rules out generic equal cards, glass layers, neon decoration, and interchangeable SaaS composition.

## Color System

| Token | Light mode | Dark mode | Usage |
|-------|------------|-----------|-------|
| `--bg-base` | `hsl(216 30% 97%)` | `hsl(224 30% 7%)` | Application atmosphere |
| `--bg-surface` | `hsl(216 25% 100%)` | `hsl(222 28% 10%)` | Primary panels |
| `--bg-elevated` | `hsl(216 24% 94%)` | `hsl(222 26% 14%)` | Menus and dialogs |
| `--bg-inset` | `hsl(216 22% 92%)` | `hsl(224 30% 5%)` | Code, payload, recessed regions |
| `--text-primary` | `hsl(222 40% 12%)` | `hsl(210 35% 96%)` | Headings and primary content |
| `--text-secondary` | `hsl(217 15% 38%)` | `hsl(215 16% 72%)` | Supporting content |
| `--text-muted` | `hsl(217 12% 48%)` | `hsl(215 14% 57%)` | Metadata and placeholders |
| `--accent` | `hsl(232 78% 55%)` | `hsl(230 88% 72%)` | Selection and primary action |
| `--accent-subtle` | `hsl(232 75% 94%)` | `hsl(230 45% 13%)` | Selected surface |
| `--success` | `hsl(153 62% 31%)` | `hsl(153 55% 50%)` | Successful completion |
| `--warning` | `hsl(38 88% 39%)` | `hsl(38 90% 58%)` | Pause and caution |
| `--error` | `hsl(7 70% 47%)` | `hsl(7 75% 62%)` | Failure and disconnected state |
| `--info` | `hsl(193 75% 35%)` | `hsl(193 82% 58%)` | Running activity |
| `--border-default` | `hsl(216 18% 84%)` | `hsl(222 20% 19%)` | Dividers and resting frames |
| `--border-strong` | `hsl(216 16% 68%)` | `hsl(222 18% 31%)` | Hover and selected frames |
| `--focus` | `hsl(232 90% 48%)` | `hsl(230 95% 76%)` | Focus rings |
| `--overlay` | `hsl(222 30% 10% / 0.38)` | `hsl(224 35% 3% / 0.72)` | Modal backdrop |

Rules:

- Status always includes text or icon shape; color is supplementary.
- Body and critical metadata meet WCAG AA; muted text is not used for required instructions.
- Indigo is reserved for interaction and selection, not decorative glow.
- Cyan, green, amber, and red appear only as semantic state signals.

## Typography

Space Grotesk and JetBrains Mono remain the selected families but must be bundled locally when licensing and package policy permit. Until local files are available, use the existing fallback stacks without external network requests.

| Level | Font | Size / line-height | Tracking | Weight | Usage |
|-------|------|--------------------|----------|--------|-------|
| Display | Space Grotesk | 28px / 1.15 | -0.02em | 600 | Empty-state and major view emphasis |
| View heading | Space Grotesk | 20px / 1.25 | -0.01em | 600 | Visible heading for each view |
| Section heading | Space Grotesk | 16px / 1.3 | 0 | 600 | Panel and region title |
| Body | JetBrains Mono | 13px / 1.5 | 0 | 400 | Primary operational content |
| Label | JetBrains Mono | 12px / 1.4 | 0.02em | 600 | Controls and badges |
| Caption | JetBrains Mono | 11px / 1.4 | 0.02em | Secondary metadata |
| Micro | JetBrains Mono | 10px / 1.4 | 0.04em | Decorative/non-critical counters only |

Critical timestamps, status names, actions, and paths must use at least Caption. Uppercase labels use no more than `0.1em` tracking.

## Spatial Tokens

| Family | Values | Rule |
|--------|--------|------|
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64px | 4px base; 12px added for dense control groups |
| Radius | 0, 4, 6, 8, 12px | No oversized rounded cards; 12px only for modal shells |
| Elevation | flat, 1px frame, 4px/16px popover, 12px/40px modal | Shadows only distinguish floating layers |
| Touch target | 44px minimum on pointer-coarse/mobile | Visual icon may remain 16–20px inside target |
| Focus | 2px ring + 2px offset | Never clipped by parent overflow |

## Layout Composition

### Desktop, 1280px and wider

```text
┌──────────────────────────────────────────────────────────────────────┐
│ VIEW / SESSION SELECTOR                  CONNECTION        COMMAND   │
├──────────────┬───────────────────────────────────────────────────────┤
│ Sidebar      │ View heading + one-line operational summary          │
│ 224px        ├───────────────────────────────────────────────────────┤
│              │ Dominant live/primary surface                        │
│ Six views    │                                                       │
│              ├──────────────────────────────┬────────────────────────┤
│ Shortcut     │ Dense utility stack          │ Detail / payload       │
│ hints        │ filters, rows, activity      │ code, diff, metadata   │
└──────────────┴──────────────────────────────┴────────────────────────┘
```

- Overview uses one full-width Now surface, then telemetry/activity in an asymmetric 2:1 relationship.
- Timeline dedicates flexible width to tool/detail and fixed minimum widths to time/status/actions.
- Files uses a bounded tree rail and a flexible viewer; neither pane becomes a floating card.

### Tablet, 768–1279px

- Sidebar narrows to icon plus concise label or becomes a controlled drawer when content width is insufficient.
- Secondary telemetry wraps into two rows while preserving source/status adjacency.
- Files keeps master-detail until the viewer would fall below a readable code measure.

### Mobile, below 768px

```text
┌────────────────────────────────────┐
│ MENU  VIEW              STATUS CMD │
├────────────────────────────────────┤
│ Active session / context summary   │
├────────────────────────────────────┤
│                                    │
│ One primary pane                   │
│                                    │
├────────────────────────────────────┤
│ Sticky contextual action region    │
└────────────────────────────────────┘
```

- Sidebar and filters are modal sheets, not translated permanent navigation.
- Files presents tree then detail with a visible Back action and preserved route context.
- Timeline collapses time and status into a compact first line; detail occupies the second line.
- Sort controls scroll as one labelled group only when they cannot wrap without ambiguity.

## Component Specifications

### Top Bar

- Height: 48px desktop, minimum 52px mobile.
- Connection uses icon shape plus `Connected`, `Reconnecting`, or `Offline`; mobile may visually hide text only when an accessible name remains.
- The menu, session selector, and command trigger have 44px mobile targets.
- Reconnection state is announced politely; terminal failure is assertive.

### Sidebar and Mobile Navigation

- Desktop: persistent framed rail; selected item uses accent text, subtle accent fill, and a 2px leading indicator.
- Mobile: `role="dialog"`, labelled heading, inert background, focus trap, Escape/backdrop close, and trigger focus restoration.
- Closed mobile navigation is unmounted or inert and hidden from accessibility APIs.

### Filter Bar and Sheet

- Desktop controls form one labelled toolbar with visible active-count badges.
- Mobile sheet opens with focus on its heading or search field, uses radio/checkbox semantics, and ends with Clear plus Apply/Done actions.
- Result count updates in a polite live region.

### Session Selector

- Trigger follows combobox semantics and owns `aria-expanded`/`aria-controls`.
- Focus remains on the correct composite owner; active option is announced and scrolled into view.
- Arrow keys move, Enter selects, Escape closes, and selection restores focus to the trigger.

### Interactive Rows

- Primary row activation is a real button or link occupying the content region.
- Pin/copy actions are sibling buttons outside that activation target.
- Hover changes surface and frame only; focus uses the global ring; selected adds a leading accent marker.
- Disabled actions remain visible with explanation when relevant.

### Overview

- Now surface dominates and exposes active skill, lifecycle, source, elapsed time, and confidence in one reading path.
- Telemetry is a hairline-separated utility strip, not five independent cards.
- Activity graph and recent operations share a 2:1 desktop composition and stack on mobile.

### Timeline

- Each invocation has an explicit expandable header button and separate copy action.
- Running/success/error use shape, label, and color.
- Pause banner sits directly under filters, uses warning treatment, states buffered count, and provides Resume.

### Files

- Tree uses folders/files with badges for read/edit/other and an obvious selected path.
- Viewer header repeats path, mode, operation count, and state before content.
- Code/diff surfaces use inset background and stable line-number gutter; horizontal scrolling never moves the path/actions header.

### Settings

- Each row contains a visible label, consequence description, and associated control.
- Switches have accessible names and state text where ambiguity exists.
- Reduced motion copy distinguishes manual preference from OS preference.
- Max-events control explains server retention as the upper bound.

## Real States

| State | Treatment | Action |
|-------|-----------|--------|
| Loading | Shape-matched skeleton; no indefinite spinner over existing data | None unless load exceeds expected duration |
| Empty | Framed quiet state with reason and one relevant next action | Clear filters, select session, or wait for event |
| Error | Error leading frame, concise safe message, retained context | Retry when operation is repeatable |
| Success | Semantic label/change in place; no routine toast | Copy success may use a brief polite announcement |
| Offline | Persistent top banner; cached data remains visible and marked stale | Automatic reconnect plus optional retry |
| Paused | Amber banner with coalesced count | Resume |
| Removed | Selection transitions to next eligible session or true empty state | No stale row remains |
| Binary/large file | Purpose-specific unavailable state | Return to tree; no fake empty content |

Skeleton motion is disabled under effective reduced motion. Error and offline states never erase previously valid context unless it is unsafe to retain.

## Motion Choreography

| Animation | Trigger | Property | Duration | Easing | Reduced-motion fallback |
|-----------|---------|----------|----------|--------|-------------------------|
| View transition | Route change | opacity | 120ms | ease-out | Instant |
| Modal sheet enter | Open | opacity, translateY | 180ms | `cubic-bezier(0.25,1,0.5,1)` | Opacity 60ms |
| Sidebar drawer | Open | opacity, translateX | 180ms | `cubic-bezier(0.25,1,0.5,1)` | Instant |
| File drill-in | Select mobile file | opacity, translateX | 180ms | ease-out | Instant |
| Status update | Event update | opacity | 100ms | ease-out | Instant |
| Row expansion | Activate | opacity, translateY | 120ms | ease-out | Instant |
| Button press | Pointer/keyboard activate | transform scale | 80ms | ease-out | Static state change |

There is no cursor-driven motion, parallax, bouncing, height animation, or decorative stagger.

## Data Visualization

- Activity bars use `--info` for running, `--success` for successful completion, and `--error` for failure.
- Grid/divider lines use `--border-default`; tooltip surfaces use `--bg-elevated` and `--border-strong`.
- Every series or status combines color with label, dash, marker, or shape.
- Screen-reader summary uses the oldest and newest visible timestamps, event count, and error count.
- Bars animate only on initial appearance when effective motion is enabled.

## Interaction Flow

1. User enters Overview and receives immediate active-session status.
2. Session selection updates the hash and all views without losing explicit filters unexpectedly.
3. Timeline supports pointer and `j`/`k`/Enter navigation without colliding with nested actions.
4. Files preserves session/path context through desktop master-detail and mobile drill-down.
5. Topmost overlay exclusively handles Escape; focus always returns to its trigger.
6. Settings changes preview immediately and persist after validation.

## Assets

- **Icons:** existing Phosphor set at 16, 20, and 24px; weight remains consistent within each control family.
- **Fonts:** locally served licensed WOFF2 subsets for Space Grotesk and JetBrains Mono when available; no Google Fonts request.
- **Images:** none required.
- **Effects:** no mesh gradient, glass blur, decorative grain, photography, or glow field.
- **Exports:** no new raster assets; any future custom icon uses `icon-{name}.svg` at a 24px viewBox.

## Presentation Mockups

1. **Desktop browser frame:** Timeline at 1440x900, active session selected, pause banner visible, one expanded failed invocation, utility rail clearly subordinate to the event content.
2. **Mobile device:** Files at 390x844, tree-to-detail drill-down, sticky Back/path header, filter sheet respecting bottom safe area.
3. **Before/after comparison:** current nested rows and equal card weight beside separated controls, dominant Now surface, explicit headings, and announced states.

## Accessibility and Acceptance Checklist

- [ ] Body contrast is at least 4.5:1; large text and graphical controls are at least 3:1.
- [ ] Every mobile target is at least 44px in each pointer dimension.
- [ ] Every interactive element has default, hover, active, disabled, selected, and focus-visible treatment as applicable.
- [ ] Sidebar, sheets, palette, and popovers have names, focus containment, Escape, and restoration.
- [ ] Closed overlays are unreachable by keyboard and assistive technology.
- [ ] Headings form a useful hierarchy in all six views.
- [ ] Status never depends on color alone.
- [ ] Loading, empty, error, success, offline, paused, removed, binary, and oversized states are covered.
- [ ] Manual and OS reduced-motion preferences produce the same global motion suppression.
- [ ] Desktop/mobile, light/dark/system, and compact/comfortable combinations are verified.
- [ ] Hash routing, command palette, shortcuts, filters, and Files drill-down retain their contracts.
- [ ] No external font request, structural emoji, generic glass card, or decorative animation remains.
