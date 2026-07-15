import type { CliOptions, CommandContext } from '../args';
import { resolveSkills } from '../resolver';

const DEFAULT_WIDTH = 80;
const MIN_WIDTH = 40;

function fitRow(name: string, description: string, nameWidth: number, width: number): string {
  if (!description) {
    return name;
  }
  const prefix = `${name.padEnd(nameWidth)}  `;
  const available = width - prefix.length;
  if (available <= 1) {
    return prefix.trimEnd();
  }
  if (description.length <= available) {
    return `${prefix}${description}`;
  }
  return `${prefix}${description.slice(0, available - 1).trimEnd()}…`;
}

export function runList(
  _options: CliOptions,
  context: CommandContext,
  width: number = process.stdout.columns ?? DEFAULT_WIDTH
): number {
  const skills = resolveSkills(context.packageRoot);

  if (skills.length === 0) {
    context.stdout('no skills found');
    return 0;
  }

  const effectiveWidth = Math.max(MIN_WIDTH, width);
  const nameWidth = Math.max(...skills.map((skill) => skill.name.length));
  for (const skill of skills) {
    context.stdout(fitRow(skill.name, skill.description, nameWidth, effectiveWidth));
  }

  return 0;
}
