import { describe, expect, it } from 'vitest';

import { shouldBlastConfettiForWorkflowCompletion } from './workflow-completion-confetti-logic';

describe('shouldBlastConfettiForWorkflowCompletion', () => {
  it('returns false when previous status is unknown', () => {
    expect(shouldBlastConfettiForWorkflowCompletion(null, 'Completed')).toBe(
      false,
    );
  });

  it('returns false when landing on an already completed workflow', () => {
    expect(
      shouldBlastConfettiForWorkflowCompletion('Completed', 'Completed'),
    ).toBe(false);
  });

  it('returns true when transitioning from Running to Completed', () => {
    expect(
      shouldBlastConfettiForWorkflowCompletion('Running', 'Completed'),
    ).toBe(true);
  });

  it('returns true when transitioning from Failed to Completed (replay)', () => {
    expect(
      shouldBlastConfettiForWorkflowCompletion('Failed', 'Completed'),
    ).toBe(true);
  });
});
