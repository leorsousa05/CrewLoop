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
- **COLOR RED LIST:** Purple-to-blue gradients on white backgrounds (the #1 AI slop signature), generic "tech" neon palettes without context, rainbow palettes without discipline. If the background is white or off-white, do NOT default to a purple gradient — choose a direction-specific palette instead.

### 3. Spatial Composition
Layout is the architecture of the interface. Surprise the eye.
- **Unexpected layouts:** Asymmetry, overlap, diagonal flow, grid-breaking elements.
- **Density control:** Either generous negative space (luxury/minimal) OR controlled, intentional density (maximal/editorial). Never accidental clutter.
- **Z-depth:** Layer elements purposefully with shadows, blur, or overlap to create depth.
- **Breakpoints:** Design mobile-first, then scale up. But don't let mobile flatten the personality — adapt the direction, don't dilute it.

### 4. Motion Design
Motion brings the interface to life. Choreograph it.
- **High-impact moments:** One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.
- **Timing:** 150-300ms for micro-interactions; complex transitions ≤400ms. Exit animations shorter than enter (~60-70%).
- **Easing:** Use ease-out for entering, ease-in for exiting. Prefer spring/physics-based curves for natural feel.
- **Transform-only:** Animate `transform` and `opacity` only. Never animate `width/height/top/left`.
- **Meaningful motion:** Every animation must express cause-effect relationship, not just decorate.
- **Respect reduced motion:** Provide static alternatives for users who prefer reduced motion.

### 5. Backgrounds & Visual Details
Atmosphere separates good from unforgettable.
- **Textures:** Gradient meshes, noise overlays (subtle 2-5%), grain, geometric patterns.
- **Lighting:** Dramatic shadows, ambient glow, rim light effects.
- **Borders:** Decorative borders, custom dividers, corner treatments that match the aesthetic.
- **Custom cursors:** When it enhances the experience (creative sites, portfolios).
- **Glassmorphism/blur:** Use with purpose — to indicate depth or dismissible layers, not as default decoration.

---

## TECHNICAL GUARDRAILS

Creative freedom ends where user experience breaks. These rules are **non-negotiable**:

### Accessibility (Minimum Viable)
- **Contrast:** Body text ≥4.5:1 against backgrounds. Large text ≥3:1.
- **Focus states:** All interactive elements must have visible focus indicators.
- **Icon-only buttons:** Must have `aria-label` or tooltip.
- **Color meaning:** Never convey information by color alone. Add icon or text.
- **Reduced motion:** Respect `prefers-reduced-motion`. Provide static alternatives.

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
