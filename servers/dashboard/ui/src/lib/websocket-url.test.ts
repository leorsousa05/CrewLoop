import { describe, expect, it } from 'vitest';
import { dashboardWebSocketUrl } from './websocket-url';

describe('dashboardWebSocketUrl', () => {
  it('uses ws for an http page', () => {
    expect(dashboardWebSocketUrl({ protocol: 'http:', host: '127.0.0.1:7890' }))
      .toBe('ws://127.0.0.1:7890/ws');
  });

  it('uses wss for an https page', () => {
    expect(dashboardWebSocketUrl({ protocol: 'https:', host: 'dashboard.example' }))
      .toBe('wss://dashboard.example/ws');
  });
});
