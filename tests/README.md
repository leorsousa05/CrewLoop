# Tests

CrewLoop is documentation-first, but its CLI and dashboard have automated regression suites. The dashboard also has a reproducible browser acceptance matrix.

## Validation

Run the skill validator to check all `SKILL.md` files:

```bash
python scripts/validate-skills.py
```

Run the workflow contract tests for the non-blocking Plan/Design handoff:

```bash
python -m unittest scripts.tests.test_automated_workflow
```

For the dashboard regression suite:

```bash
cd servers/dashboard
npm run typecheck
npm run build
npm test
```

The dashboard test command covers server security and filesystem boundaries, event contracts, lifecycle/state behavior, all supported adapters, token telemetry, client projection/filter/settings logic, request races, and UI accessibility/live-state contracts.

For the reproducible browser preflight, start the production dashboard and Chrome with a local CDP endpoint, then run from `servers/dashboard/`:

```bash
npm run acceptance:browser -- --url http://127.0.0.1:7890/ --cdp http://127.0.0.1:9229
```

The command emits JSON Lines for all `112/112` view, viewport, theme, and density combinations. It checks render state, horizontal overflow, and visible interactive accessible names through CDP. It does not launch Chrome, touch an existing tab, or replace the manual screen-reader, keyboard, contrast, async-state, and visual walkthrough in the [dashboard acceptance matrix](dashboard-acceptance-matrix.md).

To add the bounded interaction checkpoint to the same run, pass `--interaction-smoke`:

```bash
npm run acceptance:browser -- --url http://127.0.0.1:7890/ --cdp http://127.0.0.1:9229 --summary --interaction-smoke
```

This adds checks for mobile overlays and focus restoration, keyboard-opening the empty session selector, reduced-motion persistence, hash history restoration, and external font requests. The interaction summary fails closed on an invariant failure; with `--summary`, it is nested in the single final summary object. These checks remain automated evidence and do not replace the manual matrix.

## Dashboard Manual Testing

Use the [dashboard acceptance matrix](dashboard-acceptance-matrix.md) for the required view, viewport, theme, density, keyboard, async-state, and reduced-motion walkthrough. Record the browser, OS, commit, actual viewport, and observed result before marking a row complete.

## Skill Manual Testing

To test a skill in practice:

1. Install the skills to your agent's skills directory:
   ```bash
   ./scripts/install.sh
   ```

2. Start a new conversation with your AI agent and use a prompt that should trigger the skill.

3. Observe whether the skill activates and follows its workflow correctly.

## Future Work

- Add trigger evals to measure how well skill descriptions activate the right skill.
- Add output evals for skills with objectively verifiable behavior.
