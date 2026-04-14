<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { activeGroupHeight, activeGroups } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';
  import { validTimeToMs } from '$lib/utilities/timeline-replay';

  import { TimelineConfig } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  type Props = {
    x?: number;
    y?: number;
    workflow: WorkflowExecution;
    groups: EventGroups;
    viewportHeight: number | undefined;
    readOnly?: boolean;
    error?: boolean;
    playbackNowMs?: number | null;
  };

  let {
    x = 0,
    y = 0,
    workflow,
    groups,
    viewportHeight,
    readOnly = false,
    error = false,
    playbackNowMs = null,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = $state(0);
  let scrollY = $state(0);

  const expandedGroupHeight = $derived(readOnly ? 0 : $activeGroupHeight);
  const filteredGroups = $derived(
    getFailedOrPendingGroups(groups, $eventStatusFilter),
  );
  const firstStartTime = $derived(
    $fullEventHistory[0]?.eventTime < workflow.executionTime
      ? $fullEventHistory[0]?.eventTime
      : workflow.executionTime,
  );
  const startTime = $derived(
    (!isWorkflowDelayed(workflow) && firstStartTime) || workflow.startTime,
  );
  const timelineHeight = $derived(
    Math.max(height * (filteredGroups.length + 2), 120) + expandedGroupHeight,
  );
  const canvasHeight = $derived(timelineHeight + 120);

  const handleScroll = (e: Event & { currentTarget: EventTarget & HTMLElement }) => {
    scrollY = e?.currentTarget?.scrollTop ?? 0;
  };

  const activeGroupsHeightAboveGroup = (group: EventGroup) => {
    const activeGroupIsAbove = $activeGroups?.filter((id) => {
      if ($eventFilterSort === 'ascending')
        return parseInt(id) < parseInt(group.id);
      return parseInt(id) > parseInt(group.id);
    });

    if (!activeGroupIsAbove?.length) return 0;
    return expandedGroupHeight;
  };

  const workflowStartMs = $derived(validTimeToMs(startTime));
  const workflowEndMs = $derived(validTimeToMs(workflow.endTime));
  const workflowLineEndX = $derived.by(() => {
    if (playbackNowMs == null || workflowStartMs == null || workflowEndMs == null)
      return null;
    if (workflowEndMs <= workflowStartMs) return null;
    if (playbackNowMs <= workflowStartMs) return null;
    const timelineWidth = canvasWidth - 2 * gutter;
    const ratio =
      (playbackNowMs - workflowStartMs) / (workflowEndMs - workflowStartMs);
    const x = Math.round(ratio * timelineWidth) + gutter;
    return Math.min(canvasWidth - gutter, Math.max(gutter, x));
  });
</script>

<div
  id="event-history-timeline-graph"
  class="relative h-auto overflow-auto border border-t-0 border-subtle bg-primary"
  bind:clientWidth={canvasWidth}
  style={viewportHeight ? `max-height: ${viewportHeight}px;` : ''}
  on:scroll={handleScroll}
>
  <EndTimeInterval {workflow} {startTime} let:endTime let:duration>
    <div
      class="pointer-events-none sticky top-[120px]"
      class:invisible={!!$activeGroups.length}
    >
      <div class="flex w-full justify-between text-xs">
        <p class="w-60 -translate-x-24 rotate-90">
          {$timestamp(startTime, { format: 'short' })}
        </p>
        <p class="w-60 translate-x-24 rotate-90">
          {$timestamp(endTime, { format: 'short' })}
        </p>
      </div>
    </div>
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
      class="-mt-4"
      class:error
    >
      <Line
        startPoint={[gutter, 0]}
        endPoint={[gutter, timelineHeight]}
        strokeWidth={radius / 2}
      />
      <Line
        startPoint={[canvasWidth - gutter, 0]}
        endPoint={[canvasWidth - gutter, timelineHeight]}
        strokeWidth={radius / 2}
      />
      <TimelineAxis
        x1={gutter - radius / 4}
        x2={canvasWidth - gutter + radius / 4}
        {timelineHeight}
        {startTime}
        {duration}
      />
      <WorkflowRow
        {workflow}
        y={height}
        length={canvasWidth}
        lineEndX={workflowLineEndX}
      />
      {#each filteredGroups as group, index (group.id)}
        {@const y = (index + 2) * height + activeGroupsHeightAboveGroup(group)}
        {#if !viewportHeight || (y > scrollY - 2 * height && y < scrollY + viewportHeight * height)}
          {#key group.eventList.length}
            <TimelineGraphRow
              {y}
              {group}
              {canvasWidth}
              {startTime}
              {endTime}
              {readOnly}
              {playbackNowMs}
            />
          {/key}
        {/if}
        {#if !readOnly && $activeGroups.includes(group.id)}
          <GroupDetailsRow y={y + 1.33 * radius} {group} {canvasWidth} />
        {/if}
      {/each}
    </svg>
  </EndTimeInterval>
</div>

<style lang="postcss">
  .error {
    @apply bg-danger;
  }
</style>
