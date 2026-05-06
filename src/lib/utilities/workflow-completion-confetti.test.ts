import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fireWorkflowCompletionConfetti,
  shouldCelebrateWorkflowCompletion,
} from './workflow-completion-confetti';

const confettiMock = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: (...args: unknown[]) => confettiMock(...args),
}));

describe('workflow-completion-confetti', () => {
  beforeEach(() => {
    confettiMock.mockReset();
    vi.stubGlobal('requestAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('shouldCelebrateWorkflowCompletion', () => {
    it('returns true when a workflow newly completes', () => {
      expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
        true,
      );
    });

    it('returns false when already completed or without a prior status', () => {
      expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
        false,
      );
      expect(shouldCelebrateWorkflowCompletion(null, 'Completed')).toBe(false);
      expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(
        false,
      );
    });
  });

  describe('fireWorkflowCompletionConfetti', () => {
    it('skips confetti when reduced motion is preferred', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: true }));

      fireWorkflowCompletionConfetti();

      expect(confettiMock).not.toHaveBeenCalled();
    });

    it('fires confetti when motion is allowed', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }));

      fireWorkflowCompletionConfetti();

      expect(confettiMock).toHaveBeenCalled();
    });
  });
});
