# Design: Codex Windows sandbox health checks

## Overview

Add a small health-check layer to the CLI that detects known environment issues and prints actionable guidance. The first check targets the Codex Windows sandbox helper discovery problem.

## Proposed directory & file structure

```
packages/cli/
├── src/
│   ├── cli.ts              (Modified: add doctor command)
│   ├── health.ts           (New: agent health-check functions)
│   ├── hooks.ts            (Modified: expose minimal agent metadata for checks)
│   └── tests/
│       ├── cli.test.ts     (Modified: test doctor command parsing/output)
│       └── health.test.ts  (New: test Windows Codex detection)
specs/
├── changes/
│   └── 011-codex-windows-sandbox-health-check/
│       ├── .spec.yaml      (Active)
│       ├── proposal.md
│       ├── design.md       (This file)
│       ├── specs/
│       │   └── cli/
│       │       └── spec.md
│       └── tasks.md
└── living/
    └── cli/
        └── spec.md         (Updated with known-issue note)
```

## Code architecture & design patterns

- **Strategy pattern:** each agent can register an optional `healthCheck` function. This keeps agent-specific knowledge inside the agent definition.
- **Read-only diagnostics:** health checks never mutate configs, registry, or environment.
- **Progressive disclosure:** `crewloop doctor` shows all checks; `crewloop install` shows only warnings for agents that were just configured.

## Contracts

```typescript
export interface HealthCheckResult {
  agent: string;
  check: string;
  severity: 'ok' | 'warning' | 'error';
  message: string;
  docUrl?: string;
}

export interface AgentHealthCheck {
  (agent: AgentConfig): HealthCheckResult[];
}

export function checkAgentHealth(agent: AgentConfig): HealthCheckResult[];
export function checkAllAgentsHealth(): HealthCheckResult[];
```

## Codex Windows sandbox check

On `process.platform === 'win32'` and when the Codex config path exists:

1. Resolve the active Codex package directory. Candidate paths:
   - `%USERPROFILE%\.codex\packages\standalone\current`
   - `%USERPROFILE%\.codex\packages\standalone\releases\<latest>`
2. Verify that `codex-resources\codex-windows-sandbox-setup.exe` exists under that directory.
3. Verify that the directory containing that helper is on the current `PATH`, or that the resolved `codex.exe` is the package binary rather than the launcher in `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin\codex.exe`.
4. If not, emit a warning with the workaround:
   - Launch Codex from `%USERPROFILE%\.codex\packages\standalone\current\bin\codex.exe`, or
   - Prepend `%USERPROFILE%\.codex\packages\standalone\current\codex-resources` to `PATH`.

## CLI behavior

```bash
$ crewloop doctor
Agent hook health:
  ✓ kimi (ok)
  ✗ codex (warning): Codex Windows sandbox helper not on PATH.
      Workaround: launch Codex from %USERPROFILE%\.codex\packages\standalone\current\bin\codex.exe
      Docs: https://github.com/openai/codex/issues/28457
  ✓ claude (ok)
  - cursor (unsupported)
```

After `crewloop install`, if any configured agent has a warning, print a single consolidated warning block.

## Testing plan

- Unit tests for `health.ts` using a fake `PATH` and temp directories.
- Tests for the `doctor` command parsing in `cli.test.ts`.
- Tests that `install` does not break and shows warnings only when checks fail.

## Risk assessment

- **Risk:** false positives if Codex fixes the bug and our detection becomes outdated.
- **Mitigation:** keep the check conservative — only warn when the helper exists in the package directory but is missing from `PATH`/launcher context.
