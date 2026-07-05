# Implementation Tasks: React Docs Migration

## Step 1: Environment & Setup
- [x] Backup existing `docs/docs/` markdown directory and Docusaurus files, then clear Docusaurus configs in `docs/` (`docusaurus.config.js`, `sidebars.js`, `.docusaurus/`).
- [x] Initialize a new Vite React TypeScript project under `docs/` (`npm init vite@latest . -- --template react-ts` or overwrite packages).
- [x] Install required devDependencies: `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `@types/react`, `@types/react-dom`.
- [x] Install runtime dependencies: `react-markdown`, `remark-gfm`, `@phosphor-icons/react`.
- [x] Setup `tailwind.config.js` and `postcss.config.js` with the dark-theme design tokens.
- [x] Configure `tsconfig.json` to allow static content bundling and appropriate module resolution.

## Step 2: Core Styling & Assets
- [x] Set up `docs/src/index.css` with Tailwind directives, custom glassmorphism styles, and scroll animation animations.
- [x] Ensure static asset paths are configured so that `/assets/screenshots/` and `/assets/images/` are accessible by Vite (or symlinked/copied to `public/`).

## Step 3: Router & Markdown Loading
- [x] Create `docs/src/types.ts` defining `DocItem` and `SidebarCategory` schemas.
- [x] Create `docs/src/sidebarConfig.ts` with the fully mapped structure of the original sidebars.js.
- [x] Write a static markdown loading/fetching mechanism to read `.md` files via URL hash routes.
- [x] Implement `docs/src/components/MarkdownRenderer.tsx` using `react-markdown` and syntax highlighting hooks.

## Step 4: Interactive Landing Page & Visuals
- [x] Implement `docs/src/components/SkillVisualizer.tsx` displaying the Hub-and-Spoke diagram of CrewLoop skills with clean animations.
- [x] Implement `docs/src/components/LandingPage.tsx` with a premium dark-gradient hero header, skill flow animations, and interactive screenshots that zoom on hover and expand to modal views.

## Step 5: Docs Shell & Integration
- [x] Implement `docs/src/components/DocsLayout.tsx` including a responsive sidebar menu, quick document filtering, and a clean reading area.
- [x] Integrate everything in `docs/src/App.tsx` utilizing hash-based routing.
- [x] Run verification tests and a final Vite production build (`npm run build`) to ensure the site compiles cleanly.

## Step 6: Homepage Redesign (Hydra Launcher Vibe & Expanded Copy)
- [x] Overhaul `LandingPage.tsx` layout to utilize a deep space background (`bg-[#030014]`), sharp violet-to-magenta typography gradients, and custom glowing blur elements.
- [x] Implement a copyable CLI terminal widget inside the Hero section (`npm i -g @archznn/crewloop-cli && crewloop install`) with copy states.
- [x] Add custom CSS rules for isometric 3D perspectives (`.isometric-left` and `.isometric-right`) to `index.css` and apply them to the walkthrough screenshots.
- [x] Implement the 3-step "How it works" timeline cards.
- [x] Create a detailed skills breakdown table or grid separating Core vs Supporting advisor roles.
- [x] Implement the "Why CrewLoop" comparison list (Before vs After) demonstrating the workflow gatekeeping benefits.
- [x] Test layout responsiveness and verify that the production build compiles cleanly (`npm run build` PASS).

## Step 7: Visual Skills Flow Overhaul (Hydra Style)
- [x] Deprecate and delete the `WorkflowSimulator.tsx` file and its imports/references in `LandingPage.tsx`.
- [x] Style the Landing Page Hero section to act as a sleek product page (with glowing gradients, copyable CLI card) and display the SVG `SkillVisualizer` flow diagram prominently.
- [x] Overhaul core and supporting skills sections to render the 18 active skills using premium, glassmorphic cards with glowing border animations on hover.
- [x] Test layout responsiveness and confirm build compiles cleanly (`npm run build` PASS) with zero linter warnings.

## Step 8: Layout Overhaul (Alternating Features & Interactive Sidebar Catalog)
- [x] Overhaul the 3D walkthrough screenshots section in `LandingPage.tsx` into 3 alternating, spacious feature columns (mockup on one side, description on the other).
- [x] Replace the core/supporting skills cards with an interactive `Sidebar Skills Catalog` that groups the 18 active skills and displays their descriptions, constraints (Never Does), and doc links upon click.
- [x] Style all panels to utilize pitch-black backgrounds, neutral-900 border frames, and cyan focus highlights.
- [x] Verify Vite build compilations pass without errors and oxlint has zero warnings.
