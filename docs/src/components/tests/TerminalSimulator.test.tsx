import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { TerminalSimulator } from '../TerminalSimulator';

describe('TerminalSimulator Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders command prompt and starts in idle/typing state', () => {
    render(<TerminalSimulator />);
    
    // Check for header or console mockup tags
    expect(screen.getByText(/crewloop-terminal-sim/i)).toBeDefined();
    
    // First step command starts typing
    const promptChar = 'c';
    // Advance timers to type first character
    act(() => {
      vi.advanceTimersByTime(150);
    });
    
    expect(screen.getByText(new RegExp(promptChar))).toBeDefined();
  });

  it('progresses command character-by-character and renders outputs on completion', async () => {
    render(<TerminalSimulator />);

    // Fast-forward until the first command is fully typed
    // First command is: 'crewloop run "refactor authentication"' (38 chars)
    // At ~100ms per char, we wait around 4000ms
    await act(async () => {
      await vi.advanceTimersByTime(4000);
    });

    // Verify command output logs appear
    // The first command logs contain "CrewLoop Hub" outputs
    await act(async () => {
      await vi.advanceTimersByTime(500); // delay before rendering logs
    });

    expect(screen.getByText(/Discovery phase initiated/i)).toBeDefined();
    expect(screen.getByText(/Context Brief generated/i)).toBeDefined();
  });

  it('advances to subsequent command steps after configured timeouts', async () => {
    render(<TerminalSimulator />);

    // Step 0 -> Step 1
    // Command typing (4000ms) + log render delay (500ms) + step delay (1500ms) + next step typing (2000ms)
    await act(async () => {
      await vi.advanceTimersByTime(8500);
    });

    // Check that second command 'crewloop status' has typed or logs rendered
    expect(screen.getByText(/crewloop status/i)).toBeDefined();
  });
});
