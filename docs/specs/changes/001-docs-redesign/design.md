# Design

## Subject and audience

The subject is CrewLoop: a coordinated workflow for AI skills that move through discovery, specification, design, implementation, review, and shipping.

The audience is a mix of implementers, contributors, and users trying to understand how the workflow works and how to install or navigate it quickly. The page's single job is to help a visitor orient themselves in the system and move into the docs with confidence.

## Visual direction

The redesign should feel like an operations manual printed on quality paper:

- Backgrounds: parchment, bone, and soft warm gray.
- Text: near-black ink with restrained slate secondary text.
- Accent: oxide/rust for primary emphasis, moss for supportive status, cobalt for links and selected states.
- Surfaces: cards and panels with minimal radius, crisp borders, and low-contrast shadows.
- Atmosphere: subtle grain or tonal variation is acceptable, but decorative effects must stay quiet.

### Palette

- `#F4EBDD` Parchment
- `#FCF8F1` Paper
- `#191713` Ink
- `#57504A` Graphite
- `#A4583E` Oxide
- `#64765B` Moss
- `#274E7A` Cobalt

### Typography

- Display: `Fraunces`
- Body: `IBM Plex Sans`
- Utility / code: `IBM Plex Mono`

The display face should be used with restraint for hero headings and section anchors only. Body text must remain highly readable across long-form docs, and mono should be reserved for commands, paths, metadata, and code.

## Layout

The site should behave like a two-part handbook:

1. The landing page introduces the system with a strong thesis, a workflow spine signature, and a compact installation/reference area.
2. The docs reader opens into a reading desk layout with a stable navigation column and a centered content column.

The landing page should not feel like a separate marketing site. It should feel like the front cover of the same manual that the docs reader continues.

### Proposed structure

```text
docs/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── sidebarConfig.ts
│   ├── components/
│   │   ├── LandingPage.tsx
│   │   ├── DocsLayout.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── SkillVisualizer.tsx
│   │   ├── TerminalSimulator.tsx
│   │   └── tests/
│   │       └── TerminalSimulator.test.tsx
│   └── ...
└── tailwind.config.js
```

## [Padrões Aplicados]

- **Editorial shell pattern**: use a reading-centric layout with a cover page and a document reader, rather than a dashboard-like landing page. This fits the product better than a conventional SaaS hero and reduces visual noise for long-form docs.
- **Single signature element**: the workflow spine is the memorable visual device. It is tied directly to CrewLoop's handoff model, so the aesthetic risk is justified by the subject.
- **Token-driven theming**: color and type decisions should be expressed as reusable tokens rather than one-off utility class clusters. That reduces drift across the landing page, docs layout, and markdown renderer.
- **Progressive disclosure**: the homepage should surface the highest-level explanation first, then let users move into installation, workflow, and roles. This matches how people learn the system.
- **Accessible motion restraint**: motion should be limited to subtle reveal and hover states, with `prefers-reduced-motion` honored.

## [Estratégia de Implementação]

1. Replace the existing dark neon theme with a warm editorial theme in `index.css` and `tailwind.config.js`.
2. Rework `App.tsx` so the shell reads as a unified site rather than a demo layout. The header should be quieter and navigation states should use the new accent tokens.
3. Refactor `LandingPage.tsx` into a handbook-style hero with:
   - a clear thesis about CrewLoop,
   - a command/install reference block,
   - a workflow spine / role map,
   - and a compact entry path into the docs.
4. Restyle `DocsLayout.tsx` to behave like a reading desk:
   - calmer sidebar,
   - stronger typography in the content column,
   - readable search and nav controls,
   - improved empty/error/loading states.
5. Update `MarkdownRenderer.tsx` so markdown content inherits the editorial system:
   - headings and body copy use the new font stack,
   - code blocks look like annotated reference slabs,
   - alerts become semantic panels,
   - Mermaid diagrams sit inside calmer frames.
6. Refresh `SkillVisualizer.tsx` and `TerminalSimulator.tsx` so they follow the same visual language and do not regress into the old neon/glass style.
7. Update `TerminalSimulator.test.tsx` if the refactor changes the observable copy or timing behavior.

## Contracts

### Route state

```ts
type DocsRoute = '' | `docs/${string}`;

interface AppShellState {
  currentRoute: DocsRoute;
  isDocsView: boolean;
}
```

### Navigation model

```ts
interface NavItem {
  id: string;
  title: string;
  path: string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}
```

### Visual tokens

```ts
interface DesignTokens {
  colors: {
    parchment: string;
    paper: string;
    ink: string;
    graphite: string;
    oxide: string;
    moss: string;
    cobalt: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
}
```

## Test plan

- Verify the landing page still exposes the primary docs CTA and install reference.
- Verify docs navigation still loads the correct markdown file for each route.
- Verify search filtering continues to work with the new sidebar treatment.
- Verify markdown rendering preserves headings, lists, tables, callouts, and code blocks.
- Verify the terminal simulator test reflects any updated text or timing behavior.
- Verify keyboard focus remains visible on links, buttons, and search inputs.
- Verify reduced-motion users do not receive distracting animation.

## Risks and trade-offs

- The new palette may require small adjustments to contrast in markdown content and table borders.
- A warmer shell can make code blocks feel visually softer; code styling needs enough contrast to stay useful.
- If the workflow spine is overused, the page could become ornamental. The design should keep it concentrated in the hero and selected navigation states.
- Because the docs content is user-authored markdown, the renderer must remain flexible enough to handle varied headings, tables, and alerts.

## Requirement traceability

Addressed:

- Full frontend redesign
- New color palette
- Improved typography
- Better docs readability
- Responsive behavior
- Accessibility and reduced motion

Deferred:

- Content rewrite of markdown docs
- Brand/logo redesign
- Router or site architecture replacement
