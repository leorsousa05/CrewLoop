import { useEffect, useRef } from 'react';
import type { ClientSession } from '../../../src/types';

interface Props {
  session: ClientSession | undefined;
}

export function ActivityGraph({ session }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
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
    const accent = style.getPropertyValue('--accent').trim() || '#f59e0b';
    const inset = style.getPropertyValue('--bg-inset').trim() || '#050506';

    ctx.fillStyle = inset;
    ctx.fillRect(0, 0, width, height);

    counts.forEach((count, i) => {
      const barH = (count / max) * (height - pad * 2);
      const x = pad + i * barW;
      const y = height - pad - barH;
      ctx.fillStyle = accent;
      ctx.fillRect(x + 1, y, Math.max(1, barW - 2), Math.max(1, barH));
    });
  }, [session]);

  return (
    <section className="panel flex flex-col h-full">
      <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest px-5 py-4 border-b border-border-default">
        Skill Activity
      </h2>
      <div className="flex-1 relative p-4">
        {!session || session.events.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
            Waiting for agent activity...
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>
    </section>
  );
}
