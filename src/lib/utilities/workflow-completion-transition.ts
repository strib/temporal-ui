import type { WorkflowStatus } from '$lib/types/workflows';

export type WorkflowCompletionTracker = {
  runId: string | null;
  status: WorkflowStatus;
};

export const initialWorkflowCompletionTracker: WorkflowCompletionTracker = {
  runId: null,
  status: null,
};

export const getWorkflowCompletionTransition = (
  tracker: WorkflowCompletionTracker,
  workflow?: { runId: string; status: WorkflowStatus } | null,
): { next: WorkflowCompletionTracker; shouldCelebrate: boolean } => {
  if (!workflow) {
    return {
      next: initialWorkflowCompletionTracker,
      shouldCelebrate: false,
    };
  }

  const next = {
    runId: workflow.runId,
    status: workflow.status,
  };

  if (workflow.runId !== tracker.runId) {
    return {
      next,
      shouldCelebrate: false,
    };
  }

  return {
    next,
    shouldCelebrate:
      tracker.status !== 'Completed' && workflow.status === 'Completed',
  };
};
