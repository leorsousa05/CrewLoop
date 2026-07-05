export interface DocItem {
  id: string;      // e.g., 'getting-started/what-is-crewloop'
  title: string;   // e.g., 'What is CrewLoop'
  path: string;    // public URL to the .md file, e.g., '/docs/getting-started/what-is-crewloop.md'
}

export interface SidebarCategory {
  id: string;
  label: string;
  items: DocItem[];
  collapsed?: boolean;
}

export type SidebarConfig = SidebarCategory[];
