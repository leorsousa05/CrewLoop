# Design: DiamondBlock Runtime Integration and Lifecycle

## Overview

Introduce a narrow Anti-Corruption Layer between CrewLoop CLI orchestration and the official DiamondBlock installer. CrewLoop owns intent, preflight, output, and failure semantics; DiamondBlock owns all MCP config formats and writes. Separately, make runtime activation an instruction-level capability check based on tools actually exposed to the agent.

## Proposed Directory & File Structure

```text
crewloop/
├── packages/cli/
│   ├── src/
│   │   ├── args.ts                         (Modified: --diamondblock)
│   │   ├── help.ts                         (Modified: option, examples, distinction)
│   │   ├── diamondblock.ts                 (New: official CLI adapter)
│   │   ├── commands/
│   │   │   ├── install.ts                  (Modified: preflight + opt-in execution)
│   │   │   └── doctor.ts                   (Modified: layered optional checks)
│   │   └── tests/
│   │       ├── args.test.ts                (Modified)
│   │       ├── help.test.ts                (Modified)
│   │       ├── commands.test.ts            (Modified)
│   │       └── diamondblock.test.ts        (New)
│   ├── README.md                           (Modified)
│   └── AGENTS.md                           (Modified)
├── skills/
│   ├── crewloop-hub/SKILL.md               (Modified: direct capability-first invocation)
│   ├── diamondblock/SKILL.md                (Modified: identifiers and lifecycle intents)
│   └── shipper/SKILL.md                     (Modified: post-push wrap-up outside AFK)
├── references/
│   ├── conventions.md                      (Modified: optional runtime lifecycle)
│   ├── workflow.md                         (Modified: startup/repeated/wrap-up paths)
│   └── skill-contracts.yaml                (Modified only if transition metadata needs clarification)
├── docs/public/docs/
│   ├── getting-started/installation.md     (Modified)
│   └── concepts/
│       ├── skills-and-roles.md              (Modified)
│       └── workflow.md                      (Modified)
├── specs/living/
│   ├── cli/spec.md                          (Modified on completion)
│   └── supporting-team-skills/spec.md       (Modified on completion)
└── specs/decisions/
    └── 006-diamondblock-official-installer-boundary.md (New)
```

## 7 Analysis Questions

1. **Domain and bounded context placement:** MCP installation belongs to the CLI integration boundary, not the generic skill installer or hook writers. Runtime memory behavior belongs to supporting-skill orchestration between Hub, DiamondBlock, and Shipper.
2. **Core responsibilities:** `diamondblock.ts` locates and invokes the official executable; `install.ts` sequences preflight and installation; Doctor reports evidence layers; skills define when capabilities are used.
3. **Contracts:** Add one CLI flag, subprocess request/result contracts, injectable command execution for tests, layered doctor checks, and instruction contracts for capability/identifier handling.
4. **Tests:** Parser, subprocess execution, filesystem/PATH lookup, branching, output, failures, and skill transitions all require tests under TDD criteria.
5. **Architecture:** A small adapter prevents CrewLoop from coupling to every MCP config schema while capability-based runtime detection avoids static false positives.
6. **Project structure:** One CLI module and one test file are added; all other changes stay within existing command, skill, reference, docs, and living-spec locations.
7. **Trade-offs:** Delegation reduces config control but avoids duplicate ownership; Doctor cannot prove runtime tool exposure from outside an agent, so it reports readiness plus explicit runtime verification guidance.

## Code Architecture & Design Patterns

- **Ports & Adapters:** CrewLoop defines a command-runner port; the Node subprocess implementation is the adapter.
- **Anti-Corruption Layer:** official CLI arguments and exit codes are translated into stable CrewLoop result types.
- **Strategy by authority:** DiamondBlock owns agent config strategies; CrewLoop never writes them.
- **Capability Detection:** runtime behavior depends on exposed MCP capabilities, not package, binary, or config-file assumptions.
- **Fail-Fast Preflight:** explicit opt-in validates binary and target compatibility before CrewLoop mutates skill/hook files.
- **Graceful Degradation:** runtime memory failure falls back to existing discovery/shipping flow.
- **Dependency Injection:** PATH lookup and process execution are injected for deterministic tests.

## Data Model

```typescript
interface CliOptions {
  diamondblock?: boolean;
}

interface DiamondBlockInstallRequest {
  agent?: string;
  dryRun: boolean;
}

type DiamondBlockExecutable = 'diamondblock' | 'dblock';

interface DiamondBlockCommandResult {
  status: 'ready' | 'configured' | 'unsupported' | 'unavailable' | 'failed';
  executable?: string;
  agent?: string;
  dryRun: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: Error;
}

interface DiamondBlockRuntimeContext {
  projectId?: string;
  sessionId?: string;
  projectRoot?: string;
  capabilities: ReadonlySet<DiamondBlockCapability>;
}

type DiamondBlockCapability =
  | 'get_context'
  | 'search_memory'
  | 'save_memory'
  | 'update_memory'
  | 'log_session'
  | 'index_codebase';
```

## API Contracts

```typescript
interface CommandExecutionRequest {
  command: string;
  args: readonly string[];
}

interface CommandExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: Error;
}

interface DiamondBlockCommandRunner {
  findExecutable(): string | undefined;
  preflight(request: DiamondBlockInstallRequest): DiamondBlockCommandResult;
  install(request: DiamondBlockInstallRequest): DiamondBlockCommandResult;
}

function buildDiamondBlockInstallArgs(request: DiamondBlockInstallRequest): string[];
function createDiamondBlockCommandRunner(deps?: DiamondBlockRunnerDependencies): DiamondBlockCommandRunner;
function formatDiamondBlockInstallResult(result: DiamondBlockCommandResult): string;
```

`buildDiamondBlockInstallArgs` contract:

- Base: `['install']`.
- Add `['--target', agent]` only when an explicit agent exists.
- Add `['--dry-run']` when `dryRun` is true.
- Never construct shell command strings; executable and arguments remain separate to prevent injection.

## Install Flow

1. Parse `--diamondblock` only for `install`.
2. Resolve skills and target as today.
3. If the flag is absent, execute the existing flow unchanged.
4. If present, locate `diamondblock`, then `dblock`; missing binary returns an actionable error before mutation.
5. Execute official dry-run preflight with optional target; non-zero aborts before mutation.
6. If CrewLoop `--dry-run` is active, run only CrewLoop previews plus the official dry-run and return.
7. Install skills and hooks using existing ownership rules.
8. Execute official install with optional target.
9. Report configured/failed status separately; final failure returns non-zero and states that CrewLoop files may already be installed.

## Doctor Flow

1. Check whether the DiamondBlock skill exists in the selected/default skill root.
2. Check `diamondblock` then `dblock` on PATH.
3. If absent, emit optional warning and installation hint.
4. If present, run a bounded official dry-run preflight when safe; report installer readiness from exit status only.
5. Always state that runtime activation is confirmed inside the agent by exposed MCP tools.
6. Never parse or rewrite agent MCP config in Doctor.

## Runtime Memory Flow

### Startup and discovery

1. Hub inspects its available tool registry for context/search capabilities.
2. If absent, emit at most one concise fallback note and continue ordinary exploration.
3. If present, load the DiamondBlock skill directly before broad file reads.
4. DiamondBlock uses platform-provided session/project identifiers or identifiers returned/accepted by the MCP schema.
5. If required identifiers cannot be verified, warn and return without fabricating values.
6. Return distilled context to Hub; Hub may invoke again with targeted semantic queries.

### Decision persistence

1. Hub identifies a user-confirmed requirement, accepted spec/ADR decision, or durable project convention.
2. DiamondBlock searches for an existing equivalent memory before writing.
3. Save or update a short non-secret distilled record with project scope and provenance.
4. Do not save raw chat, transient hypotheses, command output, tokens, or source payloads.

### Wrap-up

1. Shipper completes push/PR successfully.
2. Outside AFK, Shipper invokes DiamondBlock with final commit/PR outcome and key decisions; DiamondBlock calls `log_session` and returns to Shipper.
3. In AFK, Shipper returns to Hub; Hub performs the same wrap-up call.
4. Logging/index failure produces a warning and does not alter the successful shipping result.

## State Management

CrewLoop stores no new persistent MCP state. The official DiamondBlock CLI owns its vault and agent MCP configuration. Invocation state is session-local: one availability check result, one fallback warning marker, and verified platform/MCP identifiers.

## Error Handling

- Explicit CLI opt-in plus missing executable: exit 1 before CrewLoop mutation with install hint.
- Unsupported target/preflight non-zero: exit 1 before mutation with official stderr safely summarized.
- Final external install failure: exit 1, identify partial CrewLoop success, never roll back user config blindly.
- Doctor absence/unreadable state: warning, because DiamondBlock is optional.
- MCP startup/search/save/log failure: one warning, return to invoker, continue workflow.
- Output must not print environment values, credentials, vault contents, or raw memory payloads.

## Performance Considerations

Preflight and install run once per explicit command. Runtime searches must be targeted; repeated search is allowed but broad indexing remains manual when missing/stale/large. Subprocess output is bounded before display and tests use fakes rather than real commands.

## Security Considerations

- Use argument arrays with no shell interpolation.
- Never mutate MCP configuration without `--diamondblock`.
- Trust official installer exit status, not arbitrary stdout parsing, for compatibility decisions.
- Backups and user-config preservation remain the official installer's responsibility and must be documented.
- Memory writes require confirmed, distilled, non-secret content.
- Tool availability does not authorize saving; each save intent must still satisfy DiamondBlock policy.

## Parallelization

After shared contracts and wording are accepted, CLI integration and skill/docs lifecycle changes can proceed independently. Final integration must run CLI verification, skill validation, and a cross-file transition-contract check before review.
