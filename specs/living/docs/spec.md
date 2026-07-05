# Specification Delta: Homepage Component Architecture

## Affected Directory Structure

Below is the ASCII directory structure of the targeted files and folders:

```
docs/
├── tailwind.config.js          # Extended for custom glows & animations
└── src/
    ├── index.css               # Addition of premium glass & drift utilities
    └── components/
        ├── LandingPage.tsx      # MODIFIED: Layout structure, sections, terminal demo
        └── SkillVisualizer.tsx  # MODIFIED: Redesigned interactive SVG connections & styles
```

---

## Component Deltas

### 1. LandingPage Component ([LandingPage.tsx](file:///home/arch/codes/crewloop/docs/src/components/LandingPage.tsx))

#### CURRENT BEHAVIOR
- Displays a simple top pill banner, gradient heading, and description.
- Utilizes a basic CLI copy installer component.
- Uses a two-column sidebar layout for the Skills Directory:
  - Left panel: a vertical button list of skills categorized under "Core Flow" and "Specialist Advisors".
  - Right panel: displays detail summaries, CTAs, and constraints.
- Shows standard grid rows for feature showcases.
- Features a basic comparative section with minor color adjustments for "Standard AI" (red) vs "CrewLoop" (emerald).
- Closes with a zoomable mockup image modal.

#### TARGET REDESIGN BEHAVIOR
- **Hero Grid Division**: Splitting the main hero into a 12-column grid:
  - **Left 7 Columns**: Heading, pill badge, descriptive text, and CTA buttons.
  - **Right 5 Columns**: Highly-styled interactive Terminal Simulator widget, featuring animated prompt sequences simulating `orchestrator` -> `architect` -> `engineer` -> `reviewer` -> `shipper` outputs.
- **CLI Installer Widget**: Redesigned CLI container featuring an automatic typewriter text display, interactive copy, and floating 3D borders.
- **Skills Directory Grid**:
  - Eliminates the vertical list sidebar.
  - Introduces a categorized multi-card grid. Core flow is styled with premium Cyan/Teal border glows. Specialist skills are styled with Emerald/Sky borders.
  - Each card is interactive and clickable, expanding or displaying its constraints in an overlay or modal drawer on click to prevent layout shifting.
- **Testimonials & Metrics Section**:
  - Adds a new full-width container showcasing 3 card elements.
  - Includes metrics such as:
    - `99.2%` Specs-to-Code Traceability
    - `-45%` Mean Time to PR Delivery
    - `0%` Unaudited Commits in Production
  - Real-world quotes from simulated loop runs (e.g., "Maintainer looped for 4 hours, auto-resolved 12 memory leaks under test suites").
- **Enhanced Comparative Section**:
  - Transforming the comparison columns into two highly distinct "Glass Panels".
  - Negative states (Standard AI) are surrounded by a deep Crimson glass aura with soft pulse shadows.
  - Positive states (CrewLoop) use a deep Jade/Emerald blur background, glowing checks, and active text weights.

---

### 2. SkillVisualizer Component ([SkillVisualizer.tsx](file:///home/arch/codes/crewloop/docs/src/components/SkillVisualizer.tsx))

#### CURRENT BEHAVIOR
- Rendered as a hub-and-spoke configuration with a center Orchestrator node and 5 outer nodes.
- SVG paths use basic `<line>` tags transitioning strokes from `#262626` to `#06b6d4`.
- A single `<circle>` traverses each active path using a simple `<animateMotion>` element.
- Right-hand details card updates on select, printing description and constraints.

#### TARGET REDESIGN BEHAVIOR
- **Dynamic Connection Architecture**:
  - SVG connections are updated from flat straight lines to curved bezier shapes (`<path d="..." />`) to emulate fluid network maps.
  - Glowing connections feature multiple dashed lines traveling at varying speeds using `stroke-dasharray` and custom dash-offset animations.
  - Connections pulse based on active handoff states.
- **Interactive Nodes**:
  - Each skill node is embedded in a multi-layered HTML/SVG wrapper.
  - Active nodes emit a multi-layered drop shadow glow (`box-shadow: 0 0 25px var(--accent-glow)`).
  - Background circular maps show concentric rings spinning slowly at different angles.
- **Layout Structure**:
  - Interactive grid: Diagram left (7 cols), Detail card right (5 cols), wrapped in a responsive desktop layout transitioning to stacked blocks on mobile.
