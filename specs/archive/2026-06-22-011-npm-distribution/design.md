# Design: npm Distribution of CrewLoop Skills

## Overview

Adopt the de-facto agent-skills distribution pattern: ship `SKILL.md` files in an npm package and expose a tiny installer CLI. The CLI is a pure file-system operation: discover skills inside the package, then copy or symlink them into the agent's skills directory. No runtime server, no postinstall surprises.

## Proposed Directory & File Structure

```
CrewLoop/
├── package.json                       # @crewloop/skills package manifest
├── README.md                          # Updated with npm install instructions
├── LICENSE.md
├── skills/                            # Unchanged skill source tree
│   ├── orchestrator/
│   │   └── SKILL.md
│   ├── architect/
│   │   └── SKILL.md
│   └── ...
├── scripts/
│   ├── install.sh                     # Fallback installer (behavior preserved)
│   └── validate-skills.py             # Existing validator
└── packages/
    └── cli/                           # @crewloop/cli
        ├── package.json
        ├── README.md
        ├── tsconfig.json              # TypeScript config
        ├── bin/
        │   └── crewloop.js            # Executable entry point (requires dist/)
        ├── src/                       # TypeScript source
        │   ├── cli.ts                 # Argument parsing and command dispatch
        │   ├── installer.ts           # Core copy/symlink logic
        │   ├── resolver.ts            # Resolve source skills from node_modules
        │   └── agents.ts              # Known agent directory conventions
        ├── dist/                      # Compiled JavaScript (published)
        └── tests/
            ├── installer.test.ts
            └── resolver.test.ts
```

## Code Architecture & Design Patterns

- **Modular CLI architecture:** command parsing, resolution, and filesystem operations are separate modules. Each module has a single responsibility.
- **Strategy pattern for install mode:** `copy` and `symlink` are two strategies selected by a flag.
- **Registry/lookup pattern for agents:** `agents.js` maps agent identifiers to their default skills directories, keeping the CLI extensible.
- **Pure functions for path resolution:** filesystem side effects are isolated in `installer.js`; `resolver.js` returns paths without mutating state.

## Data Model

```typescript
interface SkillManifest {
  name: string;
  description: string;
  sourcePath: string;   // absolute path inside node_modules
}

interface AgentConfig {
  id: string;
  skillsDir: string;    // e.g. "~/.agents/skills" or "~/.claude/skills"
}

interface InstallOptions {
  target?: string;      // override agent default
  skills?: string[];    // filter by skill name
  agent?: string;       // target agent convention
  symlink?: boolean;    // default false
  force?: boolean;      // overwrite existing
  dryRun?: boolean;     // print, do not write
}
```

## API Contracts

```typescript
// src/resolver.ts
export function resolveSkills(packageRoot: string, filters?: string[]): SkillManifest[];

// src/agents.ts
export function resolveAgentDir(agentId?: string): string;
export function listSupportedAgents(): AgentConfig[];

// src/installer.ts
export function installSkills(
  skills: SkillManifest[],
  targetDir: string,
  options: InstallOptions
): { installed: string[]; skipped: string[]; errors: Error[] };

// src/cli.ts
export function run(argv: string[]): Promise<number>; // exit code
```

## Build & Publish

- Source is authored in TypeScript under `packages/cli/src/`.
- `tsconfig.json` targets Node 18+, outputs CommonJS to `packages/cli/dist/`.
- `package.json` includes `build`, `typecheck`, and `test` scripts.
- `bin/crewloop.js` is a thin wrapper that requires `../dist/cli.js` and calls `run(process.argv.slice(2))`.
- Only `dist/`, `bin/`, `README.md`, and `package.json` are included in the published `@crewloop/cli` package via the `files` array.
- Root `package.json` for `@crewloop/skills` does not need TypeScript; it only ships the `skills/` directory and metadata.
- During development, `packages/cli/package.json` depends on `@crewloop/skills` via `file:../..` so the CLI can resolve the local source. Before publishing `@crewloop/cli`, this dependency must be switched to `^0.1.0` after `@crewloop/skills` is published.

## Flow Diagrams

### Install command

1. Parse CLI arguments into `InstallOptions`.
2. Determine source package root (`@crewloop/skills`) via `require.resolve` or `process.cwd()` + `node_modules`.
3. Determine target directory from `--target`, `--agent`, or default `~/.agents/skills/`.
4. Resolve skills matching `--skill` filters; default to all.
5. For each skill, ensure target directory exists.
6. If `--symlink`, create symlink; otherwise copy recursively.
7. If `--force`, remove existing target first; otherwise skip existing targets.
8. Report installed/skipped/errored skills.

### List command

1. Resolve source package root.
2. Read `skills/` directory.
3. Print skill names and descriptions from frontmatter.

## State Management

No persistent state. The CLI is stateless except for the filesystem. It does not write lockfiles or manifests; npm's `package-lock.json` handles version pinning.

## Error Handling

- Missing source package → clear error message with install command hint.
- Permission denied → suggest custom `--target` or `sudo` only for system paths.
- Existing skill without `--force` → report as skipped, not an error.
- Invalid skill filter → list available skills and exit with code 1.
- Symlink failure → fall back to copy with a warning (if feasible) or report error.

## Performance Considerations

- Skill files are small Markdown files; copy operations are negligible.
- No network calls at install time; npm already fetched the package.
- `--dry-run` allows users to preview operations instantly.

## Security Considerations

- The CLI only reads from its own package directory and writes to the specified target.
- No `postinstall` scripts run automatically.
- No shell execution of user-provided paths; paths are resolved with `path.resolve` and validated to be within the target directory.
- Symlinks are created relative to the target, not absolute, to avoid traversal issues.
