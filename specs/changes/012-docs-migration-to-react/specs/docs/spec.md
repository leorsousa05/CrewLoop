# Specification: Documentation Migration

## Delta vs Current System

### Removed Components / Settings
- Docusaurus core dependencies (`@docusaurus/core`, `@docusaurus/preset-classic`, `@docusaurus/theme-mermaid`, etc.).
- Docusaurus config files (`docusaurus.config.js`, `sidebars.js`).
- Default Docusaurus page layouts under `docs/src/pages/index.js`.

### Added Components / Settings
- New Vite config (`vite.config.ts`), Tailwind configuration (`tailwind.config.js`, `postcss.config.js`), and TypeScript configuration (`tsconfig.json`).
- Dependencies for markdown processing: `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-highlight` (or similar markdown utility library).
- Icons and visuals: `@phosphor-icons/react` for modern icon styling.
- Core UI pages:
  - `src/components/LandingPage.tsx`: Interactive hero section, skill/flow visualizer with screenshots.
  - `src/components/DocsLayout.tsx`: Shell with sidebar navigation, search fallback, responsive burger menu for mobile.
  - `src/components/MarkdownRenderer.tsx`: Component using `react-markdown` to parse local files, render code blocks with syntax highlighting.
  - `src/components/SkillVisualizer.tsx`: Visual display demonstrating the Hub-and-Spoke CrewLoop flow with skill states and screenshot overlays.
- Sidebar schema definition to map all files under `docs/docs/` to categories (Getting Started, Core Concepts, Core Skills, Supporting Skills, Tools, Contributing).

### Project Layout Comparison

```
docs/ (Docusaurus)                  docs/ (React + Vite)
├── docusaurus.config.js            ├── vite.config.ts
├── sidebars.js                     ├── tailwind.config.js
├── package.json (Docusaurus deps)  ├── postcss.config.js
├── src/                            ├── package.json (Vite + React deps)
│   ├── css/                        ├── index.html
│   │   └── custom.css              ├── tsconfig.json
│   └── pages/                      ├── src/
│       └── index.js                    ├── main.tsx
└── docs/ (markdown contents)           ├── App.tsx
                                        ├── index.css
                                        ├── components/
                                        │   ├── LandingPage.tsx
                                        │   ├── DocsLayout.tsx
                                        │   ├── MarkdownRenderer.tsx
                                        │   └── SkillVisualizer.tsx
                                        └── docs/ (retains markdown files)
```
