import { describe, expect, it } from 'vitest';

import { shouldFireWorkflowCompletedConfetti } from './workflow-completion-confetti';

describe('shouldFireWorkflowCompletedConfetti', () => {
  it('returns false on initial load when previous is null', () => {
    expect(shouldFireWorkflowCompletedConfetti(null, 'Completed')).toBe(false);
  });

  it('returns true when transitioning from Running to Completed', () => {
    expect(
      shouldFireWorkflowCompletedConfetti('Running', 'Completed'),
    ).toBe(true);
  });

  it('returns false when status stays Completed', () => {
    expect(
      shouldFireWorkflowCompletedConfetti('Completed', 'Completed'),
    ).toBe(false);
  });

  it('returns false for other transitions', () => {
    expect(shouldFireWorkflowCompletedConfetti('Running', 'Failed')).toBe(
      false,
    );
  });
});
