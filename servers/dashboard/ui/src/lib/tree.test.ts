import { describe, it, expect } from 'vitest';
import { buildFileTree } from '../components/FileList';
import type { FileEntry } from '../../../../src/lib/invocations';

describe('buildFileTree', () => {
  it('correctly constructs nested directories and sorts them', () => {
    const mockFiles: FileEntry[] = [
      { path: 'src/components/Button.tsx', ops: [] },
      { path: 'src/lib/utils.ts', ops: [] },
      { path: 'package.json', ops: [] },
      { path: 'src/components/List.tsx', ops: [] },
    ];

    const tree = buildFileTree(mockFiles);

    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe('src');
    expect(tree[0].type).toBe('directory');
    expect(tree[1].name).toBe('package.json');
    expect(tree[1].type).toBe('file');

    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].name).toBe('components');
    expect(tree[0].children[0].type).toBe('directory');
    expect(tree[0].children[1].name).toBe('lib');

    expect(tree[0].children[0].children).toHaveLength(2);
    expect(tree[0].children[0].children[0].name).toBe('Button.tsx');
    expect(tree[0].children[0].children[1].name).toBe('List.tsx');
  });
});
