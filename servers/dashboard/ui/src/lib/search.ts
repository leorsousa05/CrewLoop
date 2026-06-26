import type { CommandPaletteItem, ToolInvocation } from './types';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokens(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean);
}

function haystack(item: CommandPaletteItem): string {
  const parts = [item.title, item.subtitle, ...(item.keywords || [])];
  return normalize(parts.join(' '));
}

export function score(item: CommandPaletteItem, query: string): number {
  const tks = tokens(query);
  if (tks.length === 0) return 1;
  const hay = haystack(item);
  let total = 0;
  for (const t of tks) {
    if (hay.includes(t)) total += 1;
  }
  return total === tks.length ? total : 0;
}

export function search(items: CommandPaletteItem[], query: string): CommandPaletteItem[] {
  const q = query.trim();
  if (!q) return items.slice(0, 50);
  const scored = items
    .map((item) => ({ item, value: score(item, q) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  return scored.slice(0, 50).map((s) => s.item);
}

function invocationText(inv: ToolInvocation): string {
  const parts = [
    inv.tool,
    inv.detail,
    inv.skill,
    inv.eventType,
    inv.status,
    inv.input ? JSON.stringify(inv.input) : '',
    inv.output ? JSON.stringify(inv.output) : '',
  ];
  return normalize(parts.join(' '));
}

export function matchesInvocation(inv: ToolInvocation, query: string): boolean {
  const tks = tokens(query);
  if (tks.length === 0) return true;
  const hay = invocationText(inv);
  return tks.every((t) => hay.includes(t));
}
