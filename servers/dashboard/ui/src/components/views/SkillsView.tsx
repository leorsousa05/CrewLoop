import { useMemo } from 'react';
import type { ToolInvocation } from '../../../../src/lib/invocations';
import { operationType } from '../../../../src/lib/invocations';
import { resolvePath } from '../../../../src/lib/paths';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import type { FilterOptions } from '../../lib/types';
import { Icon } from '../ui/Icon';

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Skills" icon="ChartPie" />
      <FilterBar options={filterOptions} resultCount={invocations.length} />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="panel p-4 flex flex-col gap-1">
            <span className="font-display text-4xl text-accent">{stats.skills.length}</span>
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Skills</span>
          </div>
          <div className="panel p-4 flex flex-col gap-1">
            <span className="font-display text-4xl text-accent">{stats.tools.length}</span>
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Tools</span>
          </div>
          <div className="panel p-4 flex flex-col gap-1">
            <span className="font-display text-4xl text-accent">{stats.fileCount}</span>
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Files touched</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="panel p-5">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Skill usage
            </h2>
            <div className="pt-3 flex flex-col gap-2">
              {stats.skills.length === 0 && <p className="text-sm text-text-muted">No skills observed.</p>}
              {stats.skills.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Circle" className="w-2 h-2 text-accent" />
                    <span className="text-text-primary">{name}</span>
                  </div>
                  <span className="text-text-muted tabular">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Tool usage
            </h2>
            <div className="pt-3 flex flex-col gap-2">
              {stats.tools.length === 0 && <p className="text-sm text-text-muted">No tools observed.</p>}
              {stats.tools.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-text-primary">{name}</span>
                  <span className="text-text-muted tabular">{count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
