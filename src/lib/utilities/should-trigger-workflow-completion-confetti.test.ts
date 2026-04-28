import { describe, expect, it } from 'vitest';

import { shouldTriggerWorkflowCompletionConfetti } from './should-trigger-workflow-completion-confetti';

describe('shouldTriggerWorkflowCompletionConfetti', () => {
  it('returns true for a live transition to completed on the same run', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Running',
        nextStatus: 'Completed',
        previousRunId: 'run-1',
        nextRunId: 'run-1',
      }),
    ).toBe(true);
  });

  it('returns false for the initial load of a completed workflow', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        nextStatus: 'Completed',
        nextRunId: 'run-1',
      }),
    ).toBe(false);
  });

  it('returns false when the run changes', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Running',
        nextStatus: 'Completed',
        previousRunId: 'run-1',
        nextRunId: 'run-2',
      }),
    ).toBe(false);
  });

  it('returns false when the workflow was already completed', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Completed',
        nextStatus: 'Completed',
        previousRunId: 'run-1',
        nextRunId: 'run-1',
      }),
    ).toBe(false);
  });
});
