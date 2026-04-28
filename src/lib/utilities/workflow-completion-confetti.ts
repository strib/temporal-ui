import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldFireWorkflowCompletedConfetti(
  previous: WorkflowStatus | null,
  current: WorkflowStatus | null,
): boolean {
  return (
    previous !== null &&
    previous !== 'Completed' &&
    current === 'Completed'
  );
}
