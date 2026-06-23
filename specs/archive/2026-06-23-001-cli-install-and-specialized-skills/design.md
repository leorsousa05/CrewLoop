# Design: CLI consolidation and specialized review skills

## 7 analysis questions

1. **Domain and bounded context placement?**  
   The change touches three bounded contexts: the CLI installer (`packages/cli/`), the skill bundle (`skills/`), and project documentation (`README.md`, `references/`, `docs/`). The CLI belongs to the distribution/packaging context; the new skills belong to the crew-role context alongside `tester` and `product-manager`; documentation updates belong to the project-guide context.

2. **Core responsibilities of new/changed components?**  
   `installer.ts` owns copying skills and merging shared directories. A new `mcp.ts` owns Python-venv creation and binary exposure. `cli.ts` orchestrates the install steps and reports results. `security-guard` performs deep security reviews. `accessibility-auditor` performs focused accessibility reviews.

3. **Contracts (interfaces, types, APIs) to define or change?**  
   `installSkills` gains a `sharedRoot` parameter. A new `installMcpServer` function exposes `McpInstallOptions` and `McpInstallResult`. The two new skills expose no code contracts, only documentation contracts: frontmatter, role prefix, workflow, and navigation menu.

4. **Which parts need tests per TDD skip criteria?**  
   The CLI merge logic and MCP install logic have branching, side effects (filesystem), and external dependencies (Python/pip). They require unit tests. The new skills are Markdown documents with no logic; they need validation via `validate-skills.py`, not unit tests.

5. **Architecture that minimizes ambiguity?**  
   Keep the CLI as a thin coordinator: `handleInstall` calls `installSkills` (skill copy + shared merge) and then `installMcpServer`. Each helper is independently testable. The new skills follow the exact same structure as existing supporting skills to reduce variation.

6. **Project structure changes needed?**  
   New files in `skills/security-guard/`, `skills/accessibility-auditor/`, `packages/cli/src/mcp.ts`, `packages/cli/src/tests/mcp.test.ts`, and `docs/docs/supporting/`. Modified files in `packages/cli/src/installer.ts`, `packages/cli/src/cli.ts`, `packages/cli/src/tests/installer.test.ts`, root `package.json`, `README.md`, `references/workflow.md`, `docs/sidebars.js`, and `specs/living/npm-distribution/spec.md`. Deletion of `scripts/install.sh`.

7. **Key trade-offs?**  
   Shipping `servers/obsidian-mcp/` in the npm package increases tarball size but lets the CLI install everything from a single package. Removing `install.sh` simplifies maintenance but breaks the documented source-fallback path for users who do not use npm; this is mitigated by documenting `crewloop install` from a local clone. Windows MCP binary exposure is complex; the design uses a `.cmd` wrapper fallback to avoid requiring elevated privileges.

## Directory structure after the change

```
loop-engineering-agents/
├── package.json                         # files: skills/, references/, assets/, servers/obsidian-mcp/
├── README.md                            # CLI-only install, new skills listed
├── references/
│   └── workflow.md                      # includes security-guard & accessibility-auditor
├── scripts/
│   ├── install.sh                       # REMOVED
│   ├── npm-publish-dry-run.sh
│   ├── package-skill.py
│   └── validate-skills.py
├── packages/cli/src/
│   ├── cli.ts                           # orchestrates shared merge + MCP install
│   ├── installer.ts                     # merges references/ & assets/
│   ├── mcp.ts                           # NEW: MCP server installation
│   └── tests/
│       ├── installer.test.ts            # shared merge tests
│       ├── mcp.test.ts                  # NEW
│       └── cli.test.ts                  # optional flag tests
├── skills/
│   ├── security-guard/                  # NEW
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── security-checklist.md
│   └── accessibility-auditor/           # NEW
│       ├── SKILL.md
│       └── references/
│           └── a11y-checklist.md
├── docs/
│   ├── sidebars.js                      # new supporting entries
│   └── docs/supporting/
│       ├── security-guard.md            # NEW
│       └── accessibility-auditor.md     # NEW
└── specs/
    ├── changes/001-cli-install-and-specialized-skills/
    └── decisions/004-cli-as-sole-installer.md
```

## Contracts and interfaces

### CLI installer

```ts
// packages/cli/src/installer.ts

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

/**
 * Install skills into the target directory.
 * When sharedRoot is provided, also merges <sharedRoot>/references and
 * <sharedRoot>/assets into each installed skill.
 */
export function installSkills(
  skills: SkillManifest[],
  targetDir: string,
  options: InstallOptions,
  sharedRoot?: string
): InstallResult;

/**
 * Copy shared directories into a single skill target.
 */
export function mergeSharedDirs(
  targetSkillPath: string,
  sharedRoot: string,
  options: { dryRun?: boolean }
): void;
```

### MCP installer

```ts
// packages/cli/src/mcp.ts

export interface McpInstallOptions {
  dryRun?: boolean;
  force?: boolean;
  /** Python executable name/path. Default: "python3" on Unix, "python" on Windows. */
  pythonCmd?: string;
  /** Directory where the obsidian-mcp wrapper/symlink is placed. Default: <homedir>/.local/bin */
  localBinDir?: string;
}

export interface McpInstallResult {
  /** True if a new install or re-install happened. */
  installed: boolean;
  /** True if the binary was already present and force was false. */
  skipped: boolean;
  /** Absolute path to the exposed binary or wrapper. */
  binaryPath?: string;
  /** Error that did not block skill installation. */
  error?: Error;
}

/**
 * Install the Obsidian MCP server from mcpSourceDir.
 *
 * Steps:
 * 1. Create venv at <mcpSourceDir>/.venv if missing or force=true.
 * 2. pip install -e <mcpSourceDir>.
 * 3. Create a symlink (Unix) or .cmd wrapper (Windows) in localBinDir.
 */
export function installMcpServer(
  mcpSourceDir: string,
  options?: McpInstallOptions
): McpInstallResult;
```

### CLI orchestration

`handleInstall` in `packages/cli/src/cli.ts` changes to:

```ts
const packageRoot = resolvePackageRoot();
const skills = resolveSkills(packageRoot, args.skills);
const targetDir = args.target || resolveAgentDir(args.agent);

const result = installSkills(skills, targetDir, args, packageRoot);

const mcpDir = path.join(packageRoot, 'servers', 'obsidian-mcp');
let mcpResult: McpInstallResult | undefined;
if (fs.existsSync(mcpDir)) {
  mcpResult = installMcpServer(mcpDir, args);
}

// print results
```

## Data flow

1. User runs `crewloop install [flags]`.
2. `run()` parses arguments and dispatches to `handleInstall()`.
3. `handleInstall()` resolves the skills package root via `resolvePackageRoot()`.
4. `resolveSkills(packageRoot, filters)` reads `skills/` and returns manifests.
5. `installSkills()` loops over manifests:
   - Copies/symlinks the skill directory into the target.
   - Calls `mergeSharedDirs()` to overlay `references/` and `assets/`.
6. `handleInstall()` checks for `servers/obsidian-mcp/` and calls `installMcpServer()`.
7. `installMcpServer()` creates venv, runs pip, exposes binary.
8. CLI prints installed/skipped skills and MCP status.

## Test plan

### Unit tests

- `installer.test.ts`:
  - Shared directories are merged into each installed skill.
  - Shared merge respects `--dry-run`.
  - Existing skill files are not overwritten by shared files unless overlapping.
  - `--symlink` mode does not break when shared dirs are merged.
- `mcp.test.ts`:
  - `--dry-run` reports would-install without creating venv.
  - Missing Python is reported as an error but not thrown.
  - pip failure is reported as an error.
  - Successful install creates venv, runs pip, and creates binary wrapper.
  - Windows path returns `.cmd` wrapper.
- `cli.test.ts`:
  - New flags if any are parsed correctly.
  - Help text mentions MCP install.

### Integration / manual tests

- Run `crewloop install --target /tmp/crewloop-test` from a local clone and verify every skill has `references/` and `assets/`.
- Verify `obsidian-mcp` binary appears in the configured local bin dir.
- Run `python scripts/validate-skills.py` and confirm all skills pass.
- Run `cd docs && npm run build` and confirm no broken links.
- Run `npm test` in `packages/cli`.

## Risk assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing `install.sh` breaks users who relied on it. | Medium | Update README immediately; CLI is already the recommended path. |
| Windows users cannot create symlinks for MCP binary. | Medium | Use `.cmd` wrapper fallback instead of symlinks. |
| Shipping `servers/obsidian-mcp/` in npm package bloats tarball. | Low | Acceptable; keeps single-package distribution. |
| New skill triggers overlap with `reviewer`. | Low | Clear separation: reviewer is general gate; new skills are deep-dive specialists. |
| MCP install failure blocks no skills, but user may not notice warning. | Low | Print MCP result separately and clearly. |

## Subagent parallelization analysis

The task has four largely independent components:

1. **security-guard skill** — `skills/security-guard/SKILL.md`, references, docs page.
2. **accessibility-auditor skill** — `skills/accessibility-auditor/SKILL.md`, references, docs page.
3. **CLI installer consolidation** — `installer.ts`, `mcp.ts`, `cli.ts`, tests, `package.json`, README install section.
4. **Docs/workflow updates** — `README.md` skill list, `references/workflow.md`, `docs/sidebars.js`, `specs/living/npm-distribution/spec.md`, removal of `install.sh`.

Components 1 and 2 are independent. Component 3 changes `README.md` only in the install section. Component 4 changes `README.md` only in the skill list. The risk of edit conflicts in `README.md` is low if subagents coordinate on separate sections.

**Recommendation:** Enable parallel development. Ask the user before spawning subagents.
