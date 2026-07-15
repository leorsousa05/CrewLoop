import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalRequestPolicy } from './local-request-policy';

const policy = createLocalRequestPolicy({ host: '127.0.0.1', port: 7890 });

describe('local request policy', () => {
  it('accepts the configured host and port', () => {
    assert.equal(policy.acceptsHost('127.0.0.1:7890'), true);
  });

  it('accepts loopback aliases on the configured port', () => {
    assert.equal(policy.acceptsHost('localhost:7890'), true);
    assert.equal(policy.acceptsHost('[::1]:7890'), true);
  });

  it('rejects foreign hosts and other ports', () => {
    assert.equal(policy.acceptsHost('evil.example.com'), false);
    assert.equal(policy.acceptsHost('127.0.0.1.evil.example.com:7890'), false);
    assert.equal(policy.acceptsHost('127.0.0.1:9999'), false);
    assert.equal(policy.acceptsHost(undefined), false);
  });

  it('accepts WebSocket connections without an Origin header (non-browser hooks)', () => {
    assert.equal(policy.acceptsWebSocketOrigin(undefined), true);
  });

  it('accepts browser WebSocket origins that match the local origin', () => {
    assert.equal(policy.acceptsWebSocketOrigin('http://127.0.0.1:7890'), true);
    assert.equal(policy.acceptsWebSocketOrigin('http://localhost:7890'), true);
  });

  it('rejects foreign WebSocket origins', () => {
    assert.equal(policy.acceptsWebSocketOrigin('http://evil.example.com'), false);
    assert.equal(policy.acceptsWebSocketOrigin('https://127.0.0.1.evil.example.com'), false);
    assert.equal(policy.acceptsWebSocketOrigin('null'), false);
    assert.equal(policy.acceptsWebSocketOrigin('not-a-url'), false);
  });
});
