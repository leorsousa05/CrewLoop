# Register: Industrial / Utilitarian

## When to use

- DevOps consoles, CI/CD pipeline views, infrastructure dashboards, log viewers, and ops tooling where the user scans dense data under time pressure.
- Internal developer tools, CLIs rendered as web UIs, monitoring/alerting surfaces, and admin panels that want a harder edge than Quiet / Product Default.
- Interfaces where the primary content is tabular data, timestamps, IDs, status flags, and numeric readouts.

## When NOT to use

- Marketing, landing, or brand pages — the register communicates "tool", not "story"; use Bento/Modular, Linear-like, or Editorial there.
- Consumer products, onboarding flows, or anything targeting non-technical users.
- Surfaces that need warmth, trust-building, or emotional appeal — if Quiet feels too cold for the audience, fix Quiet's palette, don't reach for Industrial.
- Content-light pages; Industrial density with little data reads as empty machinery.

## Palette philosophy

- Near-neutral dark or light backgrounds with a cool, desaturated cast: light mode `H 210-230, S 8-15%, L 96-98%`; dark mode `H 220-240, S 10-18%, L 8-12%`.
- Borders and gridlines are structural, not decorative: one step darker/lighter than the background, `L` delta of 6-10%, always visible.
- One functional accent only (focus, links, primary action): a safety-adjacent hue — cyan-blue `H 190-210, S 70-85%, L 45-55%` or amber `H 35-45, S 85-95%, L 50-60%`. Never both.
- Status colors follow semantic discipline: green = success/running (`H 140-160`), amber = warning/degraded (`H 35-45`), red = error/down (`H 0-10`), blue-grey = info/idle (`H 210-230`, low saturation). Status hues are the ONLY saturated colors besides the accent. Never use red or green decoratively.
- Contrast posture: functional and unforgiving — body text ≥4.5:1, status text on tinted backgrounds ≥4.5:1, table values ≥7:1 where operators read numbers at a glance.

## Typography

- Condensed or semi-condensed grotesque for UI chrome and headings (e.g. a condensed neo-grotesk, or the system stack with `font-stretch: condensed` where supported). One family only.
- Monospace for all data: timestamps, IDs, hashes, IPs, metrics, log lines, status codes — tabular figures (`font-variant-numeric: tabular-nums`) are mandatory.
- Sizing posture is compact: body 13-14px, table cells 12-13px, labels 11-12px uppercase with letter-spacing 0.04-0.08em, H1 18-22px, H2 15-17px. Line-heights tight: 1.2-1.35 for chrome, 1.4-1.5 for logs/code.
- Weight range is narrow: 400 for data, 500-600 for labels and headings. No weights above 700, no italics except in log/code context.

## Textures & effects

- Allowed: 1px hairline borders, subtle striped row tinting (2-3% luminance delta) in tables, small flat status dots/badges, inset keylines on panels.
- Allowed sparingly: a faint diagonal-hatch or blueprint-grid background on large empty areas, at ≤4% opacity, static only.
- Forbidden: gradients of any kind on UI surfaces, glows, drop shadows beyond one 1-2px elevation shadow, glassmorphism, blur, noise/grain overlays, rounded corners above 4px.
- Radius scale is hard: 0-2px on data cells and badges, max 4px on cards and modals. Sharp is the default.

## Motion flavor

- Posture: stricter than the skill's baseline diet. Budget 0-2 animations; the third slot of the global budget is almost never earned here.
- What earns its place: live data updates (a 100-150ms `ease-out` opacity crossfade on changed cells), enter/exit of overlays (150-200ms, opacity + ≤4px translate).
- Easings: `ease-out` or linear for data refresh. Spring/bounce overshoot is doubly forbidden — this register treats bounce as a defect.
- Off-limits: reveal cascades, staggered table-row entrances, animated number count-ups (flash the value, don't tween it), cursor effects, animated gradients on gauges or progress bars. Progress bars update instantly or in discrete steps.

## Layout idioms

1. Full-bleed dense table: sticky header row, 28-32px row height, column dividers at 1px, monospace values right-aligned for numerics.
2. Split console: fixed sidebar (200-240px) with resource tree + main pane with tabbed data views; no decorative hero area anywhere.
3. Status strip: a persistent 28-36px bar (top or bottom) carrying global state — environment, region, health dot, build SHA in monospace.
4. Key-value inspector panel: label column in muted uppercase 11px, value column in monospace, 24-28px row rhythm.
5. Inline filter/toolbar row above tables: 36-40px tall, text filters left, status-color legend right.
6. Log stream view: monospace 12-13px, zebra tinting, timestamp column fixed-width in a muted tone.

## Do / Don't

Do:
- Use semantic status colors exclusively for state, and pair every color signal with a text label or icon (never color alone).
- Right-align numeric columns and pin decimals with `tabular-nums` so values compare vertically.
- Keep row heights uniform and tight (28-32px); density is the point of the register.
- Reserve the single accent hue for interactivity; let status colors carry all other meaning.
- Ship both light and dark themes — ops users work in dark rooms, but defaults to whatever the product already uses.

Don't:
- Don't apply this register to marketing or consumer surfaces "to look technical" — it reads as cosplay there.
- Don't use status hues (red/green/amber) in charts, decorations, or branding elements.
- Don't tween or count-up numeric values; operators need the current number, not a performance.
- Don't introduce rounded, friendly components (pill buttons, soft cards) — radius above 4px breaks the register.
- Don't add a hero section, illustration, or marketing copy block to an ops tool; lead with the data.
