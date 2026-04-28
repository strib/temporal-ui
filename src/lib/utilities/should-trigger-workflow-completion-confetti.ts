import type { WorkflowStatus } from '$lib/types/workflows';

type Parameters = {
  previousStatus?: WorkflowStatus;
  nextStatus?: WorkflowStatus;
  previousRunId?: string | null;
  nextRunId?: string | null;
};

export const shouldTriggerWorkflowCompletionConfetti = ({
  previousStatus,
  nextStatus,
  previousRunId,
  nextRunId,
}: Parameters): boolean =>
  Boolean(
    previousRunId &&
      nextRunId &&
      previousRunId === nextRunId &&
      previousStatus &&
      previousStatus !== 'Completed' &&
      nextStatus === 'Completed',
  );
