# 2026-08-15 Frontend Design Skill Rewrite

## What was done

- Rewrote `skills/crewloop-design/SKILL.md` in full, porting the Anthropic Frontend Design skill's process and philosophy into CrewLoop's voice: subject grounding, hero-as-thesis, deliberate display/body/utility type pairing, structure-as-information, motion restraint, copy guidance (user-side naming, active voice, errors/emptiness as direction).
- Added a mandatory two-pass process: Pass 1 brainstorm (4–6 named hex palette, 2+ typeface roles, layout concept with ASCII wireframes, one signature element); Pass 2 critique against generic-default drift, recording what changed and why.
- Named and rejected the three AI-default clusters (cream/serif/terracotta, near-black/acid accent, broadsheet hairlines) — the brief's pinned direction always wins.
- Demoted the references/ library (registers, surfaces, playbooks) to optional inspiration; `quiet-product` is no longer the default register.
- Kept the CrewLoop wrapper intact: frontmatter, transition contract (byte-identical to `skill-contracts.yaml`), design-spec-only deliverables for `crewloop:code`, quality floor (responsive, focus, reduced motion).
- Adapted the critique step to spec-based work: screenshot critique of the rendered page is documented as `crewloop:code`/`crewloop:review` responsibility.

## Decisions

- Full rewrite in CrewLoop's own voice — no verbatim Anthropic text blocks.
- Existing `references/` library kept but demoted to optional material.
- New philosophy supersedes the old quiet-product restraint default; restraint survives as "spend boldness in one place".

## Verification

- `python3 scripts/validate-skills.py` → 7 PASS, exit 0.
- Review verdict PASS (Low risk); git diff limited to `skills/crewloop-design/SKILL.md` plus spec-039.
