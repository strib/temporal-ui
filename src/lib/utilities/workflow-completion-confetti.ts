import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';

type WorkflowCompletionWorkflow = Pick<
  WorkflowExecution,
  'id' | 'runId' | 'status'
>;

export type WorkflowCompletionSnapshot = {
  key: string;
  status: WorkflowStatus | undefined;
};

export const workflowCompletionSnapshot = (
  workflow: WorkflowCompletionWorkflow | null | undefined,
): WorkflowCompletionSnapshot => ({
  key: workflow ? `${workflow.id}:${workflow.runId}` : '',
  status: workflow?.status ?? undefined,
});

export const shouldCelebrateWorkflowCompletion = (
  previous: WorkflowCompletionSnapshot,
  current: WorkflowCompletionSnapshot,
): boolean => {
  return (
    Boolean(previous.key) &&
    previous.key === current.key &&
    previous.status !== undefined &&
    previous.status !== 'Completed' &&
    current.status === 'Completed'
  );
};
