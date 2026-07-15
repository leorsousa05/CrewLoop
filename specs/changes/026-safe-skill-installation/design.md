# Design: Safe Skill Installation Layout

## Overview

The installer will use a materialized installed-skill boundary in both modes. Shared package content is mounted beneath a reserved `_crewloop/` namespace, while skill-local content retains its original paths. Copy mode materializes all content; symlink mode materializes only the wrapper and rewritten `SKILL.md`, then links payload entries without overlaying child directories.

This is a filesystem Adapter design: the public `installSkills` orchestration remains stable while mode-specific installation behavior adapts the same source manifest into safe copy or linked layouts.

## Seven Analysis Questions

1. **Domain and bounded context placement?** The change belongs to the CLI installer bounded context in `packages/cli/src/installer.ts`. It does not affect hooks, dashboard state, or skill behavior after loading.
2. **Core responsibilities?** The installer owns target replacement, source payload distribution, shared namespace distribution, shared-link rewriting, and error reporting. It must treat package sources as immutable inputs.
3. **Contracts to change?** `installSkills` and `InstallOptions` remain public contracts. Internal helpers gain explicit copy/symlink layout responsibilities and link rewriting returns transformed content instead of mutating a source file.
4. **Tests required?** Filesystem branching, mutation, symlink behavior, force replacement, and error paths all require tests under the TDD criteria. Tests must assert both target output and source immutability.
5. **Architecture minimizing ambiguity?** A materialized wrapper plus a reserved shared namespace avoids overlay semantics and makes ownership visible in paths. Separate mode helpers keep symlink-specific safety rules isolated.
6. **Project structure changes?** No production files are added. Tests and documentation are modified; the installed runtime gains `_crewloop/` directories.
7. **Key trade-offs?** Symlink mode no longer makes the root itself a symlink and copies the small `SKILL.md` so links can be portable. This slightly weakens live editing of SKILL.md in exchange for source safety and deterministic references.

## Proposed Directory & File Structure

```text
crewloop/
├── packages/cli/
│   ├── src/
│   │   ├── installer.ts                  (Modified)
│   │   ├── cli.ts                        (Modified)
│   │   └── tests/
│   │       └── installer.test.ts         (Modified)
│   └── README.md                          (Modified)
├── specs/changes/026-safe-skill-installation/
│   ├── .spec.yaml                         (New)
│   ├── proposal.md                        (New)
│   ├── design.md                          (New)
│   ├── tasks.md                           (New)
│   └── specs/cli-installer/spec.md        (New)
└── specs/decisions/
    └── 004-safe-skill-installation-layout.md (New)
```

Installed copy layout:

```text
<target>/<skill>/
├── SKILL.md                         # copied with installed shared links
├── references/                      # copied skill-local content, if present
├── assets/                          # copied skill-local content, if present
└── _crewloop/                       # reserved shared package namespace
    ├── references/                  # copied global references
    └── assets/                      # copied global assets
```

Installed symlink layout:

```text
<target>/<skill>/                    # real wrapper directory
├── SKILL.md                         # materialized with installed shared links
├── references -> <source>/references
├── assets -> <source>/assets
├── <other-entry> -> <source>/<other-entry>
└── _crewloop/
    ├── references -> <shared-root>/references
    └── assets -> <shared-root>/assets
```

Missing source entries are omitted. Missing shared directories are omitted.

## Code Architecture & Design Patterns

### [Padrões Aplicados]

- **Adapter:** copy and symlink helpers adapt one immutable source manifest to two target layouts without exposing filesystem details to CLI orchestration.
- **Command/Query Separation:** content transformation returns rewritten text; filesystem helpers perform writes. This prevents a function named for rewriting links from unexpectedly modifying source files.
- **Single Responsibility:** target cleanup, content transformation, copy installation, and symlink installation remain separate operations.
- **Fail Fast:** a source `_crewloop` collision fails before target payload installation rather than silently overwriting local data.
- **Idempotent replacement:** `--force` removes only the target entry and recreates the expected layout; repeated runs produce equivalent output.

## Contracts

Existing public contract remains:

```typescript
export interface InstallOptions {
  target?: string;
  skills?: string[];
  agent?: string;
  symlink?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

export interface InstallResult {
  installed: string[];
  skipped: string[];
  errors: Error[];
}

export function installSkills(
  skills: SkillManifest[],
  targetDir: string,
  options: InstallOptions,
  sharedRoot?: string
): InstallResult;
```

Internal contracts to implement:

```typescript
function rewriteSharedLinks(content: string): string;

function installCopiedSkill(
  sourcePath: string,
  targetPath: string,
  sharedRoot?: string
): void;

function installLinkedSkill(
  sourcePath: string,
  targetPath: string,
  sharedRoot?: string
): void;

function assertReservedNamespaceAvailable(sourcePath: string): void;
```

Required rewrite mapping:

```text
../../references/<path> -> _crewloop/references/<path>
../../assets/<path>     -> _crewloop/assets/<path>
```

## Flow Diagrams

### Install one skill

1. Determine target path and whether it already exists.
2. Skip without `--force`, or remove the target entry itself with `--force`.
3. Validate that the source does not reserve `_crewloop`.
4. Create a real target wrapper.
5. Execute copy or linked payload strategy.
6. Materialize or link shared directories beneath `_crewloop/`.
7. Record success; convert thrown failures into `InstallResult.errors`.

### Linked payload strategy

1. Read source `SKILL.md`.
2. Rewrite only known shared-root links and write installed `SKILL.md`.
3. Enumerate other top-level source entries.
4. Create a file or directory symlink for each entry without deleting anything below it.
5. Link available shared directories beneath the materialized `_crewloop` directory.

## State Management

The operation has no persistent application state. Filesystem state is scoped to one source path and one target path per skill; `InstallResult` aggregates outcomes. A failure for one skill does not prevent independent skills from being attempted, matching current behavior.

## Error Handling

- Reserved `_crewloop` collisions throw a descriptive error naming the skill source.
- Missing optional local/shared directories are not errors.
- Missing `SKILL.md` remains guarded by the resolver and existing installer behavior.
- Failed symlink creation or copy is captured in `InstallResult.errors`.
- Partial target cleanup after a failed installation is not required in this change; the next `--force` run can replace it. Tests should avoid asserting transactional rollback.

## Security Considerations

- Never recursively delete a path beneath a symlinked source root.
- Never write outside `targetPath` during installation.
- Treat source paths as immutable even when the caller requests `--force`.
- Do not follow or normalize user-provided source symlink targets for deletion.

## Performance Considerations

The number of filesystem operations remains linear in top-level skill entries plus shared directory contents. The small copied `SKILL.md` is negligible; linked mode continues avoiding copies of potentially larger local assets and references.

## Test Plan

- Copy installation preserves local and shared duplicate basenames under separate namespaces.
- Copy installation rewrites both shared reference and shared asset links.
- Linked installation creates a real wrapper, materialized `SKILL.md`, linked local content, and linked shared namespace.
- Linked installation leaves a source snapshot unchanged.
- Force replaces a legacy whole-directory symlink without changing its source.
- Reserved `_crewloop` source entry returns an error.
- Missing local and shared optional directories succeed.
- Existing dry-run and skip behavior remain green.

## [Estratégia de Implementação]

1. Add regression fixtures that include local references/assets and duplicate shared filenames.
2. Refactor link rewriting into a pure string transformation.
3. Implement the safe copy layout with `_crewloop` namespacing.
4. Implement the materialized-wrapper linked layout without root-directory symlinks.
5. Add legacy-force and source-immutability tests.
6. Update CLI help and package README for the revised `--symlink` semantics.
7. Run typecheck/build/tests from `packages/cli/`; do not run unrelated package builds.

## Subagent Parallelization

Not approved. Installer implementation and filesystem tests operate on the same contracts and files; parallel edits would increase coordination risk. Documentation follows the verified implementation sequentially.
