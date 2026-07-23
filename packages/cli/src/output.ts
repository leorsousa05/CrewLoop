import os from 'node:os';
import { CliUsageError } from './args';
import { getHelpTopic } from './help';

export interface Output {
  info(line: string): void;
  error(line: string): void;
}

export function formatUsageError(error: CliUsageError): string[] {
  const lines = [`error: ${error.message}`];
  if (error.command) {
    lines.push(`usage: ${getHelpTopic(error.command).usage}`);
  } else {
    lines.push('hint: run "crewloop help"');
  }
  return lines;
}

export function formatUnknownCommand(command: string): string[] {
  return [`error: unknown command "${command}"`, 'hint: run "crewloop help"'];
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  return `${count} ${word}`;
}

export function displayPath(pathname: string): string {
  const home = os.homedir().replace(/\\/g, '/');
  const normalized = pathname.replace(/\\/g, '/');
  if (normalized === home) {
    return '~';
  }
  if (normalized.startsWith(`${home}/`)) {
    return `~/${normalized.slice(home.length + 1)}`;
  }
  return pathname;
}
