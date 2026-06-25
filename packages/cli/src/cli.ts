import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { resolveSkills } from './resolver';
import { resolveAgentDir, listSupportedAgents } from './agents';
import { installSkills } from './installer';
import { installMcpServer, type McpInstallResult } from './mcp';

function requireValue(arg: string, next: string | undefined): string {
  if (next === undefined || next.startsWith('-')) {
    throw new Error(`Flag ${arg} requires a value`);
  }
  return next;
}

export function parseArgs(argv: string[]): {
  command: string;
  target?: string;
  skills?: string[];
  agent?: string;
  symlink?: boolean;
  force?: boolean;
  dryRun?: boolean;
  port?: number;
  host?: string;
} {
  const args = argv.slice(2);
  const command = args[0];

  const result: ReturnType<typeof parseArgs> = { command };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--target':
        result.target = requireValue(arg, next);
        i++;
        break;
      case '--skill':
        if (!result.skills) result.skills = [];
        result.skills.push(requireValue(arg, next));
        i++;
        break;
      case '--agent':
        result.agent = requireValue(arg, next);
        i++;
        break;
      case '--port':
        result.port = parseInt(requireValue(arg, next), 10);
        i++;
        break;
      case '--host':
        result.host = requireValue(arg, next);
        i++;
        break;
      case '--symlink':
        result.symlink = true;
        break;
      case '--force':
        result.force = true;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--help':
      case '-h':
        result.command = 'help';
        break;
    }
  }

  return result;
}

export function printHelp(): string {
  return `crewloop <command> [options]

Commands:
  install              Install CrewLoop skills
  list                 List available skills
  dashboard            Start the real-time skill dashboard
  help                 Show this help message

Options:
  --target <dir>       Install to a custom directory
  --skill <name>       Install only a specific skill (repeatable)
  --agent <agent>      Target agent convention (kimi, claude, codex, cursor, windsurf)
  --port <number>      Dashboard port (default: 7890)
  --host <address>     Dashboard host (default: 127.0.0.1)
  --symlink            Create symlinks instead of copying
  --force              Overwrite existing skills
  --dry-run            Print actions without installing
  -h, --help           Show help
`;
}

function resolvePackageRoot(): string {
  try {
    const skillsPackageJson = require.resolve('@archznn/crewloop-skills/package.json');
    return path.dirname(skillsPackageJson);
  } catch {
    const cwdNodeModules = path.join(process.cwd(), 'node_modules', '@archznn', 'crewloop-skills');
    if (fs.existsSync(path.join(cwdNodeModules, 'package.json'))) {
      return cwdNodeModules;
    }
  }

  throw new Error(
    'Could not find @archznn/crewloop-skills. Install it with: npm install @archznn/crewloop-skills'
  );
}

async function handleList(): Promise<number> {
  const packageRoot = resolvePackageRoot();
  const skills = resolveSkills(packageRoot);

  if (skills.length === 0) {
    console.log('No skills found.');
    return 0;
  }

  console.log('Available CrewLoop skills:\n');
  for (const skill of skills) {
    console.log(`  ${skill.name}`);
    if (skill.description) {
      console.log(`    ${skill.description}`);
    }
  }

  return 0;
}

async function handleInstall(args: ReturnType<typeof parseArgs>): Promise<number> {
  const packageRoot = resolvePackageRoot();
  const skills = resolveSkills(packageRoot, args.skills);

  if (skills.length === 0) {
    console.error('No matching skills found.');
    return 1;
  }

  const targetDir = args.target || resolveAgentDir(args.agent);

  if (args.dryRun) {
    console.log(`Would install ${skills.length} skill(s) to ${targetDir}:`);
    for (const skill of skills) {
      console.log(`  - ${skill.name}`);
    }
  }

  const result = installSkills(
    skills,
    targetDir,
    {
      target: args.target,
      skills: args.skills,
      agent: args.agent,
      symlink: args.symlink,
      force: args.force,
      dryRun: args.dryRun,
    },
    packageRoot
  );

  if (!args.dryRun) {
    console.log(`Installed ${result.installed.length} skill(s) to ${targetDir}`);
    for (const name of result.installed) {
      console.log(`  + ${name}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log(`Skipped ${result.skipped.length} existing skill(s) (use --force to overwrite):`);
    for (const name of result.skipped) {
      console.log(`  - ${name}`);
    }
  }

  if (result.errors.length > 0) {
    console.error(`Encountered ${result.errors.length} error(s):`);
    for (const error of result.errors) {
      console.error(`  ! ${error.message}`);
    }
    return 1;
  }

  const mcpDir = path.join(packageRoot, 'servers', 'obsidian-mcp');
  let mcpResult: McpInstallResult | undefined;
  if (fs.existsSync(mcpDir)) {
    mcpResult = installMcpServer(mcpDir, {
      dryRun: args.dryRun,
      force: args.force,
    });

    if (mcpResult.error) {
      console.error(`MCP install warning: ${mcpResult.error.message}`);
    } else if (mcpResult.installed) {
      console.log(`Installed Obsidian MCP server at ${mcpResult.binaryPath}`);
    } else if (mcpResult.skipped) {
      console.log(`Obsidian MCP server already installed at ${mcpResult.binaryPath}`);
    }
  }

  return 0;
}

async function handleDashboard(args: ReturnType<typeof parseArgs>): Promise<number> {
  const packageRoot = resolvePackageRoot();
  const dashboardBin = path.join(packageRoot, 'servers', 'dashboard', 'bin', 'crewloop-dashboard.js');

  if (!fs.existsSync(dashboardBin)) {
    console.error('Dashboard server not found. Build the dashboard package first:');
    console.error('  cd servers/dashboard && npm install && npm run build');
    return 1;
  }

  const env: NodeJS.ProcessEnv = { ...process.env };
  if (args.port !== undefined) {
    env.CREWLOOP_DASHBOARD_PORT = String(args.port);
  }
  if (args.host !== undefined) {
    env.CREWLOOP_DASHBOARD_HOST = args.host;
  }

  console.log(`Starting CrewLoop dashboard from ${dashboardBin}`);
  const child = spawn(process.execPath, [dashboardBin], {
    env,
    stdio: 'inherit',
  });

  return new Promise((resolve) => {
    child.on('close', (code) => {
      resolve(code ?? 0);
    });
  });
}

export async function run(argv: string[]): Promise<number> {
  const args = parseArgs(['node', 'crewloop', ...argv]);

  switch (args.command) {
    case 'install':
      return handleInstall(args);
    case 'list':
      return handleList();
    case 'dashboard':
      return handleDashboard(args);
    case 'help':
    default:
      console.log(printHelp());
      return args.command === 'help' ? 0 : 1;
  }
}
