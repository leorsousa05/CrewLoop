import type { CliOptions, CommandContext } from '../args';
import { listSupportedAgents } from '../agents';
import { displayPath } from '../output';

export function runAgents(_options: CliOptions, context: CommandContext): number {
  const agents = listSupportedAgents();

  const rows = agents.map((agent) => ({
    id: agent.id,
    hooks: agent.hooks.supported ? 'yes' : 'no',
    skillsDir: displayPath(agent.skillsDir),
    hookConfig: agent.hooks.supported ? displayPath(agent.hooks.configPath) : '-',
  }));

  const header = { id: 'agent', hooks: 'hooks', skillsDir: 'skills dir', hookConfig: 'hook config' };
  const all = [header, ...rows];

  const idWidth = Math.max(...all.map((r) => r.id.length));
  const hooksWidth = Math.max(...all.map((r) => r.hooks.length));
  const skillsWidth = Math.max(...all.map((r) => r.skillsDir.length));

  const format = (row: typeof header): string =>
    `${row.id.padEnd(idWidth)}  ${row.hooks.padEnd(hooksWidth)}  ${row.skillsDir.padEnd(skillsWidth)}  ${row.hookConfig}`;

  context.stdout(format(header));
  for (const row of rows) {
    context.stdout(format(row));
  }

  return 0;
}
