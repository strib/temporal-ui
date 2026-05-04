import type { WorkflowStatus } from '$lib/types/workflows';

type WorkflowCompletionConfettiState = {
  hasSeenStatus: boolean;
  previousStatus: WorkflowStatus;
  status: WorkflowStatus;
};

export const shouldBlastWorkflowCompletionConfetti = ({
  hasSeenStatus,
  previousStatus,
  status,
}: WorkflowCompletionConfettiState): boolean => {
  return (
    hasSeenStatus && previousStatus !== 'Completed' && status === 'Completed'
  );
};
