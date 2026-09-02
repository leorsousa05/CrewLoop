export interface PageLocation {
  protocol: string;
  host: string;
}

export function dashboardWebSocketUrl(page: PageLocation): string {
  const protocol = page.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${page.host}/ws`;
}
