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
      { id: 'core/architect', title: 'Architect', path: '/docs/core/architect.md' },
      { id: 'core/designer', title: 'Designer', path: '/docs/core/designer.md' },
      { id: 'core/engineer', title: 'Engineer', path: '/docs/core/engineer.md' },
      { id: 'core/reviewer', title: 'Reviewer', path: '/docs/core/reviewer.md' },
      { id: 'core/shipper', title: 'Shipper', path: '/docs/core/shipper.md' }
    ]
  },
  {
    id: 'supporting-skills',
    label: 'Supporting Skills',
    items: [
      { id: 'supporting/project-brainstorm', title: 'Project Brainstorm', path: '/docs/supporting/project-brainstorm.md' },
      { id: 'supporting/long-term-manager', title: 'Long-term Manager', path: '/docs/supporting/long-term-manager.md' },
      { id: 'supporting/docs-writer', title: 'Docs Writer', path: '/docs/supporting/docs-writer.md' },
      { id: 'supporting/tester', title: 'Tester', path: '/docs/supporting/tester.md' },
      { id: 'supporting/product-manager', title: 'Product Manager', path: '/docs/supporting/product-manager.md' },
      { id: 'supporting/maintainer', title: 'Maintainer', path: '/docs/supporting/maintainer.md' },
      { id: 'supporting/researcher', title: 'Researcher', path: '/docs/supporting/researcher.md' },
      { id: 'supporting/security-guard', title: 'Security Guard', path: '/docs/supporting/security-guard.md' },
      { id: 'supporting/accessibility-auditor', title: 'Accessibility Auditor', path: '/docs/supporting/accessibility-auditor.md' }
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
