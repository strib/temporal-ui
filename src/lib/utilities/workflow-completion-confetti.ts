import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldCelebrateWorkflowCompletion(
  previousStatus: WorkflowStatus | undefined,
  currentStatus: WorkflowStatus | undefined,
): boolean {
  return (
    previousStatus !== undefined &&
    previousStatus !== 'Completed' &&
    currentStatus === 'Completed'
  );
}
