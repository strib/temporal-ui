import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldCelebrateWorkflowCompletion = (
  previousStatus: WorkflowStatus | undefined,
  currentStatus: WorkflowStatus | undefined,
): boolean => previousStatus === 'Running' && currentStatus === 'Completed';
