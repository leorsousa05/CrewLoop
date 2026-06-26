# Design: Remove second-brain integration and enforce navigation menus

## Overview

This is a documentation-first and packaging-first cleanup. The repository will stop exposing
the current Obsidian memory layer as an active part of the CrewLoop product surface. The
change also hardens the workflow contract that every skill must end with a letter-based menu
unless AFK mode was explicitly activated by the user.

## Architecture and patterns

- Pattern: SDD. The spec becomes the source of truth for retiring the current integration.
- Pattern: CDD. Skill instructions are treated as formal behavioral contracts for agents.
- Pattern: Context Engineering. Shared menu rules live in references and are repeated in the
  active skills where omission has practical impact.

## Directory impact

```text
CrewLoop/
|-- AGENTS.md                               modify
|-- README.md                               modify
|-- package.json                            modify
|-- docs/
|   |-- docs/
|   |   |-- concepts.md                     modify
|   |   |-- installation.md                 modify
|   |   |-- intro.md                        modify
|   |   |-- supporting/
|   |   |   `-- obsidian-second-brain.md    delete
|   |   `-- workflow/
|   |       `-- afk-mode.md                 modify
|   `-- sidebars.js                         modify
|-- evals/
|   |-- evals.json                          modify
|   `-- trigger-eval.json                   modify
|-- packages/
|   `-- cli/
|       `-- src/
|           |-- cli.ts                      modify
|           `-- mcp.ts                      delete
|-- references/
|   |-- conventions.md                      modify
|   |-- workflow.md                         modify
|   `-- obsidian-mcp-usage.md               delete
|-- skills/
|   |-- accessibility-auditor/SKILL.md      modify
|   |-- architect/SKILL.md                  modify
|   |-- designer/SKILL.md                   modify
|   |-- docs-writer/SKILL.md                modify
|   |-- engineer/SKILL.md                   modify
|   |-- maintainer/SKILL.md                 modify
|   |-- obsidian-second-brain/SKILL.md      delete
|   |-- orchestrator/SKILL.md               modify
|   |-- product-manager/SKILL.md            modify
|   |-- researcher/SKILL.md                 modify
|   |-- reviewer/SKILL.md                   modify
|   |-- security-guard/SKILL.md             modify
|   |-- shipper/SKILL.md                    modify
|   `-- tester/SKILL.md                     modify
`-- specs/
    `-- living/
        |-- cli/spec.md                     modify
        |-- obsidian-mcp/spec.md            delete
        `-- obsidian-second-brain/          delete
```

## Behavioral changes

### 1. Navigation menus

Every active skill must state a final-response rule equivalent to:

- End every completed response with `**What would you like to do?**`
- Include the relevant letter-based options
- Wait for user confirmation
- Only skip the menu in explicit AFK mode

This rule must appear in shared conventions and directly in each active skill where the agent
is expected to hand off work.

### 2. Memory/Obsidian removal

The following active behaviors are removed:

- Automatic invocation of `obsidian-second-brain`
- Instructions to read or write `~/.lea`
- Packaging and installation of `servers/obsidian-mcp/`
- Product and docs claims that second-brain support is part of the current workflow
- Active living specs that document the retired second-brain capability

## Risks and mitigations

- Risk: some generated or built docs may still mention Obsidian.
  Mitigation: update source docs and sidebar; leave generated artifacts alone if they are
  build output and not source-of-truth.

- Risk: removing CLI installation hooks may leave dead code/tests.
  Mitigation: remove active imports/calls tied to MCP installation and adjust active metadata.

- Risk: menu omission may continue if rules stay implicit.
  Mitigation: place the rule both in `references/conventions.md` and inside each active
  skill's response rules section.
