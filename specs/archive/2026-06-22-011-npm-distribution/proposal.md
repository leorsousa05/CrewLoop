# Proposal: Distribute CrewLoop skills via npm with an installer CLI

## Status
- **State:** active
- **Created:** 2026-06-22
- **Author:** agent

## Problem Statement

Today CrewLoop skills are installed by running `./scripts/install.sh`, which copies `skills/*` from a git clone into `~/.agents/skills/`. This works for local development, but it has friction for consumers:

- It requires cloning the repository.
- It does not integrate with package managers or versioning.
- Updates are manual: re-clone and re-run the script.
- There is no easy way to install only a subset of skills or target multiple agent directories.

The agent-skills ecosystem is moving toward npm as the distribution layer. Examples such as `skills` (skills.sh), `skills-npm` by Anthony Fu, `excalidraw-skill`, `npm-package-skill`, and `claude-skill-lord` all ship `SKILL.md` files inside npm packages and expose a small CLI installer. CrewLoop should adopt the same convention so users can install and update skills with standard npm workflows.

## Goals

1. Publish CrewLoop skills as an npm package (`@crewloop/skills`) that can be installed with `npm install`.
2. Provide a lightweight installer CLI (`@crewloop/cli`) that copies or symlinks the bundled skills into the user's agent skills directory.
3. Preserve the existing `skills/<name>/SKILL.md` layout and validation behavior.
4. Support per-skill filters, custom target directories, and multiple agent install paths.
5. Keep the `install.sh` script as a fallback for users who do not use npm.

## Non-Goals

- Changing the skill format or `SKILL.md` frontmatter schema.
- Building a marketplace, registry, or search index.
- Supporting package-level dependencies between individual skills.
- Replacing the existing Docusaurus documentation site.
- Modifying how agent hosts (Kimi Code, Claude Code, etc.) load skills internally.

## Constraints

- The published package must include only distributable files (`skills/`, `README.md`, `LICENSE.md`, package metadata).
- The CLI must work on Windows, macOS, and Linux without requiring a build step for consumers.
- The CLI must not execute arbitrary postinstall scripts or require elevated privileges.
- Skills must remain compatible with `python scripts/validate-skills.py` after installation.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| npm package bloat from bundled references/assets | Med | Use `files` whitelist in `package.json`; keep shared refs separate from per-skill copies. |
| Symlinks fail on Windows or in restricted environments | Med | CLI defaults to copy mode; symlink mode is opt-in via `--symlink`. |
| Agent vendors use different skills directory conventions | Med | Start with `~/.agents/skills/` (Kimi Code) and `--target` override; add known agents later. |
| Version drift between npm package and git repo | Low | Publish from CI on git tags; document version mapping. |

## Success Criteria

- [ ] `npm install @crewloop/skills` places skill files under `node_modules/@crewloop/skills/skills/`.
- [ ] `npx @crewloop/cli install` copies all 12 skills to `~/.agents/skills/` by default.
- [ ] `npx @crewloop/cli install --skill architect --skill engineer` installs only the selected skills.
- [ ] `npx @crewloop/cli install --target /custom/path` installs to a custom directory.
- [ ] `python scripts/validate-skills.py` still passes against the source `skills/` directory.
- [ ] `install.sh` continues to work unchanged for non-npm users.
