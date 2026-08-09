import path from 'node:path';
import os from 'node:os';
import type { AgentGuardCapability } from './guard/guard.types';

export type HookFormat = 'toml' | 'json' | 'plugin' | 'none';

export type AgentLifecycleEvent = 'SessionStart' | 'SessionEnd' | 'Stop' | 'PreInvocation';

export interface AgentHookConfig {
  supported: boolean;
  configPath: string;
  format: HookFormat;
  beforeToolUseCommand?: string;
  afterToolUseCommand?: string;
  /** Lifecycle hook events natively emitted by the agent (session start/end). */
  lifecycleEvents?: AgentLifecycleEvent[];
}

export interface AgentConfig {
  id: string;
  skillsDir: string;
  hooks: AgentHookConfig;
  guardCapable: AgentGuardCapability;
}

const SUPPORTED_AGENTS: AgentConfig[] = [
  // The installed skill directory is `crewloop-plan` and the logical skill identity is `crewloop:plan`.
  // The dashboard shim maps the directory name to the namespaced display name.
  {
    id: 'kimi',
    skillsDir: path.join(os.homedir(), '.agents', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.kimi-code', 'config.toml'),
      format: 'toml',
      beforeToolUseCommand: 'crewloop-shim kimi --default-skill crewloop-plan',
      afterToolUseCommand: 'crewloop-shim kimi --default-skill crewloop-plan',
      lifecycleEvents: ['SessionStart', 'SessionEnd', 'Stop'],
    },
    guardCapable: 'block',
  },
  {
    id: 'claude',
    skillsDir: path.join(os.homedir(), '.claude', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.claude', 'settings.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim claude --default-skill crewloop-plan',
      afterToolUseCommand: 'crewloop-shim claude --default-skill crewloop-plan',
      lifecycleEvents: ['SessionStart', 'SessionEnd'],
    },
    guardCapable: 'audit',
  },
  {
    id: 'codex',
    skillsDir: path.join(os.homedir(), '.codex', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.codex', 'hooks.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim codex --default-skill crewloop-plan',
      afterToolUseCommand: 'crewloop-shim codex --default-skill crewloop-plan',
      lifecycleEvents: ['SessionStart', 'Stop'],
    },
    guardCapable: 'audit',
  },
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
  {
    id: 'opencode',
    skillsDir: path.join(os.homedir(), '.config', 'opencode', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.config', 'opencode', 'plugins', 'crewloop.js'),
      format: 'plugin',
      beforeToolUseCommand: 'crewloop-shim opencode --default-skill crewloop-plan',
      afterToolUseCommand: 'crewloop-shim opencode --default-skill crewloop-plan',
    },
    guardCapable: 'block',
  },
  {
    id: 'cursor',
    skillsDir: path.join(os.homedir(), '.cursor', 'rules'),
    hooks: {
      supported: false,
      configPath: '',
      format: 'none',
    },
    guardCapable: false,
  },
  {
    id: 'windsurf',
    skillsDir: path.join(os.homedir(), '.windsurf', 'rules'),
    hooks: {
      supported: false,
      configPath: '',
      format: 'none',
    },
    guardCapable: false,
  },
];

export function listSupportedAgents(): AgentConfig[] {
  return SUPPORTED_AGENTS.map((a) => ({ ...a }));
}

export function resolveAgentDir(agentId?: string): string {
  if (!agentId) {
    return SUPPORTED_AGENTS[0].skillsDir;
  }

  const agent = SUPPORTED_AGENTS.find((a) => a.id === agentId);
  if (!agent) {
    const known = SUPPORTED_AGENTS.map((a) => a.id).join(', ');
    throw new Error(`Unknown agent "${agentId}". Supported agents: ${known}`);
  }

  return agent.skillsDir;
}
