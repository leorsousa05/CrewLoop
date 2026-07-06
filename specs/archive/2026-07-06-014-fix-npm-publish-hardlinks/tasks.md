# Tasks: Fix npm publish Unsupported Media Type Hard link error

## Step 1: Root Package Config Adjustment
- [x] Edit `package.json` in the root of the workspace to:
  - Replace the general `"servers/dashboard/"` wildcard in `"files"` with specific files and subfolders that are required at runtime:
    - `"servers/dashboard/bin/"`
    - `"servers/dashboard/dist/"`
    - `"servers/dashboard/config-examples/"`
    - `"servers/dashboard/package.json"`
    - `"servers/dashboard/README.md"`

## Step 2: Verification
- [x] Run `npm pack --dry-run` at the root and verify that `servers/dashboard/node_modules/` is not included in the tarball files.
- [x] Verify that source files under `servers/dashboard/src/` and `servers/dashboard/ui/` (except the compiled outputs inside `dist/`) are excluded from the tarball files.
- [x] Bump version to `0.13.3` to publish a fresh version with this fix.
