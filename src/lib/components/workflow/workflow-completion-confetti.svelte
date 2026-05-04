<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';
  import {
    blastWorkflowCompletionConfetti,
    shouldBlastWorkflowCompletionConfetti,
  } from '$lib/utilities/workflow-completion-confetti';

  type Props = {
    status?: WorkflowStatus;
  };

  let { status }: Props = $props();
  let previousStatus: WorkflowStatus | undefined = $state();
  let activeBlast:
    | ReturnType<typeof blastWorkflowCompletionConfetti>
    | undefined = $state();

  $effect(() => {
    if (shouldBlastWorkflowCompletionConfetti(previousStatus, status)) {
      activeBlast?.stop();
      activeBlast = blastWorkflowCompletionConfetti();
    }

    previousStatus = status;
  });

  onDestroy(() => {
    activeBlast?.stop();
  });
</script>
