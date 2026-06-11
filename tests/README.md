# Tests

This project is primarily documentation, so it does not have a traditional automated test suite.

## Validation

Run the skill validator to check all `SKILL.md` files:

```bash
python scripts/validate-skills.py
```

## Manual Testing

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
