import { describe, expect, test } from 'vitest';

import { shouldTriggerWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('shouldTriggerWorkflowCompletionConfetti', () => {
  test('returns true when the same run changes from running to completed', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Running',
        nextStatus: 'Completed',
        previousRunId: 'run-id',
        nextRunId: 'run-id',
      }),
    ).toBe(true);
  });

  test('returns false on initial completed loads', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        nextStatus: 'Completed',
        nextRunId: 'run-id',
      }),
    ).toBe(false);
  });

  test('returns false when the workflow is already completed', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Completed',
        nextStatus: 'Completed',
        previousRunId: 'run-id',
        nextRunId: 'run-id',
      }),
    ).toBe(false);
  });

  test('returns false when navigating to a different run', () => {
    expect(
      shouldTriggerWorkflowCompletionConfetti({
        previousStatus: 'Running',
        nextStatus: 'Completed',
        previousRunId: 'run-id-1',
        nextRunId: 'run-id-2',
      }),
    ).toBe(false);
  });
});
