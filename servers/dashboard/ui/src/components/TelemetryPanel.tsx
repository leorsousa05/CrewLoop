import { useEffect, useMemo, useState } from 'react';
import type { ClientSession } from '../../../src/types';
import { formatDuration } from '../../../src/lib/format';

interface Props {
  session: ClientSession | undefined;
}

export function TelemetryPanel({ session }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const toolEvents = useMemo(
    () => (session?.events || []).filter((e) => e.event_type === 'tool_start' || e.event_type === 'tool_end'),
    [session]
  );

  const eventRate = useMemo(() => {
    const windowStart = now - 60000;
    return (session?.events || []).filter((e) => e.timestamp > windowStart).length;
  }, [session, now]);

  const duration = useMemo(() => {
    if (!session) return 0;
    const end = session.endedAt || session.lastActivity || now;
    return end - session.startTime;
  }, [session, now]);

  const cards = [
    { label: 'Tools', value: Math.ceil(toolEvents.length / 2) },
    { label: 'Duration', value: formatDuration(duration) },
    { label: 'Rate/m', value: eventRate },
  ];

  return (
    <section className="panel p-5">
      <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-4 border-b border-border-default">
        Telemetry
      </h2>
      <div className="pt-4 flex flex-col gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-1 p-3 bg-inset border border-border-default rounded"
          >
            <span className="text-2xl font-medium tabular text-accent">{c.value}</span>
            <span className="text-xs text-text-muted uppercase tracking-widest">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
