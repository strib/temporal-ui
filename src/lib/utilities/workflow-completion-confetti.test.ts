import { describe, expect, it } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './workflow-completion-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('celebrates when a running workflow completes', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
      true,
    );
  });

  it('does not celebrate already completed workflows', () => {
    expect(shouldCelebrateWorkflowCompletion(undefined, 'Completed')).toBe(
      false,
    );
    expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
      false,
    );
  });

  it('does not celebrate other status transitions', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
    expect(shouldCelebrateWorkflowCompletion('Failed', 'Completed')).toBe(
      false,
    );
  });
});
