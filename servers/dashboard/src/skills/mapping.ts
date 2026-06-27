export function inferFromGitCommand(command: string): string | undefined {
  if (/\b(git\s+(commit|push|branch|merge|tag|checkout))\b/.test(command)) {
    return 'shipper';
  }
  return undefined;
}
