# Proposal — Complete Restructure of CrewLoop Public Documentation

## WHY

The existing documentation has four compounding problems:

### 1. Installation instructions are broken
`docs/docs/installation.md` still references `./scripts/install.sh`, which no longer exists. The correct method is `npm install -g @archznn/crewloop-cli && crewloop install`. Any new user following the current docs hits a dead end immediately.

### 2. Information architecture does not serve two audiences
The current structure mixes "how to use CrewLoop" (users) and "how to contribute" (contributors) without distinction. A developer installing the CLI for the first time reads the same sidebar as someone adding a new skill or modifying the dashboard. The structure needs to route each audience clearly.

### 3. Supporting skill pages are too shallow
All 7 supporting skill pages are between 1,600 and 2,400 bytes — a few bullet points each. They lack: concrete invocation examples, output artifact descriptions, handoff specifics, and the "never does" boundary list. A developer does not know enough from these pages to use or invoke those skills correctly.

### 4. Missing content for real components
The dashboard (`servers/dashboard/`) and Obsidian MCP (`servers/obsidian-mcp/`) have no documentation pages. The CLI has no reference page listing all commands and flags. These are real, shipped components that users encounter.

## SCOPE

### In scope
- `README.md` (root) — rewrite to reflect v0.7.0, fix layout, add obsidian-mcp
- `docs/docs/` — full restructure into 5 sections (getting-started, concepts, the-crew, tools, contributing)
- `docs/sidebars.js` — complete rewrite for new structure
- `docs/docusaurus.config.js` — update navbar and footer links to match new structure
- `docs/src/pages/index.js` — update hero CTA links if needed

### Out of scope
- Docusaurus theme customization (CSS)
- Adding i18n / PT-BR
- Blog section
- Any SKILL.md modification
- Video or screenshot assets
- Docusaurus plugin additions (no new npm dependencies)

## CONSTRAINTS

- `baseUrl`, `organizationName`, `projectName`, `url` in `docusaurus.config.js` must not change
- No new npm dependencies in `docs/package.json`
- All pages in English
- `npm run build` in `docs/` must pass with zero errors after completion
- No broken internal links (Docusaurus throws on broken links — `onBrokenLinks: 'throw'`)
- Supporting skills removed from `workflow/` category must have their content preserved in the new location
