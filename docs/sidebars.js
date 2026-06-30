// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      link: {
        type: 'generated-index',
        description: 'Learn how to get up and running with CrewLoop.',
      },
      items: [
        'getting-started/what-is-crewloop',
        'getting-started/why-crewloop',
        'getting-started/installation',
        'getting-started/first-task',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      link: {
        type: 'generated-index',
        description: 'Understand the underlying philosophy and mechanics of the workflow.',
      },
      items: [
        'concepts/skills-and-roles',
        'concepts/workflow',
        'concepts/specs',
        'concepts/navigation-and-afk',
        'concepts/conventional-commits',
      ],
    },
    {
      type: 'category',
      label: 'The Crew',
      link: {
        type: 'generated-index',
        description: 'Reference for all 14 CrewLoop skills.',
      },
      items: [
        {
          type: 'category',
          label: 'Core Skills',
          link: {
            type: 'generated-index',
            description: 'The mandatory six-skill flow.',
          },
          items: [
            'core/orchestrator',
            'core/architect',
            'core/designer',
            'core/engineer',
            'core/reviewer',
            'core/shipper',
          ],
        },
        {
          type: 'category',
          label: 'Supporting Skills',
          link: {
            type: 'generated-index',
            description: 'Optional advisors that extend the core flow.',
          },
          items: [
            'supporting/project-brainstorm',
            'supporting/docs-writer',
            'supporting/tester',
            'supporting/product-manager',
            'supporting/maintainer',
            'supporting/researcher',
            'supporting/security-guard',
            'supporting/accessibility-auditor',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Tools',
      link: {
        type: 'generated-index',
        description: 'The tooling ecosystem built around the skills.',
      },
      items: [
        'tools/cli',
        'tools/dashboard',
        'tools/obsidian-mcp',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      link: {
        type: 'generated-index',
        description: 'Guidelines for extending the skills and CLI.',
      },
      items: [
        'contributing/writing-a-skill',
        'contributing/repository-structure',
        'contributing/conventions',
        'contributing/publishing',
      ],
    },
  ],
};

export default sidebars;
