import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldBurstWorkflowCompletionConfetti = (
  previousStatus: WorkflowStatus | undefined,
  currentStatus: WorkflowStatus | undefined,
): boolean => {
  return (
    previousStatus !== undefined &&
    previousStatus !== 'Completed' &&
    currentStatus === 'Completed'
  );
};
