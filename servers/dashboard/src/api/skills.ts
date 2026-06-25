import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SkillRegistry } from '../skills/registry';

export function createSkillsHandler(registry: SkillRegistry) {
  return async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const skills = registry.getSkills();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(skills));
  };
}
