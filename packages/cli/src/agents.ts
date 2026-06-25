import path from 'node:path';
import os from 'node:os';

export type HookFormat = 'toml' | 'json' | 'none';

export interface AgentHookConfig {
  supported: boolean;
  configPath: string;
  fallbackConfigPath?: string;
  format: HookFormat;
  beforeToolUseCommand?: string;
  afterToolUseCommand?: string;
  beforeToolUseEventName?: string;
  afterToolUseEventName?: string;
  legacyEventNames?: string[];
}

export interface AgentConfig {
  id: string;
  skillsDir: string;
  hooks: AgentHookConfig;
}

const SUPPORTED_AGENTS: AgentConfig[] = [
  {
    id: 'kimi',
    skillsDir: path.join(os.homedir(), '.agents', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.kimi-code', 'config.toml'),
      format: 'toml',
      beforeToolUseCommand: 'crewloop-shim kimi --default-skill orchestrator',
      afterToolUseCommand: 'crewloop-shim kimi --default-skill orchestrator',
      beforeToolUseEventName: 'PreToolUse',
      afterToolUseEventName: 'PostToolUse',
      legacyEventNames: ['before_tool_use', 'after_tool_use'],
    },
  },
  {
    id: 'claude',
    skillsDir: path.join(os.homedir(), '.claude', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.claude', 'config.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim claude --default-skill orchestrator',
      afterToolUseCommand: 'crewloop-shim claude --default-skill orchestrator',
      beforeToolUseEventName: 'before_tool_use',
      afterToolUseEventName: 'after_tool_use',
    },
  },
  {
    id: 'codex',
    skillsDir: path.join(os.homedir(), '.codex', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.codex', 'hooks.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      afterToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      beforeToolUseEventName: 'PreToolUse',
      afterToolUseEventName: 'PostToolUse',
      legacyEventNames: ['before_tool_use', 'after_tool_use'],
    },
  },
  {
    id: 'agy',
    skillsDir: path.join(os.homedir(), '.agy', 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.homedir(), '.gemini', 'config', 'hooks.json'),
      fallbackConfigPath: path.join(os.homedir(), '.gemini', 'antigravity-cli', 'hooks.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
      afterToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
      beforeToolUseEventName: 'PreToolUse',
      afterToolUseEventName: 'PostToolUse',
    },
  },
  {
    id: 'cursor',
    skillsDir: path.join(os.homedir(), '.cursor', 'rules'),
    hooks: {
      supported: false,
      configPath: '',
      format: 'none',
    },
  },
  {
    id: 'windsurf',
    skillsDir: path.join(os.homedir(), '.windsurf', 'rules'),
    hooks: {
      supported: false,
      configPath: '',
      format: 'none',
    },
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
