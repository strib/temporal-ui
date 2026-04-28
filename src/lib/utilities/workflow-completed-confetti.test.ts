import { describe, expect, it } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './workflow-completed-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('returns true when status transitions from Running to Completed and not running', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Running', 'Completed', false),
    ).toBe(true);
  });

  it('returns false on initial load when workflow is already Completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion(undefined, 'Completed', false),
    ).toBe(false);
  });

  it('returns false when previous status was already Completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Completed', 'Completed', false),
    ).toBe(false);
  });

  it('returns false when next status is not Completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed', false)).toBe(
      false,
    );
  });

  it('returns false while API still reports isRunning', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Running', 'Completed', true),
    ).toBe(false);
  });
});
