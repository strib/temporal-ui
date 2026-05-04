import { describe, expect, test } from 'vitest';

import { shouldCelebrateWorkflowCompletion } from './workflow-completion-confetti';

describe('shouldCelebrateWorkflowCompletion', () => {
  test('returns true when the same workflow transitions to Completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Running', 'Completed', true),
    ).toBe(true);
  });

  test('returns false when a Completed workflow is first loaded', () => {
    expect(
      shouldCelebrateWorkflowCompletion(undefined, 'Completed', true),
    ).toBe(false);
  });

  test('returns false when switching between workflow runs', () => {
    expect(
      shouldCelebrateWorkflowCompletion('Running', 'Completed', false),
    ).toBe(false);
  });

  test('returns false when the workflow does not transition to Completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed', true)).toBe(
      false,
    );
  });
});
