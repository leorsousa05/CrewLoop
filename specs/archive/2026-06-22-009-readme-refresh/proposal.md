# Proposal: Refresh README.md for CrewLoop

## Problem Statement

The current `README.md` still refers to the project as "Loop Engineering Agents" and does not reflect the new CrewLoop branding. It also lacks badges, a link to the live Docusaurus documentation site, and a modern structure that helps visitors quickly understand what the project is and how to use it.

## Goals

1. Update title, description, and all references to use **CrewLoop**.
2. Add badges for GitHub Pages status, MIT license, validation, and skills count.
3. Add a prominent link to the online documentation at `https://leorsousa05.github.io/CrewLoop/`.
4. Improve the Quick Start section with clearer steps.
5. Add a "What's in the box?" section that introduces each skill with emojis and links to the docs.
6. Preserve the essential existing content (workflow rules, repository layout, contributing).

## Non-Goals

- Rewriting skill files.
- Changing the Docusaurus site content.
- Adding CI/CD badges that require external services beyond GitHub Actions.

## Constraints

- Keep README.md readable and scannable.
- Use Markdown only; no HTML complexity.
- Maintain Conventional Commits style for the eventual commit.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken links to docs | Low | Verify all relative and absolute URLs |
| Outdated workflow references | Low | Cross-check with AGENTS.md and current docs |

## Success Criteria

- [ ] README.md uses "CrewLoop" consistently.
- [ ] Badges render correctly on GitHub.
- [ ] Link to live docs is present and working.
- [ ] New "What's in the box?" section is included.
