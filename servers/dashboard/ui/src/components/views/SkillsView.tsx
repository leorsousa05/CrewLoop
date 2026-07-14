import { useMemo } from 'react';
import type { ToolInvocation } from '../../../../src/lib/invocations';
import { operationType } from '../../../../src/lib/invocations';
import { resolvePath } from '../../../../src/lib/paths';
import { FilterBar } from '../FilterBar';
import type { FilterOptions } from '../../lib/types';

interface Props {
  invocations: ToolInvocation[];
  filterOptions: FilterOptions;
}

export function SkillsView({ invocations, filterOptions }: Props) {
  const stats = useMemo(() => {
    const skills = new Map<string, number>();
    const tools = new Map<string, number>();
    const files = new Set<string>();
    for (const inv of invocations) {
      if (inv.skill) skills.set(inv.skill, (skills.get(inv.skill) || 0) + 1);
      tools.set(inv.tool, (tools.get(inv.tool) || 0) + 1);
      const path = resolvePath(inv.input, inv.output);
      if (path) files.add(path);
    }
    return {
      skills: Array.from(skills.entries()).sort((a, b) => b[1] - a[1]),
      tools: Array.from(tools.entries()).sort((a, b) => b[1] - a[1]),
      reads: invocations.filter((i) => operationType(i.tool) === 'read').length,
      edits: invocations.filter((i) => operationType(i.tool) === 'edit').length,
      fileCount: files.size,
    };
  }, [invocations]);

  const cells = [
    { label: 'Skills', value: stats.skills.length },
    { label: 'Tools', value: stats.tools.length },
    { label: 'Files touched', value: stats.fileCount },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterBar options={filterOptions} resultCount={invocations.length} />
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <section className="panel px-5 py-3 mb-4">
          <div className="grid grid-cols-3 divide-x divide-border-default">
            {cells.map((c, i) => (
              <div key={c.label} className={`flex flex-col gap-0.5 ${i === 0 ? 'pr-3' : i === cells.length - 1 ? 'pl-3' : 'px-3'}`}>
                <span className="text-caption uppercase tracking-wide text-text-muted">{c.label}</span>
                <span className="font-display text-display-xl tabular text-text-primary">{c.value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="panel">
            <h2 className="text-caption uppercase tracking-wide text-text-muted pb-3 border-b border-border-default">
              Skill usage
            </h2>
            <div className="pt-3 flex flex-col gap-3">
              {stats.skills.length === 0 && <p className="text-body text-text-muted">No skills observed.</p>}
              {stats.skills.map(([name, count], i) => {
                const max = stats.skills[0]?.[1] || 1;
                return (
                  <div key={name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-micro text-text-muted tabular w-5 text-right">{i + 1}</span>
                        <span className="text-label text-text-primary truncate">{name}</span>
                      </div>
                      <span className="text-micro text-text-muted tabular">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-inset overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/70 animate-bar-in"
                        style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2 className="text-caption uppercase tracking-wide text-text-muted pb-3 border-b border-border-default">
              Tool usage
            </h2>
            <div className="pt-3 flex flex-col gap-3">
              {stats.tools.length === 0 && <p className="text-body text-text-muted">No tools observed.</p>}
              {stats.tools.map(([name, count]) => {
                const max = stats.tools[0]?.[1] || 1;
                return (
                  <div key={name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-label text-text-primary truncate">{name}</span>
                      <span className="text-micro text-text-muted tabular">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-inset overflow-hidden">
                      <div
                        className="h-full rounded-full bg-running/70 animate-bar-in"
                        style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
