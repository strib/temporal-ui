import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldBurstWorkflowCompletionConfetti = (
  previousStatus: WorkflowStatus,
  nextStatus: WorkflowStatus,
): boolean => {
  return Boolean(
    previousStatus &&
    previousStatus !== 'Completed' &&
    nextStatus === 'Completed',
  );
};
