---
sidebar_position: 5
---

# Conventional Commits

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. The **Shipper** skill generates commit messages — you never write them manually.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

- **type** — what kind of change
- **scope** — the module, component, or domain affected
- **description** — imperative mood, max 72 characters, no trailing period
- **body** — explains the *why* (optional, for non-trivial changes)
- **footer** — issue references like `Closes #42` (optional)

## Allowed types

| Type | Use when |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD pipeline changes |
| `chore` | Maintenance, config, tooling |
| `revert` | Reverting a previous commit |

## Branch naming

```
<type>/<short-description>
```

- kebab-case, max 50 characters
- Examples: `feat/product-search-bar`, `fix/auth-token-expiry`, `docs/cli-reference`

## Real examples

```bash
git commit -m "feat(search): add debounced product search bar"
git commit -m "fix(auth): handle token expiry on refresh"
git commit -m "docs: restructure public documentation"
git commit -m "test(checkout): fix race condition in async setup"
```
