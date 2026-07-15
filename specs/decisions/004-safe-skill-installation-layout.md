# ADR 004: Safe Skill Installation Layout

- **Status:** Accepted
- **Date:** 2026-07-14
- **Deciders:** project owner, architect skill
- **Spec:** `specs/changes/026-safe-skill-installation/`

## Context

CrewLoop skills combine skill-local files with shared repository references and assets. The installer currently merges those namespaces in copy mode. In symlink mode it first links the complete skill root, then removes and replaces child directories through that link. This can mutate the source package and makes local/shared filename ownership ambiguous.

The upcoming progressive-disclosure work will increase reliance on skill-local references. The distribution layout must therefore guarantee source immutability and preserve local and shared files independently before prompt content is reorganized.

## Decision

1. Every installed skill has a real wrapper directory containing `SKILL.md` at its root.
2. Shared package content is installed under the reserved `_crewloop/references/` and `_crewloop/assets/` namespace.
3. Skill-local `references/` and `assets/` retain their existing names and never merge with shared directories.
4. Copy mode materializes local and shared content.
5. Symlink mode materializes the wrapper and rewritten `SKILL.md`, then links other local payload entries and shared directories individually.
6. The installer never creates a whole-skill-directory symlink and then mutates children through it.
7. Source skills may not define a top-level `_crewloop` entry; such a collision fails installation.
8. Source Markdown continues using repository-relative shared links. Installed `SKILL.md` rewrites those links into the reserved namespace.

## Alternatives Considered

- **Keep merged `references/` and fix only deletion order:** rejected because local/shared filename collisions and ownership ambiguity remain.
- **Link the whole root and place shared files outside it:** rejected because source-relative links would resolve outside the selected target and could collide with user directories.
- **Copy every skill even when `--symlink` is requested:** safe but defeats the development workflow that expects local payload edits to remain live.
- **Use filesystem overlay or mount behavior:** rejected as non-portable across supported Node.js platforms.

## Consequences

- **Positive:** source trees are immutable; local/shared collisions are impossible; installed ownership is explicit; linked local references remain live.
- **Negative:** linked `SKILL.md` edits are not live because that file is materialized for path rewriting; users must reinstall to refresh SKILL.md changes.
- **Negative:** the installed root is no longer itself a symlink, so documentation and tests must define `--symlink` as payload linking.
- **Neutral:** agent discovery remains unchanged because every installed skill still exposes `<skill>/SKILL.md`.
- **Neutral:** existing installations require `crewloop install --force` to adopt the new layout.
