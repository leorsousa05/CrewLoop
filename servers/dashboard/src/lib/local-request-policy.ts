export interface LocalRequestPolicyOptions {
  host: string;
  port: number;
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function parseHostHeader(host: string): { name: string; port: number | null } | undefined {
  const value = host.trim().toLowerCase();
  if (value.startsWith('[')) {
    const closing = value.indexOf(']');
    if (closing === -1) return undefined;
    const name = value.slice(0, closing + 1);
    const rest = value.slice(closing + 1);
    if (rest === '') return { name, port: null };
    if (!rest.startsWith(':')) return undefined;
    const port = Number(rest.slice(1));
    return Number.isInteger(port) && port > 0 ? { name, port } : undefined;
  }
  const colon = value.lastIndexOf(':');
  if (colon === -1) return { name: value, port: null };
  const name = value.slice(0, colon);
  const port = Number(value.slice(colon + 1));
  if (!name || !Number.isInteger(port) || port <= 0) return undefined;
  return { name, port };
}

export interface LocalRequestPolicy {
  acceptsHost(host: string | undefined): boolean;
  acceptsWebSocketOrigin(origin: string | undefined): boolean;
}

export function createLocalRequestPolicy(options: LocalRequestPolicyOptions): LocalRequestPolicy {
  function acceptsHost(host: string | undefined): boolean {
    if (!host) return false;
    const parsed = parseHostHeader(host);
    if (!parsed || parsed.port !== options.port) return false;
    return LOOPBACK_HOSTS.has(parsed.name);
  }

  function acceptsWebSocketOrigin(origin: string | undefined): boolean {
    if (origin === undefined) return true;
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      return false;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
    if (!LOOPBACK_HOSTS.has(hostname)) return false;
    return parsed.port === String(options.port);
  }

  return { acceptsHost, acceptsWebSocketOrigin };
}
