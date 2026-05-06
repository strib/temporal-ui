<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import {
    fireWorkflowCompletionConfetti,
    shouldCelebrateWorkflowCompletion,
  } from '$lib/utilities/workflow-completion-confetti';

  let previousStatus: WorkflowStatus | null = null;
  let trackedRunKey = '';

  const resetTracking = (runKey: string, status: WorkflowStatus | null) => {
    trackedRunKey = runKey;
    previousStatus = status;
  };

  $: runKey = `${$page.params.namespace ?? ''}:${$page.params.workflow ?? ''}:${$page.params.run ?? ''}`;
  $: workflowStatus = $workflowRun.workflow?.status ?? null;

  $: if (runKey !== trackedRunKey) {
    resetTracking(runKey, workflowStatus);
  } else if (
    shouldCelebrateWorkflowCompletion(previousStatus, workflowStatus)
  ) {
    fireWorkflowCompletionConfetti();
    previousStatus = workflowStatus;
  } else if (workflowStatus !== previousStatus) {
    previousStatus = workflowStatus;
  }

  onDestroy(() => {
    previousStatus = null;
    trackedRunKey = '';
  });
</script>
