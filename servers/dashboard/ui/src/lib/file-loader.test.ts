import { describe, expect, it } from 'vitest';
import { FileRequestGuard, isAbortError, loadFileResource } from './file-loader';

describe('file loading correctness', () => {
  it('invalidates an older request when selection changes', () => {
    const guard = new FileRequestGuard();
    const first = guard.begin({ path: 'src/old.ts', sessionId: 'a', tab: 'content' });
    const secondIdentity = { path: 'src/new.ts', sessionId: 'a', tab: 'content' as const };
    guard.begin(secondIdentity);

    expect(guard.isCurrent(first, first.identity)).toBe(false);
    expect(guard.isCurrent({ generation: 2, identity: secondIdentity }, secondIdentity)).toBe(true);
  });

  it('loads content and sends the session identity to the API', async () => {
    let requestUrl = '';
    const result = await loadFileResource(
      { path: 'src/app.ts', sessionId: 'session-1', tab: 'content' },
      undefined,
      async (input) => {
        requestUrl = String(input);
        return { ok: true, json: async () => ({ content: 'export {}' }) } as Response;
      }
    );

    expect(requestUrl).toBe('/api/file-content?path=src%2Fapp.ts&sessionId=session-1');
    expect(result).toEqual({ content: 'export {}' });
  });

  it('distinguishes deleted, binary, and abort outcomes without accepting malformed content', async () => {
    await expect(loadFileResource(
      { path: 'missing.ts', tab: 'content' },
      undefined,
      async () => ({ ok: false, json: async () => ({}) } as Response)
    )).rejects.toThrow('Failed to load file content');

    await expect(loadFileResource(
      { path: 'binary.bin', tab: 'content' },
      undefined,
      async () => ({ ok: true, json: async () => ({ content: null }) } as Response)
    )).rejects.toThrow('File content is unavailable');

    const abortError = { name: 'AbortError' };
    expect(isAbortError(abortError)).toBe(true);
  });
});
