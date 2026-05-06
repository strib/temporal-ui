import type { WorkflowStatus } from '$lib/types/workflows';

type ConfettiTriggerArguments = {
  previousStatus?: WorkflowStatus;
  nextStatus?: WorkflowStatus;
  previousRunId?: string;
  nextRunId?: string;
};

export const shouldTriggerWorkflowCompletionConfetti = ({
  previousStatus,
  nextStatus,
  previousRunId,
  nextRunId,
}: ConfettiTriggerArguments): boolean => {
  return Boolean(
    previousStatus &&
    previousRunId &&
    nextRunId &&
    previousRunId === nextRunId &&
    previousStatus !== 'Completed' &&
    nextStatus === 'Completed',
  );
};
