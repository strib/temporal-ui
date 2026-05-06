import { describe, expect, it } from 'vitest';

import {
  getWorkflowCompletionTransition,
  initialWorkflowCompletionTracker,
} from './workflow-completion-transition';

describe('getWorkflowCompletionTransition', () => {
  it('does not celebrate the initial workflow load', () => {
    const transition = getWorkflowCompletionTransition(
      initialWorkflowCompletionTracker,
      {
        runId: 'run-1',
        status: 'Completed',
      },
    );

    expect(transition.shouldCelebrate).toBe(false);
    expect(transition.next).toEqual({
      runId: 'run-1',
      status: 'Completed',
    });
  });

  it('celebrates when an open workflow becomes completed', () => {
    const runningTransition = getWorkflowCompletionTransition(
      initialWorkflowCompletionTracker,
      {
        runId: 'run-1',
        status: 'Running',
      },
    );

    const completedTransition = getWorkflowCompletionTransition(
      runningTransition.next,
      {
        runId: 'run-1',
        status: 'Completed',
      },
    );

    expect(completedTransition.shouldCelebrate).toBe(true);
  });

  it('does not celebrate repeat completed updates for the same run', () => {
    const transition = getWorkflowCompletionTransition(
      {
        runId: 'run-1',
        status: 'Completed',
      },
      {
        runId: 'run-1',
        status: 'Completed',
      },
    );

    expect(transition.shouldCelebrate).toBe(false);
  });

  it('does not celebrate when switching to a different completed run', () => {
    const transition = getWorkflowCompletionTransition(
      {
        runId: 'run-1',
        status: 'Running',
      },
      {
        runId: 'run-2',
        status: 'Completed',
      },
    );

    expect(transition.shouldCelebrate).toBe(false);
    expect(transition.next).toEqual({
      runId: 'run-2',
      status: 'Completed',
    });
  });
});
