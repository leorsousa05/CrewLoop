# Design: Agent-Specific Guard Tool & Command Matching

## Overview

Refactor and strengthen the payload normalization logic (`normalizePayload`) and command/path extraction logic (`extractCommand`, `extractPaths`) in `packages/cli/src/guard/` to seamlessly handle AGY tool payloads (e.g., `run_command` with `CommandLine`) as well as other agent payloads.

## Interfaces & Logic Changes

### 1. Payload Normalization (`packages/cli/src/guard/normalize.ts`)

Update `normalizePayload` and `extractCommand`:
- Ensure AGY `toolCall` parsing handles `CommandLine`, `commandLine`, `command`, `cmd`, `script`, and `args` array.
- Support path fields `AbsolutePath`, `TargetFile`, `path`, `file`, `filepath`, `target_file`, `absolute_path`.

```typescript
export function extractCommand(input: Record<string, unknown> | undefined): string | undefined {
  if (!input) return undefined;
  if (typeof input.command === 'string') return input.command;
  if (typeof input.CommandLine === 'string') return input.CommandLine;
  if (typeof input.commandLine === 'string') return input.commandLine;
  if (typeof input.cmd === 'string') return input.cmd;
  if (typeof input.script === 'string') return input.script;
  if (Array.isArray(input.args) && typeof input.args[0] === 'string') {
    return input.args.join(' ');
  }
  return undefined;
}
```

### 2. Rule Evaluation (`packages/cli/src/guard/evaluator.ts`)

In `ruleMatches`:
- Evaluate `rule.tools` against both raw tool name (e.g. `run_command`) and normalized tool aliases.

### Edge Case Matrix

| Agent | Tool Name | Payload Structure | Extracted Tool / Command |
|-------|-----------|-------------------|--------------------------|
| AGY | `run_command` | `{ toolCall: { name: 'run_command', args: { CommandLine: 'git push' } } }` | `run_command` / `'git push'` |
| AGY | `view_file` | `{ toolCall: { name: 'view_file', args: { AbsolutePath: '/path/to/file' } } }` | `view_file` / path: `'/path/to/file'` |
| Kimi | `bash` | `{ tool_name: 'bash', tool_input: { command: 'git push' } }` | `bash` / `'git push'` |
| Claude | `bash` | `{ tool_name: 'bash', tool_input: { command: 'git push' } }` | `bash` / `'git push'` |
