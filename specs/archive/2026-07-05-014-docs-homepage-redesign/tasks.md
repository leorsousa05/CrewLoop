# Checklist: Docs Homepage Redesign

## Phase 1: Styling Foundations & Setup

- [x] Extend Tailwind Configuration (`docs/tailwind.config.js`):
  - Add custom colors for active node glow highlights (`--glow-cyan`, `--glow-teal`, etc.).
  - Add custom keyframes for `glowDrift` and spring duration controls.
- [x] Add Glassmorphic Utility Classes (`docs/src/index.css`):
  - Implement `.glass-card-3d` with proper webkit-backdrop blurs, border highlights, and shadows.
  - Implement the spring transitions helper (`.hover-spring-physics`).
  - Set up background glow drifts on background blobs.

## Phase 2: Component Enhancements

- [x] Create Terminal Simulator Component (`docs/src/components/TerminalSimulator.tsx`):
  - Build state management loops representing command entries and output streams.
  - Write typewriter hook helper for input text loops.
  - Connect layout with mockup window controls (header buttons, shell indicators).
- [x] Redesign Handoff Visualizer Component (`docs/src/components/SkillVisualizer.tsx`):
  - Swap straight SVG `<line>` mappings for curved path vectors.
  - Add dashed dash-offset animations for visual connection lines.
  - Refactor node buttons with custom color token schemes and spring hovers.
- [x] Refactor Landing Page Layout (`docs/src/components/LandingPage.tsx`):
  - Replace the single column hero stack with a split grid (left description and CTA, right terminal simulator).
  - Update CLI installation input field into a typing installation simulator component.
  - Replace the sidebar selector with a modular card catalog grid, using custom color groupings for core and supporting skills.
  - Implement mock testimonials metrics section showing loops stats and quotations.
  - Refactor the comparison panels to use the updated Jade/Emerald jade glass vs. Crimson glow patterns.

## Phase 3: Verification & Polish

- [x] Write Unit Tests for simulation steps (`docs/src/components/tests/TerminalSimulator.test.tsx`):
  - Verify state transitions between commands.
- [x] Manual responsive sanity checks:
  - Check layout grids on mobile displays (<640px) to ensure terminal stays readable or collapses gracefully.
- [x] Verify WCAG accessibility contrast scores on all new buttons and comparative cards.
