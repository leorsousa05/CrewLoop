import path from 'node:path';
import fs from 'node:fs';
import { resolveSkills } from './resolver';
import { resolveAgentDir, listSupportedAgents } from './agents';
import { installSkills } from './installer';

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
  help                 Show this help message

Options:
  --target <dir>       Install to a custom directory
  --skill <name>       Install only a specific skill (repeatable)
  --agent <agent>      Target agent convention (kimi, claude, codex, cursor, windsurf)
  --symlink            Create symlinks instead of copying
  --force              Overwrite existing skills
  --dry-run            Print actions without installing
  -h, --help           Show help
`;
}

function resolvePackageRoot(): string {
  try {
    const skillsPackageJson = require.resolve('@crewloop/skills/package.json');
    return path.dirname(skillsPackageJson);
  } catch {
    const cwdNodeModules = path.join(process.cwd(), 'node_modules', '@crewloop', 'skills');
    if (fs.existsSync(path.join(cwdNodeModules, 'package.json'))) {
      return cwdNodeModules;
    }
  }

  throw new Error(
    'Could not find @crewloop/skills. Install it with: npm install @crewloop/skills'
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

  const result = installSkills(skills, targetDir, {
    target: args.target,
    skills: args.skills,
    agent: args.agent,
    symlink: args.symlink,
    force: args.force,
    dryRun: args.dryRun,
  });

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

  return 0;
}

export async function run(argv: string[]): Promise<number> {
  const args = parseArgs(['node', 'crewloop', ...argv]);

  switch (args.command) {
    case 'install':
      return handleInstall(args);
    case 'list':
      return handleList();
    case 'help':
    default:
      console.log(printHelp());
      return args.command === 'help' ? 0 : 1;
  }
}
