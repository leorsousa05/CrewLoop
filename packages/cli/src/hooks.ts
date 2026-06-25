import fs from 'node:fs';
import path from 'node:path';
import type { AgentConfig, HookFormat } from './agents';

export interface HookEntry {
  event: 'before_tool_use' | 'after_tool_use';
  command: string;
}

export interface AgentHookConfigFile {
  path: string;
  format: HookFormat;
  raw: unknown;
}

export interface HookWriterResult {
  agent: string;
  status: 'configured' | 'skipped' | 'unsupported' | 'error';
  configPath?: string;
  backupPath?: string;
  error?: Error;
}

export interface AgentHookConfigWriter {
  readonly agentId: string;
  isApplicable(): boolean;
  readConfig(): AgentHookConfigFile | undefined;
  writeConfig(config: AgentHookConfigFile): void;
  buildDefaultConfig(): AgentHookConfigFile;
  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile;
  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean;
}

function backupPathFor(configPath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${configPath}.crewloop-backup-${timestamp}`;
}

function agentIsInstalled(agent: AgentConfig): boolean {
  return (
    fs.existsSync(agent.skillsDir) ||
    Boolean(
      agent.hooks.supported && agent.hooks.configPath && fs.existsSync(path.dirname(agent.hooks.configPath))
    )
  );
}

/**
 * Minimal TOML writer for Kimi Code's [hooks] table.
 * Preserves comments and other keys outside the [hooks] table.
 */
class KimiHookWriter implements AgentHookConfigWriter {
  readonly agentId = 'kimi';

  constructor(private agent: AgentConfig) {}

  isApplicable(): boolean {
    return agentIsInstalled(this.agent);
  }

  readConfig(): AgentHookConfigFile | undefined {
    const configPath = this.agent.hooks.configPath;
    if (!fs.existsSync(configPath)) {
      return undefined;
    }
    return {
      path: configPath,
      format: 'toml',
      raw: fs.readFileSync(configPath, 'utf8'),
    };
  }

  writeConfig(config: AgentHookConfigFile): void {
    fs.mkdirSync(path.dirname(config.path), { recursive: true });
    fs.writeFileSync(config.path, String(config.raw), 'utf8');
  }

  buildDefaultConfig(): AgentHookConfigFile {
    return {
      path: this.agent.hooks.configPath,
      format: 'toml',
      raw: `[hooks]\nbefore_tool_use = "${this.agent.hooks.beforeToolUseCommand}"\nafter_tool_use = "${this.agent.hooks.afterToolUseCommand}"\n`,
    };
  }

  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile {
    const content = String(config.raw);
    const updated = this.setHookCommand(content, hook.event, hook.command);
    return { ...config, raw: updated };
  }

  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean {
    const content = String(config.raw);
    return this.getHookCommand(content, hook.event) === hook.command;
  }

  private getHookCommand(content: string, event: HookEntry['event']): string | undefined {
    const lines = content.split('\n');
    let inHooksTable = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '[hooks]') {
        inHooksTable = true;
        continue;
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inHooksTable = false;
        continue;
      }
      if (inHooksTable) {
        const match = new RegExp(`^${event}\\s*=\\s*"(.*)"$`).exec(trimmed);
        if (match) {
          return match[1];
        }
      }
    }
    return undefined;
  }

  private setHookCommand(content: string, event: HookEntry['event'], command: string): string {
    const lines = content.split('\n');
    let inHooksTable = false;
    let inserted = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === '[hooks]') {
        inHooksTable = true;
        continue;
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        if (inHooksTable && !inserted) {
          lines.splice(i, 0, `${event} = "${command}"`);
          return lines.join('\n');
        }
        inHooksTable = false;
        continue;
      }
      if (inHooksTable) {
        const match = new RegExp(`^${event}\\s*=\\s*".*"$`).exec(trimmed);
        if (match) {
          lines[i] = `${event} = "${command}"`;
          return lines.join('\n');
        }
      }
    }

    if (inHooksTable) {
      lines.push(`${event} = "${command}"`);
      return lines.join('\n');
    }

    return content + `\n[hooks]\n${event} = "${command}"\n`;
  }
}

interface JsonHooksShape {
  hooks?: {
    before_tool_use?: { command: string; args?: string[] } | string;
    after_tool_use?: { command: string; args?: string[] } | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function jsonCommandMatches(
  existing: { command: string; args?: string[] } | string | undefined,
  expectedCommand: string
): boolean {
  if (typeof existing === 'string') {
    return existing === expectedCommand;
  }
  if (existing && typeof existing === 'object') {
    const full = [existing.command, ...(existing.args || [])].join(' ');
    return full === expectedCommand;
  }
  return false;
}

function setJsonCommand(
  config: JsonHooksShape,
  event: HookEntry['event'],
  command: string
): void {
  if (!config.hooks) {
    config.hooks = {};
  }
  config.hooks[event] = command;
}

abstract class JsonHookWriter implements AgentHookConfigWriter {
  abstract readonly agentId: string;

  constructor(private agent: AgentConfig) {}

  isApplicable(): boolean {
    return agentIsInstalled(this.agent);
  }

  readConfig(): AgentHookConfigFile | undefined {
    const configPath = this.agent.hooks.configPath;
    if (!fs.existsSync(configPath)) {
      return undefined;
    }
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { path: configPath, format: 'json', raw };
    } catch (cause) {
      throw new Error(
        `Malformed JSON config at ${configPath}: ${cause instanceof Error ? cause.message : String(cause)}`
      );
    }
  }

  writeConfig(config: AgentHookConfigFile): void {
    fs.mkdirSync(path.dirname(config.path), { recursive: true });
    fs.writeFileSync(config.path, JSON.stringify(config.raw, null, 2) + '\n', 'utf8');
  }

  buildDefaultConfig(): AgentHookConfigFile {
    return {
      path: this.agent.hooks.configPath,
      format: 'json',
      raw: {
        hooks: {
          before_tool_use: this.agent.hooks.beforeToolUseCommand,
          after_tool_use: this.agent.hooks.afterToolUseCommand,
        },
      },
    };
  }

  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile {
    const clone = JSON.parse(JSON.stringify(config.raw)) as JsonHooksShape;
    setJsonCommand(clone, hook.event, hook.command);
    return { ...config, raw: clone };
  }

  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean {
    const raw = config.raw as JsonHooksShape;
    const existing = raw.hooks?.[hook.event];
    return jsonCommandMatches(existing, hook.command);
  }
}

class CodexHookWriter extends JsonHookWriter {
  readonly agentId = 'codex';
}

class ClaudeHookWriter extends JsonHookWriter {
  readonly agentId = 'claude';
}

class AgyHookWriter extends JsonHookWriter {
  readonly agentId = 'agy';
}

function createWriter(agent: AgentConfig): AgentHookConfigWriter | undefined {
  if (!agent.hooks.supported) {
    return undefined;
  }
  switch (agent.id) {
    case 'kimi':
      return new KimiHookWriter(agent);
    case 'codex':
      return new CodexHookWriter(agent);
    case 'claude':
      return new ClaudeHookWriter(agent);
    case 'agy':
      return new AgyHookWriter(agent);
    default:
      return undefined;
  }
}

export function installHooksForAgent(
  agent: AgentConfig,
  options: { dryRun?: boolean; backup?: boolean } = {}
): HookWriterResult {
  if (!agent.hooks.supported) {
    return { agent: agent.id, status: 'unsupported' };
  }

  const writer = createWriter(agent);
  if (!writer) {
    return {
      agent: agent.id,
      status: 'error',
      error: new Error(`No hook writer available for agent "${agent.id}"`),
    };
  }

  if (!writer.isApplicable()) {
    return { agent: agent.id, status: 'skipped' };
  }

  try {
    let config = writer.readConfig();
    const backupPath = config && options.backup ? backupPathFor(config.path) : undefined;

    const beforeHook: HookEntry = {
      event: 'before_tool_use',
      command: agent.hooks.beforeToolUseCommand || `crewloop-shim ${agent.id}`,
    };
    const afterHook: HookEntry = {
      event: 'after_tool_use',
      command: agent.hooks.afterToolUseCommand || `crewloop-shim ${agent.id}`,
    };

    if (!config) {
      config = writer.buildDefaultConfig();
    } else {
      if (!writer.hasHook(config, beforeHook)) {
        config = writer.addHook(config, beforeHook);
      }
      if (!writer.hasHook(config, afterHook)) {
        config = writer.addHook(config, afterHook);
      }
    }

    if (options.dryRun) {
      return { agent: agent.id, status: 'configured', configPath: config.path };
    }

    if (backupPath && fs.existsSync(config.path)) {
      fs.copyFileSync(config.path, backupPath);
    }

    writer.writeConfig(config);

    return {
      agent: agent.id,
      status: 'configured',
      configPath: config.path,
      backupPath,
    };
  } catch (error) {
    return {
      agent: agent.id,
      status: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export interface InstallHooksOptions {
  dryRun?: boolean;
  backup?: boolean;
  agents?: string[];
}

export function installHooks(options: InstallHooksOptions = {}): HookWriterResult[] {
  const { listSupportedAgents } = require('./agents');
  const agents = listSupportedAgents() as AgentConfig[];

  const filtered = options.agents?.length
    ? agents.filter((a) => options.agents!.includes(a.id))
    : agents;

  return filtered.map((agent) =>
    installHooksForAgent(agent, { dryRun: options.dryRun, backup: options.backup })
  );
}
