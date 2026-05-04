import { describe, expect, it } from 'vitest';

import {
  getWorkflowRunKey,
  hasReachedWorkflowCompletion,
} from './workflow-completion-transition';

describe('getWorkflowRunKey', () => {
  it('should identify a workflow run', () => {
    expect(getWorkflowRunKey({ id: 'workflow-id', runId: 'run-id' })).toBe(
      'workflow-id:run-id',
    );
  });

  it('should return null when there is no workflow', () => {
    expect(getWorkflowRunKey(null)).toBeNull();
  });
});

describe('hasReachedWorkflowCompletion', () => {
  it('should return true when the same workflow run changes to completed', () => {
    expect(
      hasReachedWorkflowCompletion({
        previousRunKey: 'workflow-id:run-id',
        previousStatus: 'Running',
        currentRunKey: 'workflow-id:run-id',
        currentStatus: 'Completed',
      }),
    ).toBe(true);
  });

  it('should return false on the initial completed workflow load', () => {
    expect(
      hasReachedWorkflowCompletion({
        previousRunKey: null,
        previousStatus: null,
        currentRunKey: 'workflow-id:run-id',
        currentStatus: 'Completed',
      }),
    ).toBe(false);
  });

  it('should return false when the workflow run changes', () => {
    expect(
      hasReachedWorkflowCompletion({
        previousRunKey: 'workflow-id:first-run-id',
        previousStatus: 'Running',
        currentRunKey: 'workflow-id:second-run-id',
        currentStatus: 'Completed',
      }),
    ).toBe(false);
  });

  it('should return false when the workflow is already completed', () => {
    expect(
      hasReachedWorkflowCompletion({
        previousRunKey: 'workflow-id:run-id',
        previousStatus: 'Completed',
        currentRunKey: 'workflow-id:run-id',
        currentStatus: 'Completed',
      }),
    ).toBe(false);
  });
});
