import { describe, expect, it } from 'vitest';

import { shouldBlastWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('shouldBlastWorkflowCompletionConfetti', () => {
  it('blasts when a previously seen running workflow completes', () => {
    expect(
      shouldBlastWorkflowCompletionConfetti({
        hasSeenStatus: true,
        previousStatus: 'Running',
        status: 'Completed',
      }),
    ).toBe(true);
  });

  it('does not blast for an already completed initial workflow', () => {
    expect(
      shouldBlastWorkflowCompletionConfetti({
        hasSeenStatus: false,
        previousStatus: null,
        status: 'Completed',
      }),
    ).toBe(false);
  });

  it('does not blast when refreshing an already completed workflow', () => {
    expect(
      shouldBlastWorkflowCompletionConfetti({
        hasSeenStatus: true,
        previousStatus: 'Completed',
        status: 'Completed',
      }),
    ).toBe(false);
  });
});
