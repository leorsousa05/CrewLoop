# Surface: Dashboard

Dashboards exist to be scanned in seconds and worked in for hours. Optimize for density, legibility, and honest states — never for first impressions.

## Anatomy

1. Top bar: product name, workspace/environment switcher, global search, user menu — 48-56px tall, sticky.
2. Sidebar (optional): primary navigation, 200-240px expanded, 48-56px icon-only collapsed.
3. Page header: title, primary action button, secondary actions — 1 row, no hero band.
4. KPI strip: 3-5 stat cards maximum, single row, each card 1 metric + label + delta.
5. Primary data zone: main chart or table that answers the page's core question.
6. Secondary widgets: supporting charts, lists, or feeds — 2 columns max, aligned to a shared grid.
7. Filter bar: sits directly above the data it controls, not at the top of the page by default.

## Density & spacing

- Base grid: 4px; widget padding 16-20px; widget gap 12-16px.
- Content width: fill the viewport up to ~1600px, then cap and center; dashboards are not documents.
- Table rows: 40-48px; stat cards: 80-120px tall; never pad widgets to force equal heights.
- Type: 13-14px body, 12px for table meta and axis labels, 20-28px for KPI numbers with tabular figures.

## Navigation

- Persistent sidebar for >5 sections; top tabs for 2-5 sibling views of the same object.
- Breadcrumbs only when hierarchy is 3+ levels deep; otherwise the page header states the location.
- Responsive: below 1024px collapse the sidebar to icons; below 768px move nav to a bottom bar or drawer and stack widgets single-column in declared priority order.

## Real states

- Loading: skeleton blocks matching each widget's real layout — never a full-page spinner over a shell that already renders.
- Empty: per-widget empty state (icon optional, 1 line of copy, 1 CTA to create or connect data) — never a blank chart area.
- Error: inline panel inside the affected widget with retry; toast only for background job failures.
- Stale data: timestamp or "last updated" label on every widget that can go stale.

## Motion posture

- Budget: 0-3 animations. Legitimate uses: filter/refresh crossfade on data (100-150ms opacity), popover enter (150-200ms), row highlight after inline edit.
- Animate `transform`/`opacity` only, `ease-out`, never spring overshoot, never load cascades or staggered widget reveals.
- Chart transitions between filter states are allowed (200-300ms) only if the update is user-initiated; live-ticking charts render instantly.

## Interaction specifics

- Filters apply on change for <5 options, on explicit "Apply" for heavy queries; always show active filters as removable chips.
- Tables: column sorting, row hover for actions, sticky header past 1 viewport of scroll; pagination or virtual scroll past 50 rows.
- Every chart needs a tooltip, a legend, and non-color series indicators (dash arrays, markers) for accessibility.

## Default register & pairings

- Default register: Quiet / Product Default — no justification needed.
- Works: Industrial / Utilitarian for ops and devtool consoles that want a harder edge.
- Clashes: Playful, Luxury, Brutalist, and any register requiring display type, texture, or rich motion.

## Common pitfalls

- Decorative hero band or welcome message consuming the first viewport ("Welcome back, Jane 👋") instead of data.
- Eight identical stat cards with gradient icons and no hierarchy — the classic AI-generated dashboard.
- Spring/bounce widget entrances or count-up number animations that delay the actual number.
- Glassmorphic cards, glows, and mesh-gradient backgrounds behind data that needs contrast.
- Fake states: skeletons that never match the loaded layout, charts with hardcoded demo data and no empty/error path.
