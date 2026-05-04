import { describe, expect, it } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './should-celebrate-workflow-completion';

describe('shouldCelebrateWorkflowCompletion', () => {
  it('returns true when a running workflow completes', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
      true,
    );
  });

  it('returns false for an already completed workflow', () => {
    expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
      false,
    );
  });

  it('returns false for non-completion transitions', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
    expect(shouldCelebrateWorkflowCompletion(undefined, 'Completed')).toBe(
      false,
    );
  });
});
