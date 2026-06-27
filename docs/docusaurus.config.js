// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CrewLoop',
  tagline: 'An AI agent crew for the complete software development flow.',

  future: {
    v4: true,
  },

  // GitHub Pages deployment config
  url: 'https://leorsousa05.github.io',
  baseUrl: '/CrewLoop/',

  organizationName: 'leorsousa05',
  projectName: 'CrewLoop',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/leorsousa05/CrewLoop/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: ({
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CrewLoop',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: 'docs/getting-started/installation',
          label: 'Install',
          position: 'left',
        },
        {
          to: 'docs/core/orchestrator',
          label: 'The Crew',
          position: 'left',
        },
        {
          href: 'https://github.com/leorsousa05/CrewLoop',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: 'docs/getting-started/what-is-crewloop' },
            { label: 'The Crew', to: 'docs/core/orchestrator' },
            { label: 'Workflow', to: 'docs/concepts/workflow' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/leorsousa05/CrewLoop' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CrewLoop. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  }),
};

export default config;
