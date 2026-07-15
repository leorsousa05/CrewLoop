# Spec Delta: CLI Skill Installer

## Current State

- Copy mode copies the complete source skill, then copies shared `references/` and `assets/` into the same local directories.
- Symlink mode links the complete skill directory, then removes and replaces child shared directories through that link.
- Shared links in `SKILL.md` are rewritten only in copy mode from `../../references/` and `../../assets/` to local merged paths.
- The existing symlink regression test has no local references and therefore does not expose source mutation.

## Changes

### ADDED

- A reserved installed namespace: `<installed-skill>/_crewloop/references/` and `<installed-skill>/_crewloop/assets/`.
- A materialized wrapper directory for symlink installations.
- Regression coverage for source immutability, local/shared basename collisions, force replacement of a legacy root symlink, and installed link resolution.
- An installation error when a source skill already contains the reserved `_crewloop` entry.

### MODIFIED

- Copy mode places shared directories beneath `_crewloop/` instead of merging them into local skill directories.
- Symlink mode links source payload entries individually while keeping the installed wrapper and rewritten `SKILL.md` materialized.
- Installed `SKILL.md` shared links resolve to `_crewloop/references/` and `_crewloop/assets/`.
- CLI help and package documentation describe the new `--symlink` behavior.

### REMOVED

- Whole-skill-directory symlinks.
- Removal or replacement of `references/` and `assets/` through a symlinked skill root.
- Shared/local namespace merging.

## Behavioral Requirements

### Copy installation

1. Create a real target skill directory.
2. Copy the source skill contents unchanged except for the installed `SKILL.md` shared-link rewrite.
3. Copy shared directories into the reserved `_crewloop/` namespace.
4. Preserve local `references/` and `assets/` even when shared files use identical basenames.

### Symlink installation

1. Create a real target skill directory.
2. Write a materialized installed `SKILL.md` with shared links rewritten.
3. Symlink each remaining top-level source entry into the wrapper without traversing or mutating the source.
4. Create `_crewloop/references` and `_crewloop/assets` symlinks to the shared package directories.
5. Never recursively remove a path reached through a source-directory symlink.

### Force migration

1. Remove the existing target entry itself, whether it is a file, directory, or legacy directory symlink.
2. Do not traverse the legacy link target.
3. Install the new wrapper layout.

## Migration Notes

Users refresh existing installations with `crewloop install --force`. The operation replaces old installed skill roots with the safe wrapper layout. No source skill or user file outside the selected target directory may be changed.

## Backward Compatibility

Skill discovery remains compatible because `SKILL.md` stays at the installed skill root. Local reference paths remain unchanged. The filesystem identity of the root changes in `--symlink` mode from a symlink to a real directory; this is an intentional safety correction and must be documented.
