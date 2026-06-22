# Design: Skill Bundle Memory Alignment

## Overview
Align all skill instructions with the `~/.lea` three-layer memory architecture documented in `references/obsidian-mcp-usage.md`. Each affected skill will name the correct vault layer for its role and remove obsolete flat-folder references.

## Proposed Directory & File Structure
```
loop-engineering-agents/
├── specs/
│   └── changes/
│       └── 001-align-skills-with-lea-memory-architecture/
│           ├── .spec.yaml
│           ├── proposal.md
│           ├── specs/
│           │   └── spec.md
│           ├── design.md
│           └── tasks.md
└── skills/
    ├── obsidian-second-brain/
    │   └── SKILL.md              (Modified: trigger description)
    ├── architect/
    │   └── SKILL.md              (Modified: ADR locations)
    ├── shipper/
    │   └── SKILL.md              (Modified: journal link step)
    ├── tester/
    │   └── SKILL.md              (Modified: layer-specific search targets)
    ├── maintainer/
    │   └── SKILL.md              (Modified: layer-specific search targets)
    ├── product-manager/
    │   └── SKILL.md              (Modified: layer-specific search targets)
    └── researcher/
        └── SKILL.md              (Modified: layer-specific search targets)
```

## 7 Analysis Questions
1. **Domain and bounded context placement?** The change is in the documentation/skill-bundle bounded context. It governs how agents interact with the external `~/.lea` vault.
2. **Core responsibilities of changed components?** Each skill must accurately describe when to invoke the second brain and which vault layer to read or write.
3. **Contracts (interfaces, types, APIs) to define or change?** No code contracts change. The skill markdown is the only interface.
4. **Which parts need tests per TDD skip criteria?** No automated tests. Verification is static: `validate-skills.py` and grep.
5. **Architecture that minimizes ambiguity?** The three-layer model is already defined; alignment makes instructions deterministic by naming exact layers.
6. **Project structure changes needed?** New spec folder only. No new skills or runtime files.
7. **Key trade-offs?** Optional tightening adds precision but slightly more text. Keeping project ADRs in `specs/decisions/` preserves separation from vault `Knowledge/`.

## Exact Text Changes
| File | Location | Current | New |
| `obsidian-second-brain/SKILL.md` | description | "prior decisions, concepts, project history, dashboards" | "prior decisions in Knowledge/ or Journal/, durable knowledge in Knowledge/, session outcomes in Journal/, user profile facts in Memory/, temporary drafts in Notes/" |
| `architect/SKILL.md` | MEMORY & CONTEXT | None | Add: "Project ADRs live in `specs/decisions/`; vault decisions and durable knowledge live in `Knowledge/`." |
| `architect/SKILL.md` | Brownfield discovery step 6 | "`docs/decisions/` or similar" | "`specs/decisions/` for project ADRs and `Knowledge/` for vault decisions" |
| `shipper/SKILL.md` | Step 7 placeholder | Commented block | Actionable bullet to invoke `obsidian-second-brain` to move link in `Journal/loop-engineering-agents.md` |
| `tester/SKILL.md` | MCP Tools Reference | "Find prior testing decisions or bug patterns in `~/.lea`" | "Find prior testing heuristics in `Knowledge/` and bug patterns in `Journal/bugs*`" |
| `maintainer/SKILL.md` | MCP Tools Reference | "Find prior incidents or debt decisions in `~/.lea`" | "Find prior runbooks and debt decisions in `Knowledge/` and incidents in `Journal/incidents*`" |
| `product-manager/SKILL.md` | MCP Tools Reference | "Find prior product decisions or user feedback in `~/.lea`" | "Find prior product decisions and success metrics in `Knowledge/` and user feedback in `Journal/`" |
| `researcher/SKILL.md` | MCP Tools Reference | "Find prior research or technology decisions in `~/.lea`" | "Find prior research and technology decisions in `Knowledge/` and experiment results in `Journal/`" |

## Code Architecture & Design Patterns
- Documentation-only. No runtime code.
- Pattern: Single-responsibility per skill; each skill owns its memory targets.

## Subagent Parallelization Analysis
Edits touch independent files, but each change is small and a final consistency grep must cover all files. Coordination overhead outweighs benefit. **Do not use subagents.**

## Security Considerations
- No secrets. Changes only clarify allowed vault layers and reinforce the rule against direct `~/.lea` access.
