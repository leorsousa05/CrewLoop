# Proposal: Stronger Designer Direction and Optional Vite Bootstrap

## Motivation
The current Designer skill is directionally correct but still allows visually generic outcomes when the model fills in gaps with default SaaS aesthetics. The user wants the skill to reliably produce sharper, more deliberate interfaces with the kind of visual identity seen in products like Lovable, Bolt, Vercel, and Manus.

The user also wants optional helper scripts for cases where a new frontend project should be scaffolded first, especially Vite-based starts. Today that path is implicit rather than clearly supported, which makes the workflow feel incomplete.

## Scope
- Harden `skills/designer/SKILL.md` so it:
  - commits to one visual thesis instead of a generic direction,
  - requires deeper reference reading,
  - rejects common AI-default visual patterns explicitly,
  - and emits a more rigorous, case-study-like design brief.
- Expand `skills/designer/references/` with a larger reference pack:
  - anti-patterns and critique guidance,
  - layout, color, typography, motion, and case-study templates,
  - and a reference index so the skill can navigate the library consistently.
- Add an optional shell helper:
  - `scripts/bootstrap-vite.sh`
  - intended to scaffold a Vite app when the user explicitly chooses that route.
- Update docs that describe the skill and writing workflow so the new reference stack and bootstrap option are discoverable.

## Constraints
- Keep the CrewLoop workflow intact: Architect first, then Designer for UI-related changes, then Engineer.
- Do not make the Designer interactive. It should still consume the brief and produce the design spec directly.
- Do not turn the bootstrap script into an always-on installer. It must remain an explicit helper, not a hidden side effect.
- Preserve the documentation-first nature of the repository. The script is a helper artifact, not a runtime dependency.
