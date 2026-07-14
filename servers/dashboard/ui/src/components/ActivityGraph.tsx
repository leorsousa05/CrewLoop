import { useEffect, useRef } from 'react';
import type { ClientSession } from '../../../src/types';
import { useResizeObserver } from '../hooks/useResizeObserver';

interface Props {
  session: ClientSession | undefined;
}

export function ActivityGraph({ session }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = size.width;
    const height = size.height;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.scale(dpr, dpr);

    const events = session?.events || [];

    const now = Date.now();
    const span = Math.max(60000, now - Math.min(...events.map((e) => e.timestamp), now));
    const buckets = 40;
    const bucketMs = span / buckets;
    const counts = new Array(buckets).fill(0);

    events.forEach((e) => {
      const idx = Math.min(buckets - 1, Math.floor((now - e.timestamp) / bucketMs));
      counts[buckets - 1 - idx]++;
    });

    const max = Math.max(1, ...counts);
    const pad = 4;
    const barW = (width - pad * 2) / buckets;

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim() || 'hsl(230, 90%, 70%)';
    const inset = style.getPropertyValue('--bg-inset').trim() || 'hsl(224, 30%, 5%)';

    ctx.fillStyle = inset;
    ctx.fillRect(0, 0, width, height);

    counts.forEach((count, i) => {
      const barH = (count / max) * (height - pad * 2);
      const x = pad + i * barW;
      const y = height - pad - barH;
      ctx.fillStyle = accent;
      ctx.globalAlpha = i === buckets - 1 ? 1 : 0.5;
      ctx.fillRect(x + 1, y, Math.max(1, barW - 2), Math.max(1, barH));
    });
    ctx.globalAlpha = 1;
  }, [session, size]);

  const eventCount = session?.events.length || 0;
  const firstTs = session?.events[0]?.timestamp;
  const minutes = firstTs ? Math.max(1, Math.round((Date.now() - firstTs) / 60000)) : 0;

  return (
    <section className="panel flex flex-col h-full">
      <h2 className="text-caption uppercase tracking-wide text-text-muted px-5 py-3 border-b border-border-default">
        Skill Activity
      </h2>
      <div ref={containerRef} className="flex-1 relative p-4 min-h-[120px]">
        {!session || session.events.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-body text-text-muted">
            Waiting for agent activity...
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              aria-label="Event activity over time"
            />
            <p className="sr-only">
              {eventCount} events in the last {minutes} minute{minutes === 1 ? '' : 's'}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
