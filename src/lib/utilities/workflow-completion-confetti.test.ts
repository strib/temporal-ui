import { describe, expect, it } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './workflow-completion-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('celebrates when a running workflow becomes completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
      true,
    );
  });

  it('does not celebrate a workflow that loads already completed', () => {
    expect(shouldCelebrateWorkflowCompletion(undefined, 'Completed')).toBe(
      false,
    );
  });

  it('does not celebrate non-completion status changes', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
    expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
      false,
    );
  });
});
