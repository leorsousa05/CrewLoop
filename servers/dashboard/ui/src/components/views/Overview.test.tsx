import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ClientSession } from '../../../../src/types';
import { Overview } from './Overview';

const session: ClientSession = {
  id: 's1',
  source: 'codex',
  lifecycle: 'running',
  events: [],
  startTime: 1000,
  lastActivity: 2000,
  toolCounts: {},
};

describe('Overview telemetry layout', () => {
  it('removes Skill Activity and lets Live span the content grid', () => {
    const html = renderToStaticMarkup(
      <Overview
        sessions={new Map([[session.id, session]])}
        selectedSession={session}
        invocations={[]}
        onSelectSession={vi.fn()}
        onOpenTimeline={vi.fn()}
      />
    );
    expect(html).not.toContain('Skill Activity');
    expect(html).toContain('Live');
    expect(html).toContain('xl:col-span-3');
  });
});
