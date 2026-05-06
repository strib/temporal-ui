import { describe, expect, it } from 'vitest';

import { shouldTriggerWorkflowCompletionCelebration } from './workflow-completion-confetti';

describe('shouldTriggerWorkflowCompletionCelebration', () => {
  it('does not fire when there was no prior status (initial load / hydration)', () => {
    expect(
      shouldTriggerWorkflowCompletionCelebration(undefined, 'Completed'),
    ).toBe(false);
  });

  it('fires when transitioning from Running to Completed', () => {
    expect(
      shouldTriggerWorkflowCompletionCelebration('Running', 'Completed'),
    ).toBe(true);
  });

  it('does not fire when staying Completed', () => {
    expect(
      shouldTriggerWorkflowCompletionCelebration('Completed', 'Completed'),
    ).toBe(false);
  });

  it('does not fire when transitioning to Failed', () => {
    expect(
      shouldTriggerWorkflowCompletionCelebration('Running', 'Failed'),
    ).toBe(false);
  });
});
