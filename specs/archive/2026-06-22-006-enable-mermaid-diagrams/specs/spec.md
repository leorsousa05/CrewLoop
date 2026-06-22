# Spec: Enable Mermaid diagram rendering in Docusaurus

## Acceptance criteria

1. `@docusaurus/theme-mermaid` is installed as a dependency.
2. `docusaurus.config.js` has `markdown: { mermaid: true }` and the Mermaid theme configured.
3. `npm run build` inside `docs/` succeeds.
4. Mermaid diagrams in `docs/docs/workflow.md` render as charts in the built site.
