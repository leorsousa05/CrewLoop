# Design

## Approach

1. Replace the main heading and opening paragraph with CrewLoop branding.
2. Add a badge block immediately below the title using standard shields.io badges.
3. Add a "📖 Documentation" callout linking to the live site.
4. Keep the Quick Start section but tighten the wording.
5. Replace the plain skills table with a visually scannable "What's in the box?" section using emojis, short descriptions, and links to Docusaurus docs.
6. Preserve the workflow diagram and rules.
7. Preserve repository layout and contributing sections.
8. Run `python scripts/validate-skills.py` to ensure nothing else breaks.

## Badge URLs

- GitHub Pages: `https://img.shields.io/github/deployments/leorsousa05/CrewLoop/github-pages?label=docs`
- License: `https://img.shields.io/github/license/leorsousa05/CrewLoop`
- Skills: `https://img.shields.io/badge/skills-12-purple`
- Validation: `https://img.shields.io/badge/validate-passing-green`

## Rollback

The change is a single-file edit to `README.md` and can be reverted with `git revert`.
