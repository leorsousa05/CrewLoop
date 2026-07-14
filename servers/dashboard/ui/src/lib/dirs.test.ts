import { describe, it, expect } from 'vitest';
import { computeDirectoryPaths } from './dirs';

describe('computeDirectoryPaths', () => {
  it('marks a leaf path as a directory when another path is nested under it', () => {
    const dirs = computeDirectoryPaths(['src/components', 'src/components/Button.tsx']);
    expect(dirs.has('src/components')).toBe(true);
  });

  it('does not mark plain files as directories', () => {
    const dirs = computeDirectoryPaths(['package.json', 'src/index.ts']);
    expect(dirs.size).toBe(0);
  });

  it('avoids false positives on shared name prefixes', () => {
    const dirs = computeDirectoryPaths(['foo', 'foo-bar/baz.ts']);
    expect(dirs.has('foo')).toBe(false);
  });

  it('marks every known ancestor of a nested path', () => {
    const dirs = computeDirectoryPaths(['a', 'a/b', 'a/b/c.ts']);
    expect(dirs.has('a')).toBe(true);
    expect(dirs.has('a/b')).toBe(true);
  });

  it('does not invent directories that are not in the list', () => {
    const dirs = computeDirectoryPaths(['src/components/Button.tsx']);
    expect(dirs.size).toBe(0);
  });

  it('handles duplicates and empty input', () => {
    expect(computeDirectoryPaths([]).size).toBe(0);
    const dirs = computeDirectoryPaths(['src', 'src', 'src/a.ts']);
    expect(dirs.has('src')).toBe(true);
    expect(dirs.size).toBe(1);
  });
});
