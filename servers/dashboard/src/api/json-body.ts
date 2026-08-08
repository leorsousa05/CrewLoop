import type { IncomingMessage } from 'node:http';

export class PayloadTooLargeError extends Error {
  constructor() {
    super('Payload too large');
    this.name = 'PayloadTooLargeError';
  }
}

export function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > maxBytes) {
        tooLarge = true;
        body = '';
        return;
      }
      if (!tooLarge) body += chunk;
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(new PayloadTooLargeError());
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}
