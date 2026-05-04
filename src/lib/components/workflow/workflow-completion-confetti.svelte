<script lang="ts">
  import { page } from '$app/stores';

  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import {
    blastWorkflowCompletionConfetti,
    shouldCelebrateWorkflowCompletion,
  } from '$lib/utilities/workflow-completion-confetti';

  let lastRunKey = '';
  let previousStatus: WorkflowStatus | null = null;

  $effect(() => {
    const runKey = `${$page.params.workflow}:${$page.params.run}`;

    if (runKey !== lastRunKey) {
      lastRunKey = runKey;
      previousStatus = null;
    }

    const status = $workflowRun.workflow?.status;

    if (shouldCelebrateWorkflowCompletion(previousStatus, status)) {
      void blastWorkflowCompletionConfetti();
    }

    if (status) {
      previousStatus = status;
    }
  });
</script>
