import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ClientSession } from '../../../src/types';
import { formatTokenCount, TelemetryPanel } from './TelemetryPanel';

function session(overrides: Partial<ClientSession> = {}): ClientSession {
  return {
    id: 's1',
    source: 'codex',
    lifecycle: 'running',
    events: [],
    startTime: 1000,
    lastActivity: 2000,
    toolCounts: {},
    securityDecisions: [],
    ...overrides,
  };
}

describe('TelemetryPanel', () => {
  it('formats compact token counts deterministically', () => {
    expect(formatTokenCount(999)).toBe('999');
    expect(formatTokenCount(1_200)).toBe('1.2K');
    expect(formatTokenCount(2_000_000)).toBe('2M');
  });

  it('renders measured totals and component labels', () => {
    const html = renderToStaticMarkup(
      <TelemetryPanel
        session={session({
          tokenUsage: {
            inputTokens: 8000,
            outputTokens: 4000,
            cacheReadTokens: 3000,
            cacheWriteTokens: 0,
            reasoningTokens: 500,
            totalTokens: 12000,
            quality: 'measured',
            model: 'gpt-test',
            measurementCount: 1,
            rejectedMeasurementCount: 0,
          },
        })}
      />
    );
    expect(html).toContain('12K');
    expect(html).toContain('Input');
    expect(html).toContain('Cache read');
    expect(html).toContain('MEASURED');
    expect(html).toContain('Export run');
  });

  it('renders an honest unavailable state instead of zero tokens', () => {
    const html = renderToStaticMarkup(<TelemetryPanel session={session()} />);
    expect(html).toContain('UNAVAILABLE');
    expect(html).toContain('Token usage was not reported');
    expect(html).not.toContain('Total tokens');
  });

  it('renders the empty state when no session is selected', () => {
    const html = renderToStaticMarkup(<TelemetryPanel session={undefined} />);
    expect(html).toContain('No session selected');
  });
});
