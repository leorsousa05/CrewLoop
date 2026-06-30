# Design: README Rewrite + Shipper Version Bump

## Architecture & Patterns

- **Docs-as-Code:** README.md is treated as a deployable artifact alongside code.
- **Skill-as-Instruction:** The Shipper skill is a Markdown instruction file; changes to it only modify behavior guidance for agents.
- **Semantic Versioning:** The project follows SemVer for its two published packages.

## Directory Structure

```
crewloop/
├── README.md                        # Rewritten
├── package.json                     # Bumped version
├── packages/cli/package.json        # Bumped version
└── skills/shipper/SKILL.md          # Updated version bump rules
```

## README Structure

The rewritten README will include:

1. **Title + one-liner**
2. **Badges:** NPM version, license, CI/tests, docs
3. **What is CrewLoop?** — 2-3 sentences
4. **Highlights** — bullet list of key differentiators
5. **Quick Start** — install CLI, install skills, validate
6. **What's in the Box?** — core + supporting skills tables
7. **Workflow** — hub-and-spoke diagram and rules
8. **Contributing** — brief pointer to docs
9. **License**

## Shipper Skill Contract

### Inputs

- Diff summary.
- Conventional commit type (`feat`, `fix`, etc.).
- Package manifest changes compared to `origin/main`.

### Outputs

- Decision on whether to bump version.
- If bumping: suggested semver level and confirmation from user.
- Execution of `npm version` if confirmed.

### Rules

| Commit type | Semver bump | Example |
|-------------|-------------|---------|
| `fix` | patch (`0.0.1`) | Bug fix |
| `feat` | minor (`0.1.0`) | New skill |
| breaking change (`!` or `BREAKING CHANGE:`) | major (`1.0.0` if pre-1.0, may still be minor) | Incompatible API change |
| `docs`, `test`, `refactor`, `style`, `chore` | usually none | Internal cleanup |

**Mandatory question when unsure:**

```markdown
This change may require a version bump. Based on the diff:
- Commit type: `<type>`
- Recommended bump: `<patch | minor | major | none>`

Do you want me to run `npm version <level> --workspaces --no-git-tag-version`?
```

## Test Plan

- Run `python scripts/validate-skills.py` after editing `skills/shipper/SKILL.md`.
- Verify README renders correctly in a Markdown preview.
- Confirm `package.json` versions are aligned.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| README becomes too long | Keep under 200 lines; link to docs site for details. |
| Badges use wrong URLs | Use `shields.io` with correct npm package names and GitHub paths. |
| Shipper skill becomes too verbose | Add concise rules and a decision table. |

## Deferred

- None.
