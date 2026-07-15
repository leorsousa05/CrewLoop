# Proposal: Unified Skill Transition and AFK Contracts

## Problem Statement

The direct-routing migration removed typed slash-command handoffs, but the 19 skills now contain contradictory local routing, invoker, prefix, and AFK instructions. Behavioral probes produced correct role boundaries but exposed ambiguous or incorrect transitions, including supporting skills bypassing the CrewLoop Hub in AFK mode, mismatched handoff summaries, an unmatched Markdown fence, and skills with no explicit AFK contract.

The canonical transition table is maintained as prose and duplicated manually. The current validator checks only basic frontmatter, so it cannot detect the defects observed in Project Brainstorm, Maintainer, Security Guard, Accessibility Auditor, Tester, Frontend Architect, Schema Designer, DevOps Specialist, and supporting skills without explicit AFK behavior.

## Goals

1. Preserve direct routing outside AFK and Hub-mediated routing in AFK.
2. Define every skill's prefix, default invoker, menu, and AFK destination in a machine-readable authoring contract.
3. Keep critical authority and transition invariants inline in every runtime `SKILL.md`, with later workflow instructions explicitly qualified so they cannot override AFK.
4. Normalize all 19 skills atomically so no mixed routing protocol remains.
5. Extend validation to detect malformed Markdown, invalid links, contract drift, and incorrect skill inventory.
6. Preserve no-command handoffs: after a user selects an option, load the selected skill directly.
7. Make templates and authoring guidance produce contract-compliant future skills.

## Non-Goals

- Changing the core phase order.
- Slimming skill prompts or implementing progressive disclosure.
- Measuring token or context-window consumption.
- Changing the installer, agent loaders, hooks, or dashboard.
- Generating `SKILL.md` files automatically from the manifest.
- Replacing inline safety boundaries with runtime pointers.

## Success Criteria

- All 19 skills have explicit role prefixes and transition behavior.
- Every non-Hub skill returns to CrewLoop Hub in AFK mode; the Hub alone selects the next skill.
- Supporting skills return to their actual invoker outside AFK, except Maintainer and Project Brainstorm, which route completed triage/briefs to Architect by design.
- Architect and Designer remain non-interactive and hand off directly.
- The 76-scenario behavioral matrix passes without ambiguous or incorrect outcomes.
- Validator fixture tests detect current known failures and all source skills pass.
- No current document reports 18 skills or describes hub-and-spoke as the interactive default.
- Post-selection turns contain no typed command requirement and do not repeat the menu.
