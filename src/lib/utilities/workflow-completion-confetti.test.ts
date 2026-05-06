import { describe, expect, test } from 'vitest';

import type { WorkflowCompletionSnapshot } from './workflow-completion-confetti';
import {
  shouldCelebrateWorkflowCompletion,
  workflowCompletionSnapshot,
} from './workflow-completion-confetti';

describe('workflow completion confetti', () => {
  const running: WorkflowCompletionSnapshot = {
    key: 'workflow:run',
    status: 'Running',
  };

  const completed: WorkflowCompletionSnapshot = {
    key: 'workflow:run',
    status: 'Completed',
  };

  test('celebrates when the same workflow run changes to completed', () => {
    expect(shouldCelebrateWorkflowCompletion(running, completed)).toBe(true);
  });

  test('does not celebrate a workflow that initially loads as completed', () => {
    expect(
      shouldCelebrateWorkflowCompletion(
        { key: '', status: undefined },
        completed,
      ),
    ).toBe(false);
  });

  test('does not celebrate completed workflows more than once', () => {
    expect(shouldCelebrateWorkflowCompletion(completed, completed)).toBe(false);
  });

  test('does not celebrate when a different run is loaded', () => {
    expect(
      shouldCelebrateWorkflowCompletion(running, {
        key: 'workflow:other-run',
        status: 'Completed',
      }),
    ).toBe(false);
  });

  test('creates a stable snapshot for workflow completion checks', () => {
    expect(
      workflowCompletionSnapshot({
        id: 'workflow',
        runId: 'run',
        status: 'Running',
      }),
    ).toEqual(running);
  });
});
