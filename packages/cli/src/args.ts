export type CommandName =
  | 'install'
  | 'list'
  | 'agents'
  | 'doctor'
  | 'dashboard'
  | 'version'
  | 'help';

const COMMAND_NAMES: readonly CommandName[] = [
  'install',
  'list',
  'agents',
  'doctor',
  'dashboard',
  'version',
  'help',
];

export function isCommandName(value: string): value is CommandName {
  return (COMMAND_NAMES as readonly string[]).includes(value);
}

export interface CliOptions {
  command: CommandName;
  target?: string;
  skills?: string[];
  agent?: string;
  symlink?: boolean;
  force?: boolean;
  dryRun?: boolean;
  diamondblock?: boolean;
  hooks?: boolean;
  port?: number;
  host?: string;
  verbose?: boolean;
  helpTopic?: CommandName;
}

export interface CommandContext {
  packageRoot: string;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
}

export class CliUsageError extends Error {
  readonly exitCode = 2 as const;
  readonly command?: CommandName;

  constructor(message: string, command?: CommandName) {
    super(message);
    this.name = 'CliUsageError';
    this.command = command;
  }
}

export class CliUnknownCommandError extends Error {
  readonly exitCode = 1 as const;
  readonly invalidCommand: string;

  constructor(invalidCommand: string) {
    super(`unknown command "${invalidCommand}"`);
    this.name = 'CliUnknownCommandError';
    this.invalidCommand = invalidCommand;
  }
}

interface CommandFlags {
  values: ReadonlySet<string>;
  booleans: ReadonlySet<string>;
}

const NO_FLAGS: CommandFlags = { values: new Set(), booleans: new Set() };

const COMMAND_FLAGS: Record<CommandName, CommandFlags> = {
  install: {
    values: new Set(['--target', '--skill', '--agent']),
    booleans: new Set(['--symlink', '--force', '--dry-run', '--diamondblock', '--hooks', '--no-hooks', '--verbose']),
  },
  list: NO_FLAGS,
  agents: NO_FLAGS,
  doctor: NO_FLAGS,
  dashboard: {
    values: new Set(['--port', '--host']),
    booleans: new Set(),
  },
  version: NO_FLAGS,
  help: NO_FLAGS,
};

function requireValue(flag: string, next: string | undefined, command: CommandName): string {
  if (next === undefined || (next.startsWith('-') && !/^-\d/.test(next))) {
    throw new CliUsageError(`${flag} requires a value`, command);
  }
  return next;
}

export function parsePort(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new CliUsageError(`invalid --port "${value}" (expected 1-65535)`, 'dashboard');
  }
  const port = Number(value);
  if (port < 1 || port > 65535) {
    throw new CliUsageError(`invalid --port "${value}" (expected 1-65535)`, 'dashboard');
  }
  return port;
}

export function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const first = args[0];

  if (first === undefined) {
    return { command: 'help' };
  }

  if (first === '--help' || first === '-h') {
    if (args.length > 1) {
      throw new CliUsageError(`unexpected argument "${args[1]}"`);
    }
    return { command: 'help' };
  }

  if (first === '--version' || first === '-v') {
    if (args.length > 1) {
      throw new CliUsageError(`unexpected argument "${args[1]}"`);
    }
    return { command: 'version' };
  }

  if (first.startsWith('-')) {
    throw new CliUsageError(`unknown flag "${first}"`);
  }

  if (!isCommandName(first)) {
    throw new CliUnknownCommandError(first);
  }

  const command = first;
  const flags = COMMAND_FLAGS[command];
  const result: CliOptions = { command };
  let override: Pick<CliOptions, 'command' | 'helpTopic'> | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      override = { command: 'help', helpTopic: command === 'help' ? undefined : command };
      continue;
    }

    if (arg === '--version' || arg === '-v') {
      override = { command: 'version', helpTopic: undefined };
      continue;
    }

    if (!arg.startsWith('-')) {
      if (command === 'help' && result.helpTopic === undefined) {
        if (!isCommandName(arg)) {
          throw new CliUnknownCommandError(arg);
        }
        result.helpTopic = arg;
        continue;
      }
      throw new CliUsageError(`unexpected argument "${arg}"`, command);
    }

    if (flags.values.has(arg)) {
      const value = requireValue(arg, args[i + 1], command);
      i++;
      switch (arg) {
        case '--target':
          result.target = value;
          break;
        case '--skill':
          if (!result.skills) result.skills = [];
          result.skills.push(value);
          break;
        case '--agent':
          result.agent = value;
          break;
        case '--port':
          result.port = parsePort(value);
          break;
        case '--host':
          result.host = value;
          break;
      }
      continue;
    }

    if (flags.booleans.has(arg)) {
      switch (arg) {
        case '--symlink':
          result.symlink = true;
          break;
        case '--force':
          result.force = true;
          break;
        case '--dry-run':
          result.dryRun = true;
          break;
        case '--diamondblock':
          result.diamondblock = true;
          break;
        case '--hooks':
          result.hooks = true;
          break;
        case '--no-hooks':
          result.hooks = false;
          break;
        case '--verbose':
          result.verbose = true;
          break;
      }
      continue;
    }

    throw new CliUsageError(`unknown flag "${arg}"`, command);
  }

  if (override) {
    return { ...result, command: override.command, helpTopic: override.helpTopic };
  }

  return result;
}
