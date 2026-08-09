# Design: Enable Blocking Guard Capability for AGY

## Overview

Modify `SUPPORTED_AGENTS` in `packages/cli/src/agents.ts` so AGY has `guardCapable: 'block'`.

```typescript
  {
    id: 'agy',
    skillsDir: path.join(os.homedir(), '.gemini', 'config', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.gemini', 'config', 'hooks.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim agy --default-skill crewloop-plan --event-type PreToolUse',
      afterToolUseCommand: 'crewloop-shim agy --default-skill crewloop-plan --event-type PostToolUse',
      lifecycleEvents: ['PreInvocation', 'Stop'],
    },
    guardCapable: 'block',
  },
```
