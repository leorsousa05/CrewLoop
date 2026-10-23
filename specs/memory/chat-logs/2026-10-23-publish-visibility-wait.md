# Publish visibility wait

- Scope: the `Publish CrewLoop to npm` workflow went red on the 0.22.2 and 0.23.0 releases even though both versions were published.
- Evidence from the GitHub Actions jobs API: `Publish package` succeeded; `Wait for package to be available` failed after 64 s (12 × 5 s). npm registered 0.23.0 about 100 s after the publish step ended.
- A second cause: `npm view` serves the cached packument, so polling without `--prefer-online` can keep reading pre-publish data.
- Spec 066: poll with `--prefer-online` for up to ~5 minutes (`WAIT_ATTEMPTS` 30 × `WAIT_SECONDS` 10) and emit a `::warning::` instead of failing; `npm publish` stays the only publish gate.
- Tests: a workflow contract test plus two stub-npm behavioral tests that run the real step script (visible on the 3rd call; never visible, with stub 404 exits). Windows 36 OK with 2 bash tests skipped by design; Linux (WSL) 4/4. The isolated review confirmed the new tests fail against the old step.
- `publishing.md` now describes the check as warning-only.
- Shipped without a version bump: `release-tag` skips the existing `v0.23.0` tag and `publish-npm` skips a commit with no matching tag, so nothing was published.
- The Sep 30 failure (`22179ff`) failed in `Publish package` itself and is out of scope.
