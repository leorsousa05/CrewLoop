# Design: Kimi hooks legacy-table cleanup

## Overview

Make the removal of the legacy Kimi `[hooks]` table an explicit step in the hook-installation flow. This guarantees that upgrading users end up with a clean config that contains only the documented `[[hooks]]` array-of-tables, even when the new hooks are already present.

## Proposed directory & file structure

```
packages/cli/
├── src/
│   ├── hooks.ts              (Modified)
│   └── tests/
│       └── hooks.test.ts     (Modified)
specs/
├── changes/
│   └── 010-cli-kimi-hooks-array-table-format/
│       ├── .spec.yaml        (Updated at completion)
│       ├── proposal.md       (Updated)
│       ├── design.md         (New)
│       └── tasks.md          (Updated)
└── living/
    └── cli/
        └── spec.md           (Updated if needed)
```

## Code architecture & design patterns

- **Strategy pattern:** each agent has its own `AgentHookConfigWriter`. The new `removeLegacyHooks` method lets a writer encapsulate its own cleanup rules.
- **Explicit cleanup step:** the installer (`installHooksForAgent`) now calls cleanup before idempotency checks, making side effects visible and deterministic.

## Contracts

```typescript
export interface AgentHookConfigWriter {
  readonly agentId: string;
  isApplicable(): boolean;
  readConfig(): AgentHookConfigFile | undefined;
  writeConfig(config: AgentHookConfigFile): void;
  buildDefaultConfig(): AgentHookConfigFile;
  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile;
  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean;
  removeLegacyHooks?(config: AgentHookConfigFile): AgentHookConfigFile;
}
```

`removeLegacyHooks` is optional. For Kimi it removes the old `[hooks]` table entries defined by `agent.hooks.legacyEventNames`. For JSON writers the existing object-level cleanup remains sufficient, so the method can be omitted.

## Data flow

1. `installHooksForAgent` reads the existing config (or builds a default one).
2. If `agent.hooks.legacyEventNames` is set and the writer exposes `removeLegacyHooks`, call it.
3. Compare the cleaned raw content with the original; if it changed, set `needsWrite = true`.
4. Check `hasHook` for the current before/after hooks.
5. Call `addHook` only for hooks that are missing.
6. Write the config if `needsWrite` is true.

## Edge cases

- **Legacy table only:** cleaned config has no hooks; both new blocks are appended.
- **Legacy + new blocks:** legacy table is removed; `hasHook` prevents duplicates.
- **Clean config:** `removeLegacyHooks` is a no-op; `hasHook` short-circuits writes.
- **Non-legacy keys inside `[hooks]`:** preserved by only deleting lines that match legacy names.
- **Comments outside `[hooks]`:** preserved because the writer rewrites only the `[hooks]` section.

## Testing plan

- Unit tests in `packages/cli/src/tests/hooks.test.ts` covering the edge cases above.
- Manual verification against the real `~/.kimi-code/config.toml` after global reinstall.
