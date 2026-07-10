# Proposal: Hierarchical Collapsible File Tree

## Motivation
The current dashboard Files view lists files in a single flat list (e.g. `servers/dashboard/src/server.ts`). While it includes all files, it lacks spatial directory context, making it hard to navigate nested repositories. An IDE-style nested folder tree with expand/collapse states provides a much better developer experience.

## Scope
1. **Frontend Tree Construction:**
   - Parse the flat array of merged file objects in `FilesView` into a nested hierarchical tree structure of directory and file nodes.
2. **Initial Expansions (Auto-Focus):**
   - Automatically identify all files that contain active session operations (`ops.length > 0`) and expand their ancestor directories on initialization.
3. **Icons & Styling:**
   - Implement custom folder icons (open/closed folders) alongside expand/collapse indicators (▶/▼).
   - Use indentations aligned with monospace terminals.
   - Retain operational badges next to file names.

## Constraints
- **Performance:** Avoid rebuilding the tree on every render.
- **State Preservation:** Expanding or collapsing a folder manually should not reset selections or scroll states.
