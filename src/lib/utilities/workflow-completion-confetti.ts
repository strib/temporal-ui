import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldCelebrateWorkflowCompletion = (
  previousStatus: WorkflowStatus | undefined,
  currentStatus: WorkflowStatus | undefined,
  sameWorkflow: boolean,
): boolean => {
  return Boolean(
    sameWorkflow &&
    previousStatus &&
    previousStatus !== 'Completed' &&
    currentStatus === 'Completed',
  );
};
