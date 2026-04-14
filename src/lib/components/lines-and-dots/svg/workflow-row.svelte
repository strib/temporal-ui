<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';

  import { TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  let { workflow, length, y, lineEndX = null }: { workflow: WorkflowExecution; length: number; y: number; lineEndX?: number | null } = $props();

  const { radius, height, gutter } = TimelineConfig;

  const start = gutter;
  const end = $derived(start + length - 2 * gutter);
  const workflowLineEnd = $derived(
    lineEndX != null ? Math.min(end, Math.max(start, lineEndX)) : end,
  );
</script>

<g role="button" tabindex="0" class="relative cursor-pointer" {height}>
  <Line
    startPoint={[start, y]}
    endPoint={[workflowLineEnd, y]}
    status={workflow.status}
    strokeWidth={radius * 2}
    pending={workflow.isRunning}
    delayed={isWorkflowDelayed(workflow)}
  />
  <Dot point={[start, y]} classification={workflow.status} r={radius} />
  <Icon
    name="workflow"
    x={start - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    strokeWidth="4"
    class="text-black"
  />
  {#if lineEndX == null || workflowLineEnd >= end - 0.5}
    <Dot point={[end, y]} classification={workflow.status} r={radius} />
    <Icon
      name="workflow"
      x={end - radius / 2}
      y={y - radius / 2}
      width={radius}
      height={radius}
      strokeWidth="4"
      class="text-black"
    />
  {/if}
</g>

<style lang="postcss">
  g {
    cursor: default;
    pointer-events: bounding-box;
    outline: none;
  }
</style>
