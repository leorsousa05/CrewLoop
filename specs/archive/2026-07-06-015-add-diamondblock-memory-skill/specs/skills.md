# Specification: Add Diamondblock Memory Skill

## File System Changes

We will introduce a new skill folder under the `skills/` directory and update the repository metadata documents:

```
crewloop/
├── AGENTS.md                          # Update: Register the diamondblock skill in the list
├── README.md                          # Update: Add diamondblock to the skills overview
└── skills/
    └── diamondblock/
        └── SKILL.md                   # Create: Core instructions for utilizing the MCP memory server
```

## Changes to AGENTS.md
We will append `diamondblock` under the "Supporting Skills" list, defining when it is invoked (when retrieving or updating long-term memory, context logs, and distillation).

## Changes to README.md
We will add `diamondblock` to the visual representation/list of skills.
