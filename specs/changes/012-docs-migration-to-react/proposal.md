# Proposal: Docusaurus Docs Migration to React + Tailwind

## Motivation
The current documentation site uses Docusaurus. While Docusaurus provides a solid framework out of the box, it is visually basic and lacks the advanced aesthetic appeal needed to truly showcase the **CrewLoop** agentic workspace. We want a modern, highly interactive, custom-designed frontend built with **Vite, React, and Tailwind CSS**. This migration will allow:
- A custom, premium dark-mode landing page featuring glassmorphic designs, vibrant gradients, and smooth scroll animations.
- Custom interactive representations of our 18 skills and dashboard state, leveraging the screenshots currently in the `assets/` folder.
- Clean and responsive sidebar navigation that matches the dashboard UI aesthetic.
- A dynamic client-side markdown loader and renderer, maintaining the existing markdown files as the source of truth for the documentation.

## Scope
1. **Remove Docusaurus dependencies** in the `docs/` workspace and install the standard Vite React setup with Tailwind CSS, TypeScript, and Markdown parsing dependencies.
2. **Develop the Landing Page**: Create an immersive, brand-focused intro page about CrewLoop, illustrating the active skills flow and dashboard concepts.
3. **Develop the Documentation Page**: Construct a documentation reader layout consisting of:
   - Sidebar category-based navigation (parsed dynamically or configured statically via a sidebar layout object).
   - A markdown rendering panel with syntax highlighting, clean styling, and responsive layout.
4. **Develop Interactive Components**: Implement components to showcase screenshots of active skills (`assets/screenshots/skill-active.png`) and the dashboard overview (`assets/screenshots/dashboard-overview.png`) within the flow.

## Constraints
- **Preserve Markdown Source of Truth**: All documentation files inside `docs/docs/` and skills must remain in standard markdown format.
- **Aesthetic Excellence**: Must follow modern web design principles (Tailwind, curated color palettes, elegant typography, dark mode by default, glassmorphic cards, micro-animations).
- **Responsive Layout**: Seamlessly adapt from desktop screens to mobile screens.
- **TypeScript & Clean Architecture**: Solid typing for all sidebar navigation, frontmatter meta-data, and components.
- **Asset Integrity**: Keep referencing existing images in `assets/screenshots/` and `assets/images/`.
