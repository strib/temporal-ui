import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldCelebrateWorkflowCompletion = (
  previousStatus: WorkflowStatus | undefined,
  nextStatus: WorkflowStatus | undefined,
): boolean => {
  return previousStatus === 'Running' && nextStatus === 'Completed';
};
