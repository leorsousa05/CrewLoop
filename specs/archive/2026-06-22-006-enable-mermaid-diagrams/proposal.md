# Proposal: Enable Mermaid diagram rendering in Docusaurus

## Problem

The workflow documentation uses Mermaid syntax inside Markdown code blocks, but Docusaurus does not render Mermaid diagrams by default. The diagram appears as plain text instead of a visual chart.

## Why now

The workflow page depends on diagrams to explain the CrewLoop process. Without rendering, the documentation is harder to understand.

## Scope

In scope:
- Install `@docusaurus/theme-mermaid`.
- Enable Mermaid in `docusaurus.config.js`.
- Verify that `npm run build` succeeds and diagrams render.

Out of scope:
- Changing the workflow content itself.
