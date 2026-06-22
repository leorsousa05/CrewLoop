import path from 'node:path';
import os from 'node:os';

export interface AgentConfig {
  id: string;
  skillsDir: string;
}

const SUPPORTED_AGENTS: AgentConfig[] = [
  { id: 'kimi', skillsDir: path.join(os.homedir(), '.agents', 'skills') },
  { id: 'claude', skillsDir: path.join(os.homedir(), '.claude', 'skills') },
  { id: 'codex', skillsDir: path.join(os.homedir(), '.codex', 'skills') },
  { id: 'cursor', skillsDir: path.join(os.homedir(), '.cursor', 'rules') },
  { id: 'windsurf', skillsDir: path.join(os.homedir(), '.windsurf', 'rules') },
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
