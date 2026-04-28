import { describe, expect, it } from 'vitest';

import { shouldBurstWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('shouldBurstWorkflowCompletionConfetti', () => {
  it('returns true when a workflow transitions to completed', () => {
    expect(shouldBurstWorkflowCompletionConfetti('Running', 'Completed')).toBe(
      true,
    );
  });

  it('returns false for workflows that initially load as completed', () => {
    expect(shouldBurstWorkflowCompletionConfetti(undefined, 'Completed')).toBe(
      false,
    );
  });

  it('returns false for non-completed terminal states', () => {
    expect(shouldBurstWorkflowCompletionConfetti('Running', 'Failed')).toBe(
      false,
    );
  });

  it('returns false when a workflow remains completed', () => {
    expect(
      shouldBurstWorkflowCompletionConfetti('Completed', 'Completed'),
    ).toBe(false);
  });
});
