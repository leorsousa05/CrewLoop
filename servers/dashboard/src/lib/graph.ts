import type { ClientSession } from '../types';
import type { ToolInvocation } from './invocations';
import { resolvePath } from './paths';

export interface GraphNode {
  id: string;
  type: 'skill' | 'tool' | 'file';
  label: string;
  weight: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface Graph3D {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function buildGraph3D(session: ClientSession | undefined, invocations: ToolInvocation[]): Graph3D {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  function ensureNode(id: string, type: GraphNode['type'], label: string, weight = 0): GraphNode {
    const existing = nodes.get(id);
    if (existing) {
      existing.weight += weight;
      return existing;
    }
    const node: GraphNode = { id, type, label, weight };
    nodes.set(id, node);
    return node;
  }

  function addLink(sourceId: string, targetId: string, weight = 1) {
    const existing = links.find((l) => l.source === sourceId && l.target === targetId);
    if (existing) {
      existing.weight += weight;
    } else {
      links.push({ source: sourceId, target: targetId, weight });
    }
  }

  const currentSkillName = session?.activeSkill?.name || session?.skill || 'unknown';
  const currentSkillId = `skill:${currentSkillName}`;
  ensureNode(currentSkillId, 'skill', currentSkillName, 1);

  for (const inv of invocations) {
    if (inv.meta) continue;

    const invSkillName = inv.skill || currentSkillName;
    const invSkillId = `skill:${invSkillName}`;

    ensureNode(invSkillId, 'skill', invSkillName, 1);

    const toolId = `tool:${inv.tool}`;
    ensureNode(toolId, 'tool', inv.tool, 1);
    addLink(invSkillId, toolId, 1);

    const path = resolvePath(inv.input, inv.output);
    if (path) {
      const fileId = `file:${path}`;
      ensureNode(fileId, 'file', path, 1);
      addLink(toolId, fileId, 1);
    }
  }

  return { nodes: Array.from(nodes.values()), links };
}
