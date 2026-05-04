import confetti from 'canvas-confetti';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  celebrateWorkflowCompletion,
  resetCelebratedRuns,
  shouldCelebrateTransition,
} from './confetti';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('shouldCelebrateTransition', () => {
  it('celebrates a Running → Completed transition', () => {
    expect(shouldCelebrateTransition('Running', 'Completed')).toBe(true);
  });

  it('celebrates a Paused → Completed transition', () => {
    expect(shouldCelebrateTransition('Paused', 'Completed')).toBe(true);
  });

  it('does not celebrate Completed → Completed', () => {
    expect(shouldCelebrateTransition('Completed', 'Completed')).toBe(false);
  });

  it('does not celebrate when next is not Completed', () => {
    expect(shouldCelebrateTransition('Running', 'Failed')).toBe(false);
    expect(shouldCelebrateTransition('Running', 'Running')).toBe(false);
  });

  it('does not celebrate without a known previous status', () => {
    expect(shouldCelebrateTransition(undefined, 'Completed')).toBe(false);
    expect(shouldCelebrateTransition(null, 'Completed')).toBe(false);
  });
});

describe('celebrateWorkflowCompletion', () => {
  beforeEach(() => {
    resetCelebratedRuns();
    vi.mocked(confetti).mockClear();
  });

  it('fires confetti exactly once per run id', () => {
    const fired1 = celebrateWorkflowCompletion('run-1', 'Running', 'Completed');
    const fired2 = celebrateWorkflowCompletion('run-1', 'Running', 'Completed');

    expect(fired1).toBe(true);
    expect(fired2).toBe(false);
    expect(confetti).toHaveBeenCalled();
  });

  it('does not fire if the transition is not a completion', () => {
    const fired = celebrateWorkflowCompletion('run-2', 'Running', 'Failed');
    expect(fired).toBe(false);
    expect(confetti).not.toHaveBeenCalled();
  });

  it('does not fire without a runId', () => {
    const fired = celebrateWorkflowCompletion(
      undefined,
      'Running',
      'Completed',
    );
    expect(fired).toBe(false);
    expect(confetti).not.toHaveBeenCalled();
  });

  it('fires independently for different run ids', () => {
    expect(celebrateWorkflowCompletion('run-a', 'Running', 'Completed')).toBe(
      true,
    );
    expect(celebrateWorkflowCompletion('run-b', 'Running', 'Completed')).toBe(
      true,
    );
    expect(confetti).toHaveBeenCalled();
  });
});
