export type FileRequestTab = 'content' | 'diff';

export interface FileRequestIdentity {
  path: string;
  sessionId?: string;
  tab: FileRequestTab;
}

export interface FileResource {
  content?: string;
  diff?: string | null;
}

export interface FileRequestToken {
  generation: number;
  identity: FileRequestIdentity;
}

export class FileRequestGuard {
  private generation = 0;

  begin(identity: FileRequestIdentity): FileRequestToken {
    this.generation += 1;
    return { generation: this.generation, identity };
  }

  invalidate(): void {
    this.generation += 1;
  }

  isCurrent(token: FileRequestToken, identity: FileRequestIdentity): boolean {
    return token.generation === this.generation && sameIdentity(token.identity, identity);
  }
}

export function sameIdentity(a: FileRequestIdentity, b: FileRequestIdentity): boolean {
  return a.path === b.path && a.sessionId === b.sessionId && a.tab === b.tab;
}

export function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
  );
}

function fileRequestUrl(identity: FileRequestIdentity): string {
  const endpoint = identity.tab === 'content' ? '/api/file-content' : '/api/file-diff';
  const session = identity.sessionId ? `&sessionId=${encodeURIComponent(identity.sessionId)}` : '';
  return `${endpoint}?path=${encodeURIComponent(identity.path)}${session}`;
}

export async function loadFileResource(
  identity: FileRequestIdentity,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<FileResource> {
  const response = await fetchImpl(fileRequestUrl(identity), { signal });
  if (!response.ok) {
    throw new Error(identity.tab === 'content' ? 'Failed to load file content' : 'Failed to load git diff');
  }

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid file response');
  }

  const value = data as Record<string, unknown>;
  if (identity.tab === 'content' && typeof value.content !== 'string') {
    throw new Error('File content is unavailable');
  }
  if (identity.tab === 'diff' && typeof value.diff !== 'string' && value.diff !== null) {
    throw new Error('Git diff is unavailable');
  }

  return identity.tab === 'content'
    ? { content: value.content as string }
    : { diff: (value.diff as string | null) ?? null };
}
