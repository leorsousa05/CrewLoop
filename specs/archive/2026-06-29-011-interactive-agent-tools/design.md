# Design: Interactive Agent Tools & Eco-pipeline Integration

## [Padrões Aplicados]

### 1. Mediator Pattern (Star Topology Routing)
- **Justification:** Centralizing all routing decisions in the Orchestrator decouples all execution skills (Architect, Designer, Engineer, Reviewer, Shipper) from each other. Every skill has a single output contract: returning control to the Orchestrator, which decides the next pipeline transition based on the spec checklist status.

### 2. Adapter Pattern (Conventions as Tools Interface)
- **Justification:** Defining a single shared contract in `references/conventions.md` for invoking interactive tools (`ask_question`, `schedule`, `manage_task`, `ask_permission`). This keeps individual skill instructions DRY and ensures consistent user prompt layouts for inputs/menus.

### 3. Pipeline / Chain of Responsibility Pattern (Supporting Skills delegation)
- **Justification:** Core skills can delegate sub-tasks to specialized supporting skills (e.g. Architect delegating schema design to `schema-designer`, Designer delegating React architecture to `frontend-architect`). This keeps core skills focused on system design and visual design respectively while offloading details to specialized domain skills.

### 4. Strict Encapsulation (Bundle Lock-In)
- **Justification:** Enforcing a structural constraint where agents are forbidden from executing arbitrary coding commands outside the 16 skills in the bundle. Self-consistency checkpoints are added to `AGENTS.md` and `conventions.md` to prevent execution drift.

---

## [Estratégia de Implementação]

### Phase 1: Interactive Tools & Navigation Unification
1. Update `references/conventions.md` and `references/workflow.md` to establish the star workflow and tool instructions.
2. Refactor existing skills (`crewloop-hub`, `architect`, `designer`, `engineer`, `reviewer`, `shipper`, `accessibility-auditor`, `docs-writer`, `maintainer`, `product-manager`, `researcher`, `security-guard`, `tester`) to simplified menus and tool-based navigation.
3. Remove linear workflow references from the skills (e.g. engineer direct review routing, maintainer direct engineer routing).

### Phase 2: Create 3 New Supporting Skills
Create `SKILL.md` files under `skills/` using the skill template:

#### 1. `frontend-architect` (`skills/frontend-architect/SKILL.md`)
- **Role:** Bridge visual designs with React/Next.js component implementation.
- **Workflow:** Input: Visual specification (Designer). Output: React component structure spec, component slot patterns, Props interfaces (TypeScript), state location strategy, Tailwind/style token mapping. End: Return to Orchestrator.

#### 2. `schema-designer` (`skills/schema-designer/SKILL.md`)
- **Role:** Design database structures and API schemas.
- **Workflow:** Input: System design proposal (Architect). Output: Database DDL, Prisma schemas, database migration steps, OpenAPI schemas, GraphQL types. End: Return to Orchestrator.

#### 3. `devops-specialist` (`skills/devops-specialist/SKILL.md`)
- **Role:** Implement packaging, containerization, and delivery pipelines.
- **Workflow:** Input: Project setup. Output: Dockerfiles, Docker Compose files, GitHub Actions CI/CD workflows, reverse proxy configurations. End: Return to Orchestrator.

### Phase 3: Update Root Documentation Files & Enforcement
1. Refactor `AGENTS.md` to:
   - Update the workflow Mermaid diagram, routing rules, AFK behavior, and contribution instructions.
   - Embed the "Bundle Lock-In" constraint.
2. Refactor `README.md` to:
   - Update the workflow Mermaid diagram, rules, and the step 4 contributing workflow reference.
3. Update `references/conventions.md` to include:
   - The CLI output format schemas for all skills.
   - The Bundle Lock-In self-consistency check instructions.

### Phase 4: Validation & Quality Control
1. Run `python3 scripts/validate-skills.py` to ensure all 16 skills are compliant with frontmatter and CLI rules.
