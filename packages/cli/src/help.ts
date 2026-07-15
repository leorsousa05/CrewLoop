import type { CommandName } from './args';

export interface HelpTopic {
  name: CommandName;
  usage: string;
  summary: string;
  options: string[];
  examples: string[];
}

const HELP_TOPICS: HelpTopic[] = [
  {
    name: 'install',
    usage: 'crewloop install [options]',
    summary:
      'Install CrewLoop skills and configure agent hooks.\n' +
      'Installing skills does not configure MCP servers; --diamondblock delegates that to the official DiamondBlock installer.',
    options: [
      '  --target <dir>       Install to a custom directory',
      '  --skill <name>       Install only a specific skill (repeatable)',
      '  --agent <agent>      Target agent convention (kimi, claude, codex, agy, opencode, cursor, windsurf)',
      '  --symlink            Link skill payloads inside a safe installed wrapper',
      '  --force              Overwrite existing skills',
      '  --dry-run            Print actions without installing',
      '  --diamondblock       Also configure DiamondBlock MCP via its official installer (opt-in)',
      '  --hooks              Configure agent hooks (default)',
      '  --no-hooks           Skip agent hook configuration',
      '  --verbose            Show per-skill and per-hook details',
    ],
    examples: [
      '  crewloop install',
      '  crewloop install --skill architect --skill engineer',
      '  crewloop install --agent claude --no-hooks',
      '  crewloop install --dry-run --verbose',
      '  crewloop install --diamondblock',
      '  crewloop install --dry-run --diamondblock',
    ],
  },
  {
    name: 'list',
    usage: 'crewloop list',
    summary: 'List available skills',
    options: [],
    examples: ['  crewloop list'],
  },
  {
    name: 'agents',
    usage: 'crewloop agents',
    summary: 'List supported agents, hook support, and config paths',
    options: [],
    examples: ['  crewloop agents'],
  },
  {
    name: 'doctor',
    usage: 'crewloop doctor',
    summary: 'Diagnose package, dashboard, shim, and hook setup (read-only)',
    options: [],
    examples: ['  crewloop doctor'],
  },
  {
    name: 'dashboard',
    usage: 'crewloop dashboard [--port <number>] [--host <address>]',
    summary: 'Start the real-time skill dashboard',
    options: [
      '  --port <number>      Dashboard port (default: 7890)',
      '  --host <address>     Dashboard host (default: 127.0.0.1)',
    ],
    examples: ['  crewloop dashboard', '  crewloop dashboard --port 8080'],
  },
  {
    name: 'version',
    usage: 'crewloop version',
    summary: 'Show version',
    options: [],
    examples: ['  crewloop version', '  crewloop --version'],
  },
  {
    name: 'help',
    usage: 'crewloop help [command]',
    summary: 'Show help for all commands or one command',
    options: [],
    examples: ['  crewloop help', '  crewloop help install'],
  },
];

export function listHelpTopics(): HelpTopic[] {
  return HELP_TOPICS.map((topic) => ({ ...topic }));
}

export function getHelpTopic(name: CommandName): HelpTopic {
  const topic = HELP_TOPICS.find((t) => t.name === name);
  if (!topic) {
    throw new Error(`No help topic for command "${name}"`);
  }
  return topic;
}

export function printCommandHelp(topic: CommandName): string {
  const { usage, summary, options, examples } = getHelpTopic(topic);
  const sections = [usage, '', summary];
  if (options.length > 0) {
    sections.push('', 'Options:', ...options);
  }
  if (examples.length > 0) {
    sections.push('', 'Examples:', ...examples);
  }
  return `${sections.join('\n')}\n`;
}

export function printHelp(topic?: CommandName): string {
  if (topic) {
    return printCommandHelp(topic);
  }

  return `crewloop <command> [options]

Commands:
  install              Install CrewLoop skills and configure agent hooks
  list                 List available skills
  agents               List supported agents and hook paths
  doctor               Diagnose CLI, dashboard, and hook setup
  dashboard            Start the real-time skill dashboard
  version              Show version
  help                 Show this help message

Hooks:
  Supported agents: kimi, claude, codex, agy, opencode
  Running "crewloop install" registers PreToolUse and PostToolUse hooks in
  each agent's config file. The hooks send events to the CrewLoop dashboard so it
  can track the active skill and session state. Use --no-hooks to skip this step.

DiamondBlock:
  Installing skills does not configure MCP servers; use "crewloop install
  --diamondblock" to delegate MCP setup to the official DiamondBlock installer.

Options:
  --target <dir>       Install to a custom directory
  --skill <name>       Install only a specific skill (repeatable)
  --agent <agent>      Target agent convention (kimi, claude, codex, agy, opencode, cursor, windsurf)
  --port <number>      Dashboard port (default: 7890)
  --host <address>     Dashboard host (default: 127.0.0.1)
  --symlink            Link skill payloads inside a safe installed wrapper
  --force              Overwrite existing skills
  --dry-run            Print actions without installing
  --diamondblock       Also configure DiamondBlock MCP via its official installer (opt-in)
  --hooks              Configure agent hooks (default)
  --no-hooks           Skip agent hook configuration
  --verbose            Show per-skill and per-hook details
  -v, --version        Show version
  -h, --help           Show help

Examples:
  crewloop install
  crewloop install --skill architect --skill engineer
  crewloop install --agent claude --no-hooks
  crewloop install --dry-run
  crewloop list
  crewloop agents
  crewloop doctor
  crewloop dashboard --port 8080
  crewloop --version
`;
}
