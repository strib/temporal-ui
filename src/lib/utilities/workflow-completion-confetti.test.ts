import { describe, expect, test } from 'vitest';

import { shouldBurstWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('shouldBurstWorkflowCompletionConfetti', () => {
  test('returns true when the workflow transitions into Completed', () => {
    expect(shouldBurstWorkflowCompletionConfetti('Running', 'Completed')).toBe(
      true,
    );
  });

  test('returns false when the workflow is already Completed', () => {
    expect(
      shouldBurstWorkflowCompletionConfetti('Completed', 'Completed'),
    ).toBe(false);
  });

  test('returns false when there was no previous status yet', () => {
    expect(shouldBurstWorkflowCompletionConfetti(null, 'Completed')).toBe(
      false,
    );
  });

  test('returns false for non-completed transitions', () => {
    expect(shouldBurstWorkflowCompletionConfetti('Running', 'Failed')).toBe(
      false,
    );
  });
});
