# Tasks: DiamondBlock Runtime Integration and Lifecycle

## Setup and Baseline

- [x] Create full spec 033 and ADR 006.
- [x] Record baseline CLI typecheck/build/test and skill validation results.
- [x] Confirm current `diamondblock install --help` contract and document the observed CLI version.
- [x] Do not start implementation until the user approves this spec.

## CLI Contracts

- [x] Add `diamondblock?: boolean` and parse `--diamondblock` only for `crewloop install`.
- [x] Update command/global help and examples to explain opt-in and dry-run behavior.
- [x] Create `packages/cli/src/diamondblock.ts` with injected PATH lookup and subprocess execution.
- [x] Build argument arrays without shell interpolation.
- [x] Resolve `diamondblock` before `dblock` and return actionable unavailable status.
- [x] Preflight `install --dry-run` before any CrewLoop mutation when opt-in is requested.
- [x] Forward explicit `--agent` as `--target`; leave target absent for official auto-detection.
- [x] Forward CrewLoop `--dry-run` and guarantee no mutation.
- [x] Execute official install after CrewLoop skills/hooks and report partial-state failure accurately.
- [x] Keep normal install byte-for-byte behaviorally unchanged when the flag is absent.

## Doctor

- [x] Add DiamondBlock skill-presence check.
- [x] Add `diamondblock`/`dblock` PATH check.
- [x] Add injected bounded official dry-run preflight for installer readiness.
- [x] Report DiamondBlock absence/readiness as optional warning/ok without changing Doctor exit code to error.
- [x] State explicitly that runtime activation requires exposed MCP tools inside the agent.
- [x] Never parse or write agent MCP config from Doctor.

## Runtime Workflow Contracts

- [x] Update Hub to check exposed capabilities and load DiamondBlock directly before broad discovery.
- [x] Remove ambiguous “diamondblock-focused subagent” wording as the primary route.
- [x] Define verified project/session identifier sources and prohibit fabricated IDs.
- [x] Keep targeted repeated `search_memory` use and manual index fallback.
- [x] Search before saving and persist only user-confirmed/accepted distilled decisions.
- [x] Update Shipper to request post-push `log_session` outside AFK, then resume Shipper menu.
- [x] Update AFK contract so Hub owns wrap-up logging after Shipper return.
- [x] Ensure every MCP failure warns once and returns to the correct invoker without blocking.
- [x] Preserve all existing transition-menu keys and recommended routes.

## Tests

- [x] Parser accepts `install --diamondblock` and rejects the flag on unrelated commands.
- [x] Help tests cover option, examples, opt-in warning, and skill-vs-MCP distinction.
- [x] Adapter tests cover executable precedence, missing binary, argument construction, target, dry-run, non-zero exit, and bounded output.
- [x] Install command tests prove absent flag makes zero DiamondBlock calls.
- [x] Install command tests prove preflight occurs before mutation and aborts safely.
- [x] Install dry-run tests prove both systems remain mutation-free.
- [x] Install success/final failure tests cover output and exit codes.
- [x] Doctor tests cover absent skill, absent binary, ready installer, unsupported target, and optional exit semantics.
- [x] Skill validation verifies Hub, DiamondBlock, and Shipper transition contracts.
- [x] Add textual contract assertions only where structural validation cannot cover mandatory lifecycle wording.

## Documentation

- [x] Update CLI README and AGENTS with flag, delegation boundary, outputs, and test strategy.
- [x] Update root README/AGENTS with skill-vs-MCP distinction and lifecycle.
- [x] Update installation docs with official prerequisite, opt-in example, dry-run, Doctor, and manual indexing.
- [x] Update skills/workflow docs with startup, repeated search, decision persistence, and wrap-up.
- [x] Merge final behavior into CLI and supporting-team living specs.
- [x] Mark spec 017 superseded in part and prepare it for Shipper archival without erasing history.

## Verification

- [x] Run `npm run typecheck` in `packages/cli/`.
- [x] Run `npm run build` in `packages/cli/`.
- [x] Run `npm test` in `packages/cli/`.
- [x] Run `python scripts/validate-skills.py` from repository root.
- [x] Run publish dry-run if package file inclusion changes.
- [x] Inspect diff for real config paths, secrets, raw vault data, debug logs, empty catches, generated artifacts, and unrelated work.

## Completion

- [x] Reviewer verifies subprocess safety, optionality, transition routing, and test evidence.
- [x] Bump CLI and root package versions according to final release scope during shipping.
- [x] Update `.spec.yaml` to completed and archive during shipping.
