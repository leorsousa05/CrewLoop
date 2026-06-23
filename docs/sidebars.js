// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'why-crewloop',
    'concepts',
    'installation',
    {
      type: 'category',
      label: 'The Crew',
      link: {
        type: 'generated-index',
        description: 'Deep guides for every CrewLoop skill.',
      },
      items: [
        {
          type: 'category',
          label: 'Core Skills',
          link: {
            type: 'generated-index',
            description: 'The mandatory flow: Orchestrator → Architect → Designer/Engineer → Reviewer → Shipper.',
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
            'supporting/docs-writer',
            'supporting/tester',
            'supporting/product-manager',
            'supporting/maintainer',
            'supporting/researcher',
            'supporting/obsidian-second-brain',
            'supporting/security-guard',
            'supporting/accessibility-auditor',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Workflow',
      link: {
        type: 'generated-index',
        description: 'How tasks flow through the crew end to end.',
      },
      items: [
        'workflow/overview',
        'workflow/detailed-flow',
        'workflow/decision-trees',
        'workflow/artifacts',
        'workflow/afk-mode',
      ],
    },
    'usage-examples',
    'contributing',
  ],
};

export default sidebars;
