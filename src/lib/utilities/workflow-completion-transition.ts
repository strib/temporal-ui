import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';

type WorkflowCompletionTransition = {
  previousRunKey: string | null;
  previousStatus: WorkflowStatus;
  currentRunKey: string | null;
  currentStatus: WorkflowStatus;
};

export const getWorkflowRunKey = (
  workflow: Pick<WorkflowExecution, 'id' | 'runId'> | null | undefined,
): string | null => {
  if (!workflow) return null;

  return `${workflow.id}:${workflow.runId}`;
};

export const hasReachedWorkflowCompletion = ({
  previousRunKey,
  previousStatus,
  currentRunKey,
  currentStatus,
}: WorkflowCompletionTransition): boolean => {
  return Boolean(
    previousRunKey &&
    currentRunKey &&
    previousRunKey === currentRunKey &&
    previousStatus &&
    previousStatus !== 'Completed' &&
    currentStatus === 'Completed',
  );
};
