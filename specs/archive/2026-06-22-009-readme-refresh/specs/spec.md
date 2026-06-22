# Spec: Refresh README.md for CrewLoop

## Acceptance criteria

1. `README.md` title and description reference **CrewLoop**, not Loop Engineering Agents.
2. Badges are present at the top:
   - GitHub Pages deploy status
   - MIT license
   - `validate-skills.py` passing
   - Skills count (12)
3. A prominent link to `https://leorsousa05.github.io/CrewLoop/` is included.
4. The Quick Start section is concise and actionable.
5. A "What's in the box?" section lists all 12 skills with emojis and links to their docs pages.
6. Existing workflow rules, repository layout, and contributing instructions are preserved or improved.
7. All links in `README.md` are valid.

## Affected files

- `README.md`

## Non-goals

- Modifying any `SKILL.md` files.
- Changing the Docusaurus site.
- Adding new scripts or configuration.

## Directory structure

```
loop-engineering-agents/
└── README.md          # UPDATED
```
