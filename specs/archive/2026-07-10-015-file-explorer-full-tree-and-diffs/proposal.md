# Proposal: File Explorer Full Tree and Diffs

## Motivation
The current dashboard Files view has three major UX/fidelity limitations:
1. The left panel file explorer only shows files that were actively read or written to during the session. It does not provide context of the entire repository/workspace tree.
2. The right panel only renders the snippet extracted from the tool output (e.g. read snippets, diff chunks). It does not show the full file content or highlight the read/modified sections in-context.
3. Kimi's write and edit operations do not render proper diffs because Kimi outputs simple success messages (e.g. `Wrote 3087 bytes...`), and the dashboard fails to reconstruct the diff from the input payload.

Rather than guessing diffs via complex regex and string reconstruction from agent inputs, we will adopt a hybrid approach: the backend will query the actual Git status on disk (`git diff HEAD`) to construct high-fidelity, logical diffs (GitHub-style) for any edited file.

## Scope
1. **Backend Endpoints:**
   - Add `GET /api/workspace-files` to recursively read the repository files (filtering out ignored folders like `.git`, `node_modules`, `dist`, `.next`, `build`, etc.) and return a flat array of relative paths.
   - Add `GET /api/file-content` to safely read the content of any file in the workspace based on a query parameter `?path=...`.
   - Add `GET /api/file-diff` to safely run `git diff HEAD -- <path>` and return the actual unified diff lines of the file.
2. **Frontend Explorer Tree:**
   - Modify `FileList.tsx` to render a nested directory tree (or a full list of all repository files) instead of just the session-active files.
   - Distinctly style files with session operations (showing read/edit/other badges, bold titles) vs. inactive files.
3. **Frontend Code Viewer Tabs:**
   - Update `FileDiff.tsx` to display two tabs at the top:
     - **File Content:** Shows the full file content (fetched from `GET /api/file-content`), with the read range highlighted (in blue) or modified range highlighted (in green/red).
     - **Diff / Snippet:** Shows the logical Git diff (fetched from `GET /api/file-diff`) for edits, or the read snippet for reads.

## Constraints
- File reading and command execution must be safe: prevent directory traversal attacks (ensure the path stays within `process.cwd()`) and command injection (pass arguments as an array to `execFile`, never string interpolation in a raw shell).
- Fallbacks must be robust: if a file has no git diff (e.g., untracked or clean), fallback to showing the raw file content or operation snippet.
