# Proposal: README Redesign

## WHY

The current `README.md` is technically complete but visually plain. It communicates CrewLoop's value through dense text, tables, and a Mermaid diagram, with no images or visual personality. For an open-source project that ships a dashboard and a colorful crew of AI skills, the first impression should feel as organized and alive as the product itself.

## Objectives

1. Make the README visually inviting and memorable.
2. Showcase the real-time dashboard and skill activation with screenshots.
3. Preserve all technical accuracy, badges, skill tables, and workflow diagrams.
4. Keep technical terms in English per project convention.
5. Store all image assets inside the repository under `assets/`.

## Scope

- Rewrite the top half of `README.md` with a hero banner, tagline, and clearer hook.
- Add a dashboard screenshot and a skill-active screenshot.
- Refactor section order for better narrative flow.
- Keep CLI reference, supported agents, crew tables, workflow diagram, repository layout, contributing, and license sections.
- Add new image assets in `assets/images/` and `assets/screenshots/`.
- Update `AGENTS.md` only if the repository structure changes (new asset folders).

## Constraints

- Must remain valid GitHub-flavored Markdown.
- Images must use relative paths so they render correctly on GitHub.
- Must not break existing links, badges, or npm metadata.
- Must not add external image hosting dependencies.
- Must not alter the actual CLI/dashboard code.

## Out of Scope

- Redesigning the Docusaurus docs site.
- Changing the CLI or dashboard UI itself.
- Creating animated GIFs unless the user provides them.
- Translating the README to other languages.
