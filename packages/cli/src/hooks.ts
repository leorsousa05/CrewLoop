import fs from 'node:fs';
import path from 'node:path';
import type { AgentConfig, HookFormat } from './agents';

export interface HookEntry {
  event: string;
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
  removeLegacyHooks?(config: AgentHookConfigFile): AgentHookConfigFile;
}

function backupPathFor(configPath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${configPath}.crewloop-backup-${timestamp}`;
}

function configRawChanged(a: AgentHookConfigFile, b: AgentHookConfigFile): boolean {
  if (typeof a.raw === 'string' && typeof b.raw === 'string') {
    return a.raw !== b.raw;
  }
  return JSON.stringify(a.raw) !== JSON.stringify(b.raw);
}

function agentIsSupported(agent: AgentConfig): boolean {
  return agent.hooks.supported;
}

/**
 * Minimal TOML writer for Kimi Code's [[hooks]] array-of-tables.
 * Preserves comments and other keys outside [[hooks]] blocks.
 */
class KimiHookWriter implements AgentHookConfigWriter {
  readonly agentId = 'kimi';

  constructor(private agent: AgentConfig) {}

  isApplicable(): boolean {
    return agentIsSupported(this.agent);
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
    const beforeEvent = this.agent.hooks.beforeToolUseEventName || 'PreToolUse';
    const afterEvent = this.agent.hooks.afterToolUseEventName || 'PostToolUse';
    return {
      path: this.agent.hooks.configPath,
      format: 'toml',
      raw: `[[hooks]]\nevent = "${beforeEvent}"\ncommand = "${this.agent.hooks.beforeToolUseCommand}"\n\n[[hooks]]\nevent = "${afterEvent}"\ncommand = "${this.agent.hooks.afterToolUseCommand}"\n`,
    };
  }

  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile {
    const content = this.removeLegacyHookTable(String(config.raw));
    if (this.hasHook({ ...config, raw: content }, hook)) {
      return { ...config, raw: content };
    }
    return { ...config, raw: content + `\n[[hooks]]\nevent = "${hook.event}"\ncommand = "${hook.command}"\n` };
  }

  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean {
    const blocks = this.parseHookBlocks(String(config.raw));
    return blocks.some(
      (block) => block.event === hook.event && block.command === hook.command
    );
  }

  removeLegacyHooks(config: AgentHookConfigFile): AgentHookConfigFile {
    return { ...config, raw: this.removeLegacyHookTable(String(config.raw)) };
  }

  private removeLegacyHookTable(content: string): string {
    const legacyNames = this.agent.hooks.legacyEventNames;
    if (!legacyNames || legacyNames.length === 0) {
      return content;
    }
    const legacyRegex = new RegExp(`^(${legacyNames.join('|')})\\s*=`);
    const lines = content.split('\n');
    const result: string[] = [];
    let inHooksTable = false;
    const hooksBuffer: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '[hooks]') {
        inHooksTable = true;
        hooksBuffer.length = 0;
        continue;
      }
      if (inHooksTable) {
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          if (hooksBuffer.length > 0) {
            result.push('[hooks]');
            result.push(...hooksBuffer);
          }
          inHooksTable = false;
          result.push(line);
          continue;
        }
        if (trimmed === '') {
          continue;
        }
        if (!legacyRegex.test(trimmed)) {
          hooksBuffer.push(line);
        }
        continue;
      }
      result.push(line);
    }

    if (inHooksTable && hooksBuffer.length > 0) {
      result.push('[hooks]');
      result.push(...hooksBuffer);
    }

    return result.join('\n');
  }

  private parseHookBlocks(content: string): Array<{ event: string; command: string }> {
    const blocks: Array<{ event: string; command: string }> = [];
    const lines = content.split('\n');
    let currentEvent: string | undefined;
    let currentCommand: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '[[hooks]]') {
        if (currentEvent && currentCommand) {
          blocks.push({ event: currentEvent, command: currentCommand });
        }
        currentEvent = undefined;
        currentCommand = undefined;
        continue;
      }
      const eventMatch = /^event\s*=\s*"(.*)"$/.exec(trimmed);
      if (eventMatch) {
        currentEvent = eventMatch[1];
        continue;
      }
      const commandMatch = /^command\s*=\s*"(.*)"$/.exec(trimmed);
      if (commandMatch) {
        currentCommand = commandMatch[1];
      }
    }

    if (currentEvent && currentCommand) {
      blocks.push({ event: currentEvent, command: currentCommand });
    }

    return blocks;
  }
}

interface JsonHooksShape {
  hooks?: Record<string, unknown>;
  [key: string]: unknown;
}

function commandToObject(command: string): { command: string; args: string[] } {
  const parts = command.trim().split(/\s+/).filter(Boolean);
  return { command: parts[0] || '', args: parts.slice(1) };
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
  config.hooks[event] = commandToObject(command);
}

abstract class JsonHookWriter implements AgentHookConfigWriter {
  abstract readonly agentId: string;

  constructor(protected agent: AgentConfig) {}

  isApplicable(): boolean {
    return agentIsSupported(this.agent);
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
    const beforeEvent = this.agent.hooks.beforeToolUseEventName || 'before_tool_use';
    const afterEvent = this.agent.hooks.afterToolUseEventName || 'after_tool_use';
    return {
      path: this.agent.hooks.configPath,
      format: 'json',
      raw: {
        hooks: {
          [beforeEvent]: commandToObject(
            this.agent.hooks.beforeToolUseCommand || `crewloop-shim ${this.agent.id}`
          ),
          [afterEvent]: commandToObject(
            this.agent.hooks.afterToolUseCommand || `crewloop-shim ${this.agent.id}`
          ),
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
    // Match only object-formatted entries; string entries are upgraded on write.
    return (
      typeof existing === 'object' &&
      existing !== null &&
      !Array.isArray(existing) &&
      jsonCommandMatches(existing as { command: string; args?: string[] } | string, hook.command)
    );
  }
}

interface CodexHookCommand {
  type: 'command';
  command: string;
  args?: string[];
  timeout?: number;
  statusMessage?: string;
}

interface CodexMatcherGroup {
  matcher?: string;
  if?: string;
  hooks: CodexHookCommand[];
}

interface CodexHooksConfig {
  hooks?: Record<string, CodexMatcherGroup[]>;
  [key: string]: unknown;
}

function commandToCodexCommand(command: string): CodexHookCommand {
  const parts = command.trim().split(/\s+/).filter(Boolean);
  return {
    type: 'command',
    command: parts[0] || '',
    args: parts.slice(1),
  };
}

function codexCommandMatches(a: CodexHookCommand, b: CodexHookCommand): boolean {
  if (a.command !== b.command) return false;
  const aArgs = a.args || [];
  const bArgs = b.args || [];
  if (aArgs.length !== bArgs.length) return false;
  return aArgs.every((arg, i) => arg === bArgs[i]);
}

class CodexHookWriter extends JsonHookWriter {
  readonly agentId: string = 'codex';

  buildDefaultConfig(): AgentHookConfigFile {
    const beforeEvent = this.agent.hooks.beforeToolUseEventName || 'before_tool_use';
    const afterEvent = this.agent.hooks.afterToolUseEventName || 'after_tool_use';
    return {
      path: this.agent.hooks.configPath,
      format: 'json',
      raw: {
        hooks: {
          [beforeEvent]: [
            {
              hooks: [
                commandToCodexCommand(
                  this.agent.hooks.beforeToolUseCommand || `crewloop-shim ${this.agent.id}`
                ),
              ],
            },
          ],
          [afterEvent]: [
            {
              hooks: [
                commandToCodexCommand(
                  this.agent.hooks.afterToolUseCommand || `crewloop-shim ${this.agent.id}`
                ),
              ],
            },
          ],
        },
      },
    };
  }

  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile {
    const clone = JSON.parse(JSON.stringify(config.raw)) as CodexHooksConfig;
    if (!clone.hooks) {
      clone.hooks = {};
    }
    const groups = clone.hooks[hook.event];
    const expected = commandToCodexCommand(hook.command);

    if (!Array.isArray(groups)) {
      clone.hooks[hook.event] = [{ hooks: [expected] }];
      return { ...config, raw: clone };
    }

    for (const group of groups) {
      if (group.hooks.some((cmd) => codexCommandMatches(cmd, expected))) {
        return { ...config, raw: clone };
      }
    }

    groups.push({ hooks: [expected] });
    return { ...config, raw: clone };
  }

  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean {
    const raw = config.raw as CodexHooksConfig;
    const groups = raw.hooks?.[hook.event];
    if (!Array.isArray(groups)) {
      return false;
    }
    const expected = commandToCodexCommand(hook.command);
    return groups.some((group) => group.hooks.some((cmd) => codexCommandMatches(cmd, expected)));
  }
}

class ClaudeHookWriter extends JsonHookWriter {
  readonly agentId = 'claude';
}

function parseShimCommand(command: string): { node?: string; shim?: string; args: string[] } | undefined {
  const normalized = normalizePathSeparators(command);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  let shimIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    const unquoted = tokens[i].replace(/^["']|["']$/g, '');
    if (/crewloop-shim(\.js)?$/i.test(unquoted)) {
      shimIndex = i;
      break;
    }
  }
  if (shimIndex === -1) return undefined;
  return {
    node: shimIndex > 0 ? tokens[0] : undefined,
    shim: tokens[shimIndex],
    args: tokens.slice(shimIndex + 1),
  };
}

function resolveShimPath(command: string): string | undefined {
  const parsed = parseShimCommand(command);
  if (!parsed?.shim) return undefined;
  const unquoted = parsed.shim.replace(/^["']|["']$/g, '');
  try {
    return normalizePathSeparators(fs.realpathSync(unquoted));
  } catch {
    return normalizePathSeparators(unquoted);
  }
}

function commandMatchesIntent(a: string, b: string): boolean {
  const parsedA = parseShimCommand(a);
  const parsedB = parseShimCommand(b);
  if (!parsedA || !parsedB) return false;
  const realA = resolveShimPath(a);
  const realB = resolveShimPath(b);
  if (!realA || !realB || realA !== realB) return false;
  return JSON.stringify(parsedA.args) === JSON.stringify(parsedB.args);
}

interface AgyHookCommand {
  type: 'command';
  command: string;
  timeout?: number;
}

interface AgyMatcherGroup {
  matcher?: string;
  hooks: AgyHookCommand[];
}

interface AgyHooksConfig {
  hooks?: Record<string, AgyMatcherGroup[]>;
  [key: string]: unknown;
}

function quoteArg(arg: string): string {
  return arg.includes(' ') ? `"${arg}"` : arg;
}

function resolveShimScriptPath(): string {
  // In a global install __dirname points to .../@archznn/crewloop-skills/packages/cli/dist.
  // The shim script lives in .../@archznn/crewloop-skills/servers/dashboard/bin.
  return path.resolve(__dirname, '..', '..', '..', 'servers', 'dashboard', 'bin', 'crewloop-shim.js');
}

function normalizePathSeparators(arg: string): string {
  return arg.replace(/\\/g, '/');
}

function buildAgyShimCommand(agentId: string, eventType: 'tool_start' | 'tool_end'): string {
  const nodePath = quoteArg(normalizePathSeparators(process.execPath));
  const shimPath = quoteArg(normalizePathSeparators(resolveShimScriptPath()));
  return `${nodePath} ${shimPath} ${agentId} --default-skill orchestrator --event-type ${eventType}`;
}

class AgyHookWriter extends JsonHookWriter {
  readonly agentId = 'agy';

  private expectedCommand(event: string): string {
    const beforeEvent = this.agent.hooks.beforeToolUseEventName || 'PreToolUse';
    const afterEvent = this.agent.hooks.afterToolUseEventName || 'PostToolUse';
    if (event === beforeEvent) {
      return buildAgyShimCommand(this.agent.id, 'tool_start');
    }
    if (event === afterEvent) {
      return buildAgyShimCommand(this.agent.id, 'tool_end');
    }
    return '';
  }

  buildDefaultConfig(): AgentHookConfigFile {
    const beforeEvent = this.agent.hooks.beforeToolUseEventName || 'PreToolUse';
    const afterEvent = this.agent.hooks.afterToolUseEventName || 'PostToolUse';

    return {
      path: this.agent.hooks.configPath,
      format: 'json',
      raw: {
        hooks: {
          [beforeEvent]: [
            {
              matcher: '*',
              hooks: [{ type: 'command', command: this.expectedCommand(beforeEvent), timeout: 10 }],
            },
          ],
          [afterEvent]: [
            {
              matcher: '*',
              hooks: [{ type: 'command', command: this.expectedCommand(afterEvent), timeout: 10 }],
            },
          ],
        },
      },
    };
  }

  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile {
    const expected = this.expectedCommand(hook.event);
    const expectedCmd: AgyHookCommand = {
      type: 'command',
      command: expected,
      timeout: 10,
    };
    const clone = JSON.parse(JSON.stringify(config.raw)) as AgyHooksConfig;
    if (!clone.hooks) {
      clone.hooks = {};
    }
    const groups = clone.hooks[hook.event];
    if (!Array.isArray(groups)) {
      clone.hooks[hook.event] = [{ matcher: '*', hooks: [expectedCmd] }];
      return { ...config, raw: clone };
    }

    const survivingGroups = groups
      .map((group) => ({
        ...group,
        hooks: group.hooks.filter(
          (cmd) => !commandMatchesIntent(cmd.command, expected)
        ),
      }))
      .filter((group) => group.hooks.length > 0);

    if (survivingGroups.length > 0) {
      survivingGroups[0].hooks.push(expectedCmd);
    } else {
      survivingGroups.push({ matcher: '*', hooks: [expectedCmd] });
    }

    clone.hooks[hook.event] = survivingGroups;
    return { ...config, raw: clone };
  }

  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean {
    const expected = normalizePathSeparators(this.expectedCommand(hook.event));
    const raw = config.raw as AgyHooksConfig;
    const groups = raw.hooks?.[hook.event];
    if (!Array.isArray(groups)) {
      return false;
    }
    const entries = groups.flatMap((group) => group.hooks);
    const shimEntries = entries.filter((cmd) =>
      commandMatchesIntent(cmd.command, expected)
    );
    const exact = shimEntries.some(
      (cmd) => normalizePathSeparators(cmd.command) === expected
    );
    const hasEmptyGroups = groups.some((group) => group.hooks.length === 0);
    return exact && shimEntries.length === 1 && !hasEmptyGroups;
  }
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

    const beforeEvent = agent.hooks.beforeToolUseEventName || 'before_tool_use';
    const afterEvent = agent.hooks.afterToolUseEventName || 'after_tool_use';

    const beforeHook: HookEntry = {
      event: beforeEvent,
      command: agent.hooks.beforeToolUseCommand || `crewloop-shim ${agent.id}`,
    };
    const afterHook: HookEntry = {
      event: afterEvent,
      command: agent.hooks.afterToolUseCommand || `crewloop-shim ${agent.id}`,
    };

    let needsWrite = false;

    if (!config) {
      config = writer.buildDefaultConfig();
      needsWrite = true;
    } else {
      if (agent.hooks.legacyEventNames && writer.removeLegacyHooks) {
        const cleaned = writer.removeLegacyHooks(config);
        if (configRawChanged(cleaned, config)) {
          needsWrite = true;
        }
        config = cleaned;
      }

      if (!writer.hasHook(config, beforeHook)) {
        config = writer.addHook(config, beforeHook);
        needsWrite = true;
      }
      if (!writer.hasHook(config, afterHook)) {
        config = writer.addHook(config, afterHook);
        needsWrite = true;
      }
    }

    if (agent.hooks.legacyEventNames && config) {
      const raw = config.raw as JsonHooksShape;
      if (raw.hooks) {
        for (const legacy of agent.hooks.legacyEventNames) {
          if (legacy in raw.hooks) {
            delete raw.hooks[legacy];
            needsWrite = true;
          }
        }
      }
    }

    if (options.dryRun) {
      return { agent: agent.id, status: 'configured', configPath: config.path };
    }

    const backupPath = needsWrite && config && options.backup ? backupPathFor(config.path) : undefined;
    let backupCreated = false;

    if (backupPath && fs.existsSync(config.path)) {
      fs.copyFileSync(config.path, backupPath);
      backupCreated = true;
    }

    if (needsWrite) {
      writer.writeConfig(config);
    }

    // Mirror to the agent's fallback config path if one is defined (e.g. AGY
    // may read hooks from an alternate location due to a known path bug).
    const fallbackPath = agent.hooks.fallbackConfigPath;
    if (fallbackPath && fallbackPath !== config.path && !options.dryRun) {
      let fallbackNeedsWrite = false;
      let fallbackRaw: unknown;
      if (fs.existsSync(fallbackPath)) {
        try {
          fallbackRaw = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        } catch {
          fallbackRaw = {};
          fallbackNeedsWrite = true;
        }
      } else {
        fallbackRaw = {};
        fallbackNeedsWrite = true;
      }
      if (JSON.stringify(fallbackRaw) !== JSON.stringify(config.raw)) {
        fallbackNeedsWrite = true;
      }
      if (fallbackNeedsWrite) {
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(
          fallbackPath,
          JSON.stringify(config.raw, null, 2) + '\n',
          'utf8'
        );
      }
    }

    return {
      agent: agent.id,
      status: 'configured',
      configPath: config.path,
      backupPath: backupCreated ? backupPath : undefined,
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
