# Docs-Writer

**Phase:** Documentation

The Docs-Writer produces clear, actionable documentation tailored to the project type and audience. It is invoked by the Orchestrator for pure documentation tasks or by the Architect when docs are part of a larger change.

## What the Docs-Writer does

The Docs-Writer is a technical documentation specialist. It writes READMEs, module docs, feature docs, API docs, and any other project documentation.

### Core responsibilities

1. **Understand the audience**
   - Internal developers, external users, contributors, operators?
   - What do they need to know?

2. **Read existing docs and specs**
   - Avoid duplicating content.
   - Align with the project's tone and structure.

3. **Write or rewrite documentation**
   - READMEs
   - Module/feature documentation
   - API reference
   - Capability docs
   - Changelog entries

4. **Follow documentation conventions**
   - Clear structure.
   - Code examples where useful.
   - Accurate and up-to-date information.

## When to invoke

The Docs-Writer triggers when:

- The user says "write a README", "rewrite README", "create documentation", "document this module".
- The Orchestrator determines the task is purely documentation with no code changes.
- The Architect routes documentation work here.

## Concrete example

**User:** "Document the auth module."

**Docs-Writer:**

1. Reads the auth module code and existing README.
2. Produces `docs/auth.md` with:
   - Overview
   - Installation
   - API reference
   - Usage examples
   - Error handling
3. Presents the menu:
   ```
   [O] Back to Orchestrator
   [A] Send to Architect — Need specs or architectural docs
   [E] Send to Engineer — Need code changes alongside docs
   [S] Send to Shipper — Commit and ship the documentation
   ```

## Output artifact: Documentation

| Type | Examples |
|------|----------|
| README | Project overview, quick start |
| Module docs | API reference, usage examples |
| Feature docs | How a feature works |
| Changelog | Release notes |

## Handoff

**Next skill:** Orchestrator, Architect, Engineer, or Shipper depending on context.
