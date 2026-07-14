/**
 * Returns the subset of `paths` that are known to be directories — paths that
 * are a strict ancestor of at least one other path in the list.
 *
 * Runs in O(total path length): for each path, walk its ancestor prefixes and
 * mark those that are themselves present in the set. Prefixes are only cut at
 * '/' boundaries, so 'foo' is never confused with 'foo-bar'.
 */
export function computeDirectoryPaths(paths: string[]): Set<string> {
  const known = new Set(paths);
  const dirs = new Set<string>();

  for (const path of known) {
    let slash = path.indexOf('/');
    while (slash !== -1) {
      const ancestor = path.slice(0, slash);
      if (known.has(ancestor)) dirs.add(ancestor);
      slash = path.indexOf('/', slash + 1);
    }
  }

  return dirs;
}
