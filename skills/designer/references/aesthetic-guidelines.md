# UI/UX Aesthetic Pillars & Technical Guardrails

## DESIGN PILLARS

### 1. Typography
Typography is the voice of the interface. Make it distinctive.
- **Display/Headings:** Choose ONE distinctive font with character. Look for unexpected choices — a sharp serif (e.g., Canela, Tiempos, Freight), a compressed grotesque (e.g., Neue Montreal, Söhne), a geometric sans with personality (e.g., Sora, Clash Display), or a variable font with dramatic axes.
- **Body:** Pair with a refined, highly readable font. Can be a more neutral grotesque or a gentle serif, but should feel intentional.
- **Scale:** Establish a clear typographic hierarchy. Use size, weight, and spacing to create rhythm. Avoid more than 3 font families.
- **FONT RED LIST (NEVER use as display/primary):** Inter, Roboto, Arial, Space Grotesk, Poppins, Open Sans, Lato, Montserrat, system font stacks. These are overused to the point of being invisible. If you find yourself about to suggest one of these, stop and pick something else.
- **Never use:** System font stacks as the primary identity, generic sans-serif for everything.

### 2. Color & Theme
Color creates atmosphere. Commit to a cohesive palette.
- **Dominant + Accent:** One dominant color family (60-70%) + one sharp accent (10-20%) + neutrals. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **CSS Variables:** Define semantic tokens (`--color-primary`, `--color-surface`, `--color-text`, `--color-accent`) for consistency.
- **Dark Mode:** If applicable, design light and dark variants together. Dark mode uses desaturated/lighter tonal variants, not inverted colors.
- **Semantic Token Example:**

| Token | Typical usage |
|-------|---------------|
| `--bg-primary` | Page background |
| `--bg-surface` | Cards, panels |
| `--bg-elevated` | Modals, popovers |
| `--text-primary` | Headings, body |
| `--text-secondary` | Descriptions |
| `--text-muted` | Meta, disabled |
| `--accent` | Primary buttons, links |
| `--success` | Positive states |
| `--warning` | Caution states |
| `--error` | Error states |
| `--info` | Informational states |
| `--border` | Dividers, outlines |
| `--focus` | Focus rings |
| `--overlay` | Backdrops |

- **COLOR RED LIST:** Purple-to-blue gradients on white backgrounds (the #1 AI slop signature), generic "tech" neon palettes without context, rainbow palettes without discipline. If the background is white or off-white, do NOT default to a purple gradient — choose a direction-specific palette instead.

### 3. Spatial Composition
Layout is the architecture of the interface. Surprise the eye.
- **Unexpected layouts:** Asymmetry, overlap, diagonal flow, grid-breaking elements.
- **Density control:** Either generous negative space (luxury/minimal) OR controlled, intentional density (maximal/editorial). Never accidental clutter.
- **Z-depth:** Layer elements purposefully with shadows, blur, or overlap to create depth.
- **Breakpoints:** Design mobile-first, then scale up. But don't let mobile flatten the personality — adapt the direction, don't dilute it.
- **Spacing Scale:** Use a 4px base grid.

| Token | Value |
|-------|-------|
| `--space-xs` | 4px / 0.25rem |
| `--space-sm` | 8px / 0.5rem |
| `--space-md` | 16px / 1rem |
| `--space-lg` | 24px / 1.5rem |
| `--space-xl` | 32px / 2rem |
| `--space-2xl` | 48px / 3rem |
| `--space-3xl` | 64px / 4rem |
| `--space-4xl` | 96px / 6rem |

- **Border Radius Scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Data tables, strict grids |
| `--radius-sm` | 4px / 0.25rem | Tags, small inputs |
| `--radius-md` | 8px / 0.5rem | Buttons, small cards |
| `--radius-lg` | 12px / 0.75rem | Cards, panels |
| `--radius-xl` | 16px / 1rem | Modals, large cards |
| `--radius-2xl` | 24px / 1.5rem | Hero containers |
| `--radius-full` | 9999px | Pills, avatars |

### 4. Motion Design
Motion brings the interface to life. Choreograph it.
- **High-impact moments:** One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.
- **Timing:** 150-300ms for micro-interactions; complex transitions ≤400ms. Exit animations shorter than enter (~60-70%).
- **Easing:** Use ease-out for entering, ease-in for exiting. Prefer spring/physics-based curves for natural feel.
- **Transform-only:** Animate `transform` and `opacity` only. Never animate `width/height/top/left`.
- **Meaningful motion:** Every animation must express cause-effect relationship, not just decorate.
- **Respect reduced motion:** Provide static alternatives for users who prefer reduced motion.
- **Keyframe naming:** Use descriptive names like `--anim-fade-up`, `--anim-scale-in`, `--anim-slide-left`.
- **Scroll triggers:** Trigger reveals at ~20% viewport intersection. Avoid animating elements that are already visible on load.
- **Stagger formulas:** Use predictable formulas such as `delay = index * 50ms + base 100ms` to keep orchestration readable.
- **Cursor-driven effects:** Only use `transform` and `opacity` for cursor-following glow or parallax. Avoid layout reads/writes on mousemove.

### 5. Backgrounds & Visual Details
Atmosphere separates good from unforgettable.
- **Textures:** Gradient meshes, noise overlays (subtle 2-5%), grain, geometric patterns.
- **Lighting:** Dramatic shadows, ambient glow, rim light effects.
- **Borders:** Decorative borders, custom dividers, corner treatments that match the aesthetic.
- **Custom cursors:** When it enhances the experience (creative sites, portfolios).
- **Glassmorphism/blur:** Use with purpose — to indicate depth or dismissible layers, not as default decoration.

### 6. Elevation & Shadow System
Define shadow levels for consistent depth.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-0` | `none` | Flat surfaces |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.06)` | Resting cards |
| `--shadow-2` | `0 4px 12px rgba(0,0,0,0.08)` | Hover cards |
| `--shadow-3` | `0 8px 24px rgba(0,0,0,0.10)` | Dropdowns, popovers |
| `--shadow-4` | `0 16px 40px rgba(0,0,0,0.12)` | Modals |
| `--shadow-5` | `0 24px 64px rgba(0,0,0,0.16)` | Full-screen overlays |

### 7. Dashboard & Data Visualization Design
SaaS interfaces and dashboards must present information in a dense, structured, yet highly readable layout.
- **Bento Grid Composition:** Group UI blocks using asymmetric grids (e.g. 1x1, 2x1, 2x2 grids) with 16px/24px gutters. Use varied card sizes to highlight key metrics over secondary details.
- **KPI Metrics Cards:** Position labels at the top in a muted color, followed by a bold primary value, a subtle trend indicator/delta percentage (e.g. positive: green text with upward chevron; negative: red text with downward chevron), and a micro-sparkline mapping recent history.
- **Accessible Charting:** Design charts with clean SVGs or canvas frameworks. Provide clear `--grid-line-color` guides (with low-contrast gray tones) and distinct tooltips. 
- **High-Density Utilities:** Integrate widgets such as action/status bars, interactive filter tags, compact scrollable lists, command panels, and keyboard navigation indicators.

### 8. Dashboard Easing & Fluid Animations
Transitions on complex layouts should feel fluid and snappy, not sluggish.
- **Spring-Physics Curves:** Avoid standard linear transitions. Prefer decelerating spring easing:
  - Snappy: `cubic-bezier(0.25, 1, 0.5, 1)` (out-quint)
  - Elastic Spring-Back: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Staggered Entrance Delays:** Stagger component entrance on load to prevent visual overload. Animate cards upward with a 50ms stagger interval (e.g., card 1: 0ms, card 2: 50ms, card 3: 100ms) with a `translateY(12px)` slide-in.
- **Snappy Timing:** Entrance transitions: 250-350ms. Exit transitions: 150-200ms. Keep micro-interactions (like buttons or tabs toggling) between 120-180ms.

### 9. User Interaction & Navigation Architecture
Visual design must be supported by intuitive user flows and contextual navigation systems.
- **Navigation Layouts:**
  - **Sidebar:** Collapsible panel for complex SaaS consoles. Highlight active links with a high-contrast background element/color, distinct icons, and right-aligned shortcut indicators (e.g., `⌘1`, `⌘2`).
  - **Topbar:** Flat header for content-driven landing pages. Includes sticky tracking to keep critical menus reachable.
- **Contextual Overlays & Interactive Loops:**
  - **Modals:** Overlay using a desaturated backdrop (`rgba(10, 10, 15, 0.7)` with `backdrop-filter: blur(8px)`). Restrict page scrolling (`overflow: hidden` on body) when the modal is active.
  - **Context Menus (Right-Click):** Rendered absolute to cursor pointer coordinates. Features a compact 1px border and keyboard action labels.
  - **Command Palettes:** Centered lookup overlays (`width: 600px; top: 12%`) with instant arrow-key select support.
  - **Tooltips & Popovers:** Position adjacent to target triggers, dismissing instantly on ESC key or body click.

### 10. Conversion-Centered Landing Page Design
Landing pages must guide user attention toward conversion.
- **Above-The-Fold Hero CTA:** The primary value proposition and a prominent Call to Action (CTA) must be visible above-the-fold. Use a sticky top header with a smaller CTA button that appears once the main button scroll-out occurs.
- **Flow Hierarchy:** Sequence page blocks logically:
  1. *Hook:* High-contrast headline and primary conversion CTA.
  2. *Comparison:* Contrast current friction/problems with the proposed solution.
  3. *Bento Features Grid:* Visually rich block showcasing feature modules.
  4. *Social Proof:* Grid-based customer quotes and high-contrast logotypes.
  5. *Pricing Accordion/Cards:* Clear cards highlighting the "Recommended" tier with an accent color.
  6. *FAQ:* Keyboard-accessible toggles.
  7. *Final Hook:* Final CTA section to capture remaining interest.
- **Button Visual Hierarchy:**
  - **Primary CTA:** High-contrast solid color (Volt green, neon) with high-legibility bold text.
  - **Secondary CTA:** Subtle border-only or low-contrast text link to prevent visual noise.

### 11. Portfolio-Ready Output
A design spec should read like a portfolio case study, not an internal checklist.
- **Tell a product story:** Frame every design with a problem, audience, insight, and solution.
- **Design for real states:** Loading, empty, error, skeleton, success, and offline states must be specified, not implied.
- **Build a complete token system:** Color, spacing, radius, elevation, typography, and asset exports must be precise enough for engineering reproduction.
- **Describe contextual mockups:** Include browser-frame, device, and before/after descriptions so the work feels finished and shareable.
- **Motion with accessibility alternatives:** Every animation must have a reduced-motion fallback.

### 12. Asset & Export Conventions
Standardize asset production for engineering handoff.

| Asset type | Sizes/formats | Naming convention |
|------------|---------------|-------------------|
| Icons | 16/20/24/32/48px SVG | `icon-{name}.svg` |
| Logos | SVG + 2x PNG | `logo-{variant}.{svg/png}` |
| Images | WebP/AVIF + fallback JPEG | `{section}-{descriptor}.{webp/jpg}` |
| Favicon | 32/180/192/512px PNG | `favicon-{size}.png` |

---

## TECHNICAL GUARDRAILS

Creative freedom ends where user experience breaks. These rules are **non-negotiable**:

### Accessibility (Minimum Viable)
- **Contrast:** Body text ≥4.5:1 against backgrounds. Large text ≥3:1.
- **Focus states:** All interactive elements must have visible focus indicators.
- **Icon-only buttons:** Must have `aria-label` or tooltip.
- **Color meaning:** Never convey information by color alone. Add icon or text.
- **Reduced motion:** Respect `prefers-reduced-motion`. Provide static alternatives.
- **Data Viz Contrast:** Keep chart strokes, areas, and legends at ≥3:1 contrast against panel backgrounds.
- **Multi-Channel Charting:** Do not rely on color alone to differentiate data series. Apply distinct stroke dash arrays (dashed, dotted) or different shape markers (circles, triangles, squares) to data lines.
- **Modal Containment:** Implement keyboard focus traps inside active modals. The ESC key must dismiss active modals, tooltips, or command overlays. Disable page scrolling while overlays are open.

### Real-State Design
Real products spend most of their time outside the happy path. Design these explicitly:
- **Skeleton:** Must mirror the final layout structure to prevent layout shift.
- **Empty:** Must include a clear, on-brand CTA and concise copy.
- **Error:** Must use both color and icon/text; never rely on color alone.
- **Loading:** Show feedback within 300ms for operations that exceed that threshold.
- **Success:** Keep brief and non-blocking; avoid disruptive celebrations.
- **Offline:** Indicate cached state, disable destructive actions, and provide retry controls.

### Touch & Interaction
- **Touch targets:** Minimum 44×44px (iOS) / 48×48dp (Android). Expand hit area if visual is smaller.
- **Tap feedback:** Visual response within 100ms of tap.
- **Loading states:** Show feedback for operations >300ms.
- **Hover dependency:** Never make critical interactions hover-only.

### Performance
- **Animation performance:** Use only `transform` and `opacity`. No layout-triggering animations.
- **Image optimization:** Use WebP/AVIF, declare dimensions to prevent layout shift.
- **Font loading:** Use `font-display: swap` to avoid invisible text.
- **Main thread:** Keep per-frame work under ~16ms.

### Responsive & Layout
- **Mobile-first:** Design for 375px first, then scale up.
- **Breakpoints:** Use systematic breakpoints (375 / 768 / 1024 / 1440).
- **Safe areas:** Respect notch, Dynamic Island, gesture bar, status bar.
- **No horizontal scroll** on mobile.
- **Readable measure:** 35-60 chars per line on mobile; 60-75 on desktop.

### Forms (if applicable)
- **Visible labels:** Never placeholder-only labels.
- **Error placement:** Below the related field.
- **Input types:** Use semantic types (`email`, `tel`, `number`) for correct mobile keyboard.
