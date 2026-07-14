import { describe, it, expect } from 'vitest';
import { parseRoute, serializeRoute, filtersToQuery, filtersFromQuery, DEFAULT_ROUTE } from './route';
import { DEFAULT_FILTER_STATE } from './types';

describe('route', () => {
  it('returns DEFAULT_ROUTE for empty or invalid hashes', () => {
    expect(parseRoute('')).toEqual(DEFAULT_ROUTE);
    expect(parseRoute('#')).toEqual(DEFAULT_ROUTE);
    expect(parseRoute('#/')).toEqual(DEFAULT_ROUTE);
    expect(parseRoute('#/unknown')).toEqual(DEFAULT_ROUTE);
  });

  it('parses a bare view', () => {
    expect(parseRoute('#/timeline')).toEqual({ ...DEFAULT_ROUTE, view: 'timeline' });
  });

  it('parses session, file, and sort params', () => {
    const route = parseRoute('#/files?session=s1&file=src/a.ts&sort=duration');
    expect(route.view).toBe('files');
    expect(route.sessionId).toBe('s1');
    expect(route.filePath).toBe('src/a.ts');
    expect(route.sort).toBe('duration');
  });

  it('drops invalid enum values', () => {
    const route = parseRoute(
      '#/timeline?time=bogus&ops=read,nope&sort=nope&sources=kimi,fake&statuses=success,fake'
    );
    expect(route.filters.time).toBeUndefined();
    expect(route.filters.ops).toBe('read');
    expect(route.sort).toBeNull();
    expect(route.filters.sources).toBe('kimi');
    expect(route.filters.statuses).toBe('success');
  });

  it('keeps free-text filters', () => {
    const route = parseRoute('#/timeline?q=build&skills=engineer&tools=Read');
    expect(route.filters.q).toBe('build');
    expect(route.filters.skills).toBe('engineer');
    expect(route.filters.tools).toBe('Read');
  });

  it('serializes only non-default values', () => {
    expect(serializeRoute(DEFAULT_ROUTE)).toBe('#/overview');
    expect(
      serializeRoute({
        ...DEFAULT_ROUTE,
        view: 'timeline',
        sort: 'events',
        sessionId: 's1',
        filters: { q: 'x', time: '1h' },
      })
    ).toBe('#/timeline?q=x&time=1h&session=s1&sort=events');
  });

  it('round-trips parse(serialize(state))', () => {
    const state = {
      view: 'sessions' as const,
      sessionId: 'abc',
      filters: { q: 'build', sources: 'kimi', ops: 'read,edit', time: '24h' as const },
      filePath: null,
      sort: 'name' as const,
    };
    expect(parseRoute(serializeRoute(state))).toEqual(state);
  });

  it('filtersToQuery omits defaults', () => {
    expect(filtersToQuery(DEFAULT_FILTER_STATE).toString()).toBe('');
  });

  it('filters round-trip through query params', () => {
    const filters = {
      ...DEFAULT_FILTER_STATE,
      query: 'x',
      sources: ['kimi' as const],
      opTypes: ['read' as const],
      timeRange: '1h' as const,
    };
    const back = filtersFromQuery(filtersToQuery(filters));
    expect(back.query).toBe('x');
    expect(back.sources).toEqual(['kimi']);
    expect(back.opTypes).toEqual(['read']);
    expect(back.timeRange).toBe('1h');
    expect(back.skills).toBeUndefined();
  });
});
