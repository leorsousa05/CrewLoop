# Design

## Approach

1. Install `@docusaurus/theme-mermaid` in the `docs/` project.
2. Add `markdown: { mermaid: true }` to the Docusaurus config.
3. Add `themes: ['@docusaurus/theme-mermaid']` to the config.
4. Build and verify.

## Rollback

Remove the dependency and the two config lines.
