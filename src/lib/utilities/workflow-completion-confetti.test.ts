import { describe, expect, it } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './workflow-completion-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('returns true when status transitions to Completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
      true,
    );
  });

  it('returns false when already Completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
      false,
    );
  });

  it('returns false when loading a workflow that is already Completed', () => {
    expect(shouldCelebrateWorkflowCompletion(undefined, 'Completed')).toBe(
      false,
    );
  });

  it('returns false for other status changes', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
  });
});
