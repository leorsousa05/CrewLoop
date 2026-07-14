import { useEffect, useMemo, useState } from 'react';
import type { ClientSession } from '../../../src/types';
import { formatDuration } from '../../../src/lib/format';
import { resolvePath } from '../../../src/lib/paths';

interface Props {
  session: ClientSession | undefined;
}

export function TelemetryPanel({ session }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const events = session?.events || [];
    const toolEvents = events.filter((e) => e.event_type === 'tool_start' || e.event_type === 'tool_end');
    const windowStart = now - 60000;
    const rate = events.filter((e) => e.timestamp > windowStart).length;
    const end = session ? session.endedAt || session.lastActivity || now : now;
    const duration = session ? end - session.startTime : 0;
    const files = new Set<string>();
    for (const e of events) {
      if (!e.tool) continue;
      const path = resolvePath(e.input, e.output);
      if (path) files.add(path);
    }
    const errors = events.filter((e) => e.status === 'error').length;
    return {
      tools: Math.ceil(toolEvents.length / 2),
      duration: formatDuration(duration),
      rate,
      files: files.size,
      errors,
    };
  }, [session, now]);

  const cells = [
    { label: 'Tools', value: stats.tools },
    { label: 'Duration', value: stats.duration },
    { label: 'Rate/min', value: stats.rate },
    { label: 'Files', value: stats.files },
    { label: 'Errors', value: stats.errors, error: stats.errors > 0 },
  ];

  return (
    <section className="panel px-5 py-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-3 md:gap-x-0 md:gap-y-0 md:divide-x md:divide-border-default">
        {cells.map((c) => (
          <div
            key={c.label}
            className={`flex flex-col gap-0.5 px-0 md:px-3 md:first:pl-0 md:last:pr-0 ${
              c.error ? 'col-span-2 md:col-span-1' : ''
            }`}
          >
            <span className="text-caption uppercase tracking-wide text-text-muted">{c.label}</span>
            <span className={`font-display text-display-xl tabular ${c.error ? 'text-error' : 'text-text-primary'}`}>
              {c.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
