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
  import {
    replayActive,
    replayProgress,
  } from '$lib/stores/timeline-replay';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';

  import { TimelineConfig } from '../constants';
  import DancingChicken from '../dancing-chicken.svelte';
  import EndTimeInterval from '../end-time-interval.svelte';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  export let x = 0;
  export let y = 0;
  export let workflow: WorkflowExecution;
  export let groups: EventGroups;
  export let viewportHeight: number | undefined;
  export let readOnly = false;
  export let error: boolean = false;

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = 0;
  let scrollY = 0;

  $: expandedGroupHeight = readOnly ? 0 : $activeGroupHeight;
  $: filteredGroups = getFailedOrPendingGroups(groups, $eventStatusFilter);
  $: firstStartTime =
    $fullEventHistory[0]?.eventTime < workflow.executionTime
      ? $fullEventHistory[0]?.eventTime
      : workflow.executionTime;
  $: startTime =
    (!isWorkflowDelayed(workflow) && firstStartTime) || workflow.startTime;
  $: timelineHeight =
    Math.max(height * (filteredGroups.length + 2), 120) + expandedGroupHeight;
  $: canvasHeight = timelineHeight + 120;

  const handleScroll = (e) => {
    scrollY = e?.target?.scrollTop;
  };

  $: timelineWidth = Math.max(canvasWidth - 2 * gutter, 0);
  $: playheadX = gutter + timelineWidth * $replayProgress;

  $: activeGroupsHeightAboveGroup = (group: EventGroup) => {
    const activeGroupIsAbove = $activeGroups?.filter((id) => {
      if ($eventFilterSort === 'ascending')
        return parseInt(id) < parseInt(group.id);
      return parseInt(id) > parseInt(group.id);
    });

    if (!activeGroupIsAbove?.length) return 0;
    return expandedGroupHeight;
  };
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
      {#if $replayActive}
        <defs>
          <clipPath id="timeline-replay-clip">
            <rect x="0" y="0" width={playheadX} height={canvasHeight} />
          </clipPath>
        </defs>
      {/if}
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
      <g
        clip-path={$replayActive ? 'url(#timeline-replay-clip)' : undefined}
      >
        <WorkflowRow {workflow} y={height} length={canvasWidth} />
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
            />
          {/key}
        {/if}
        {#if !readOnly && $activeGroups.includes(group.id)}
          <GroupDetailsRow y={y + 1.33 * radius} {group} {canvasWidth} />
        {/if}
      {/each}
      </g>
      {#if $replayActive}
        <line
          class="replay-playhead"
          x1={playheadX}
          x2={playheadX}
          y1={0}
          y2={timelineHeight}
        />
        <foreignObject
          x={playheadX - 28}
          y={-12}
          width={56}
          height={56}
          class="pointer-events-none"
        >
          <DancingChicken size={56} dancing />
        </foreignObject>
      {/if}
    </svg>
  </EndTimeInterval>
</div>

<style lang="postcss">
  .error {
    @apply bg-danger;
  }

  .replay-playhead {
    stroke: #ef4444;
    stroke-width: 2;
    stroke-dasharray: 4 4;
    opacity: 0.85;
  }
</style>
