# Bootstrap Helper Delta

## Added
- `scripts/bootstrap-vite.sh`

## Behavior Contract
- The helper scaffolds a Vite project only when explicitly invoked.
- The helper must accept a target path and a template choice.
- The helper should make its actions obvious in stdout/stderr and exit non-zero on invalid input.
- The helper must not install dependencies unless the user explicitly requests that behavior.

## Non-Goals
- No hidden project creation.
- No automatic deployment.
- No mutation outside the requested target directory.
