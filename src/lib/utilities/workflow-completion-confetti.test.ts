import { describe, expect, it } from 'vitest';

import { shouldFireWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('shouldFireWorkflowCompletionConfetti', () => {
  it('returns false when next is not Completed', () => {
    expect(shouldFireWorkflowCompletionConfetti('Running', 'Failed')).toBe(
      false,
    );
    expect(shouldFireWorkflowCompletionConfetti('Running', null)).toBe(false);
  });

  it('returns false on initial load when previous is undefined', () => {
    expect(shouldFireWorkflowCompletionConfetti(undefined, 'Completed')).toBe(
      false,
    );
  });

  it('returns false when previous is null (first emission with no prior)', () => {
    expect(shouldFireWorkflowCompletionConfetti(null, 'Completed')).toBe(false);
  });

  it('returns false when already Completed', () => {
    expect(shouldFireWorkflowCompletionConfetti('Completed', 'Completed')).toBe(
      false,
    );
  });

  it('returns true when transitioning from Running to Completed', () => {
    expect(shouldFireWorkflowCompletionConfetti('Running', 'Completed')).toBe(
      true,
    );
  });

  it('returns true when transitioning from Failed to Completed', () => {
    expect(shouldFireWorkflowCompletionConfetti('Failed', 'Completed')).toBe(
      true,
    );
  });
});
