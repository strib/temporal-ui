import { describe, expect, it, vi } from 'vitest';

import {
  blastWorkflowCompletionConfetti,
  shouldCelebrateWorkflowCompletion,
} from './workflow-completion-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('returns false when there is no prior snapshot', () => {
    expect(
      shouldCelebrateWorkflowCompletion(undefined, 'Completed'),
    ).toBe(false);
  });

  it('returns false when status was already Completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Completed', 'Completed'),
    ).toBe(false);
  });

  it('returns true when transitioning from Running to Completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Running', 'Completed'),
    ).toBe(true);
  });

  it('returns false for other terminal transitions', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
  });
});

describe('blastWorkflowCompletionConfetti', () => {
  it('invokes confetti in a full-page pattern', () => {
    const confetti = vi.fn();
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        (cb as FrameRequestCallback)(0);
        return 0;
      });
    const times = [0, 100, 3500];
    let i = 0;
    const now = vi.spyOn(Date, 'now').mockImplementation(() => times[i++] ?? 9_999_999);

    blastWorkflowCompletionConfetti(confetti);

    expect(confetti.mock.calls.length).toBeGreaterThanOrEqual(5);

    raf.mockRestore();
    now.mockRestore();
  });
});
