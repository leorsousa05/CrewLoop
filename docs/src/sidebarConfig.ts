import type { SidebarConfig } from './types';

export const sidebarConfig: SidebarConfig = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    items: [
      { id: 'getting-started/what-is-crewloop', title: 'What is CrewLoop', path: '/docs/getting-started/what-is-crewloop.md' },
      { id: 'getting-started/why-crewloop', title: 'Why CrewLoop', path: '/docs/getting-started/why-crewloop.md' },
      { id: 'getting-started/installation', title: 'Installation', path: '/docs/getting-started/installation.md' },
      { id: 'getting-started/first-task', title: 'First Task', path: '/docs/getting-started/first-task.md' }
    ]
  },
  {
    id: 'concepts',
    label: 'Core Concepts',
    items: [
      { id: 'concepts/skills-and-roles', title: 'Skills and Roles', path: '/docs/concepts/skills-and-roles.md' },
      { id: 'concepts/workflow', title: 'Workflow', path: '/docs/concepts/workflow.md' },
      { id: 'concepts/specs', title: 'Specs Structure', path: '/docs/concepts/specs.md' },
      { id: 'concepts/navigation-and-afk', title: 'Navigation and AFK', path: '/docs/concepts/navigation-and-afk.md' },
      { id: 'concepts/conventional-commits', title: 'Conventional Commits', path: '/docs/concepts/conventional-commits.md' }
    ]
  },
  {
    id: 'core-skills',
    label: 'Core Skills',
    items: [
      { id: 'core/crewloop-hub', title: 'CrewLoop Hub', path: '/docs/core/crewloop-hub.md' },
      { id: 'core/crewloop-plan', title: 'CrewLoop Plan', path: '/docs/core/crewloop-plan.md' },
      { id: 'core/crewloop-design', title: 'CrewLoop Design', path: '/docs/core/crewloop-design.md' },
      { id: 'core/crewloop-code', title: 'CrewLoop Code', path: '/docs/core/crewloop-code.md' },
      { id: 'core/crewloop-review', title: 'CrewLoop Review', path: '/docs/core/crewloop-review.md' },
      { id: 'core/crewloop-ship', title: 'CrewLoop Ship', path: '/docs/core/crewloop-ship.md' }
    ]
  },
  {
    id: 'supporting-skills',
    label: 'Supporting Skills',
    items: [
      { id: 'supporting/crewloop-brainstorm', title: 'CrewLoop Brainstorm', path: '/docs/supporting/crewloop-brainstorm.md' },
      { id: 'supporting/crewloop-docs', title: 'CrewLoop Docs', path: '/docs/supporting/crewloop-docs.md' }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'tools/cli', title: 'CLI', path: '/docs/tools/cli.md' },
      { id: 'tools/dashboard', title: 'Dashboard', path: '/docs/tools/dashboard.md' },
      { id: 'tools/workflow-test', title: 'Workflow Integration Testing', path: '/docs/tools/workflow-test.md' }
    ]
  },
  {
    id: 'contributing',
    label: 'Contributing',
    items: [
      { id: 'contributing/writing-a-skill', title: 'Writing a Skill', path: '/docs/contributing/writing-a-skill.md' },
      { id: 'contributing/repository-structure', title: 'Repository Structure', path: '/docs/contributing/repository-structure.md' },
      { id: 'contributing/conventions', title: 'Conventions', path: '/docs/contributing/conventions.md' },
      { id: 'contributing/publishing', title: 'Publishing', path: '/docs/contributing/publishing.md' }
    ]
  }
];
