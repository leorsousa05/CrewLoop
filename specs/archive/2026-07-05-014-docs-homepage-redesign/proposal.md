# Proposal: Docs Homepage Redesign

## Motivation
The current CrewLoop documentation landing page presents a functional but structurally standard interface. To match the project's positioning as an elite, advanced developer tool for orchestrating agentic development teams, the docs homepage needs an ultra-premium, modern, and highly interactive user experience. Implementing a "Glassmorphic 3D" visual identity with high-fidelity micro-interactions and structured animation patterns will demonstrate the professional caliber of the repository and significantly increase conversion/adoption of the CrewLoop CLI.

## Scope

### Included Features
1. **Ultra-Premium Glassmorphic 3D Styling**:
   - Dense blur backdrops (`backdrop-blur-xl`, `backdrop-blur-2xl`).
   - Radial, drifting glow gradients representing dynamic fields.
   - Floating components with multi-layered offset shadows to simulate physical depth.
2. **Interactive Terminal Simulator / Prompt Demo**:
   - A mockup interactive terminal in the Hero section demonstrating a typical orchestrator-led workflow.
   - Typewriter typing simulation for commands (`crewloop run "refactor auth"`).
   - Animated workflow execution states appearing line-by-line within the terminal window.
3. **Redesigned Handoff Diagram (`SkillVisualizer.tsx`)**:
   - SVG visual lines with flowing dashes/circles tracing the hub-and-spoke handoff dynamics.
   - Distinct, glowing interactive nodes with interactive focus states.
   - Spring-based hover scales on individual nodes.
4. **Skills Catalog Grid/Cards Layout**:
   - Replacing the sidebar list with a grid of modular card components.
   - Visual segregation of Core Flow skills vs Specialist Advisors.
   - Smooth active/focus transformations.
5. **Striking Comparative Section**:
   - Elevated comparative matrix of Standard AI Agents vs CrewLoop Enforced Flow.
   - Use of high-fidelity glass panels with deep red/emerald accents, custom check/cross alerts.
6. **Metrics & Performance Testimonials**:
   - Showcase statistics on error rates reduction, workflow predictability, and autonomous task completions.
   - Premium cards showing quotes from autonomous engineering loops.
7. **Animation Directives**:
   - Background glow drift (continuous slow pan).
   - CLI installer typewriter loop.
   - Spring physical feedback on hovers.
   - Smooth scroll reveals.

### Excluded (Out of Scope)
- Alterations to CLI package codebase (`packages/cli/`).
- Modifications to WebSocket dashboard server endpoints (`servers/dashboard/`).
- Deploying a live execution environment in the docs browser sandbox (the terminal simulator is entirely client-side mock logic).

## Constraints
- **UI Libraries**: Do not add heavy visual libraries like Framer Motion or Three.js unless strictly necessary. Rely on Tailwind CSS standard transitions, custom keyframes in `tailwind.config.js` or `index.css`, or lightweight React spring animations if compatible.
- **Iconography**: Leverage the already installed `@phosphor-icons/react` package.
- **Performance**: High blur filters and heavy shadow calculations must be optimized to prevent layout lag on low-end screens.
- **Responsiveness**: Complete mobile/tablet responsiveness is mandatory.
