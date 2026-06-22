# Spec: Add Docusaurus landing page and documentation site

## Acceptance criteria

1. A Docusaurus site is initialized and configured to build static files for GitHub Pages.
2. The landing page (`src/pages/index.js` or `index.md`) explains:
   - What the Loop Engineering Agents bundle is.
   - The mandatory skill flow (orchestrator → architect → designer → engineer → reviewer → shipper).
   - How to install the skills.
   - How to invoke/use the workflow.
3. Documentation pages exist for each skill and shared references.
4. `npm run build` (or equivalent) completes without errors.
5. `scripts/validate-skills.py` still passes.

## Affected files

- New `docs/` Docusaurus project files.
- Possibly `.gitignore` updates for `node_modules/` and build output.

## Non-goals

- Removing or replacing `README.md`.
- Adding a custom domain.
- Adding CI/CD automation beyond basic build instructions.
