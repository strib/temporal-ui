import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldBlastConfettiForWorkflowCompletion(
  previousStatus: WorkflowStatus | null,
  nextStatus: WorkflowStatus,
): boolean {
  return (
    nextStatus === 'Completed' &&
    previousStatus !== null &&
    previousStatus !== 'Completed'
  );
}
