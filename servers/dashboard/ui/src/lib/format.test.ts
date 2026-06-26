import { describe, it, expect } from 'vitest';
import { formatDuration, formatTime, truncate, escapeHtml } from '../../../src/lib/format';

describe('format', () => {
  it('formats duration', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(61000)).toBe('01:01');
    expect(formatDuration(3661000)).toBe('1:01:01');
    expect(formatDuration(undefined)).toBe('00:00');
  });

  it('formats time', () => {
    const ts = new Date('2026-06-26T14:30:45').getTime();
    expect(formatTime(ts)).toBe('14:30:45');
  });

  it('truncates strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello world', 6)).toBe('hello…');
  });

  it('escapes html', () => {
    expect(escapeHtml('<div>"x"</div>')).toBe('&lt;div&gt;&quot;x&quot;&lt;/div&gt;');
  });
});
