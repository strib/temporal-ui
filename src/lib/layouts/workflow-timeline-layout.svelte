<script lang="ts">
  import { onDestroy } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    fullEventHistory,
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { getMillisecondDuration } from '$lib/utilities/format-time';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: urlParams = parseEventFilterParams($page.url);
  $: {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  }

  $: reverseSort = $eventFilterSort === 'descending';

  $: ascendingGroups = groupEvents(
    $filteredEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );

  $: groups = reverseSort ? [...ascendingGroups].reverse() : ascendingGroups;

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $currentEventHistory,
    'ascending',
  );

  $: isNotPending = workflow && !workflow?.isRunning && !workflow?.isPaused;

  $: replayFirstStart =
    $fullEventHistory[0]?.eventTime < workflow?.executionTime
      ? $fullEventHistory[0]?.eventTime
      : workflow?.executionTime;
  $: replayTimelineStart =
    workflow &&
    ((!isWorkflowDelayed(workflow) && replayFirstStart) || workflow.startTime);

  let replayPlaying = false;
  let replayOverrideEndTime: Date | null = null;
  let replayRaf: number | null = null;
  let replayLoopMs = 8000;
  let replaySpanMs = 0;
  let replayStartedAt = 0;

  $: canReplayTimeline =
    isNotPending &&
    workflow?.endTime &&
    replayTimelineStart &&
    $fullEventHistory.length > 0;

  const stopTimelineReplay = () => {
    if (replayRaf !== null) {
      cancelAnimationFrame(replayRaf);
      replayRaf = null;
    }
    replayOverrideEndTime = null;
    replayPlaying = false;
  };

  const runTimelineReplayFrame = () => {
    if (!replayPlaying || !workflow?.endTime || !replayTimelineStart) {
      stopTimelineReplay();
      return;
    }
    const elapsed = performance.now() - replayStartedAt;
    const phase = (elapsed % replayLoopMs) / replayLoopMs;
    const startMs = new Date(replayTimelineStart as string).getTime();
    const endMs = startMs + replaySpanMs * phase;
    const safeEndMs = Math.min(startMs + replaySpanMs, Math.max(startMs + 1, endMs));
    replayOverrideEndTime = new Date(safeEndMs);
    replayRaf = requestAnimationFrame(runTimelineReplayFrame);
  };

  const startTimelineReplay = () => {
    if (!canReplayTimeline || !workflow?.endTime || !replayTimelineStart) {
      return;
    }
    const span = getMillisecondDuration({
      start: replayTimelineStart,
      end: workflow.endTime,
      onlyUnderSecond: false,
    });
    if (span === null || span <= 0) {
      return;
    }
    replaySpanMs = span;
    replayLoopMs = Math.min(60000, Math.max(4000, span));
    replayPlaying = true;
    replayStartedAt = performance.now();
    runTimelineReplayFrame();
  };

  const toggleTimelineReplay = () => {
    if (replayPlaying) {
      stopTimelineReplay();
    } else {
      startTimelineReplay();
    }
  };

  beforeNavigate(() => {
    stopTimelineReplay();
    clearActives();
  });

  onDestroy(() => {
    stopTimelineReplay();
  });

  $: if (!isNotPending && replayPlaying) {
    stopTimelineReplay();
  }

  $: {
    if (isNotPending && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  }

  let showDownloadPrompt = false;

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams($page.url, { sort: newSort }, goto);
  };

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      $page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };
</script>

<InputAndResults />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks callbacks={workflow.callbacks} />
  {/if}
</div>
<div class="relative pb-24">
  <div
    class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>
        {translate('workflows.timeline-tab')}
      </h2>
      <EventHistoryLegend />
    </div>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          data-testid="zoom-in"
          on:click={onSort}
          size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <EventTypeFilter compact={false} />
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          class="border-l-0"
          size="sm"
          on:click={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
              ? 'bg-slate-300'
              : 'bg-green-600'}"
          ></span>
          {$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <Button
          variant="secondary"
          size="sm"
          class="border-l-0"
          leadingIcon={replayPlaying ? 'close' : 'play'}
          disabled={!canReplayTimeline}
          data-testid="timeline-replay"
          on:click={toggleTimelineReplay}
        >
          {replayPlaying
            ? translate('workflows.timeline-replay-stop')
            : translate('workflows.timeline-replay')}
        </Button>
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
          on:click={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>
  {#if replayPlaying}
    <div class="timeline-replay-chick" aria-hidden="true">
      <span class="chick">🐔</span>
    </div>
  {/if}
  <div class="flex w-full flex-col">
    <TimelineGraph
      {workflow}
      {groups}
      viewportHeight={undefined}
      error={Boolean(workflowTaskFailedError)}
      replayOverrideEndTime={replayOverrideEndTime}
    />
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>

<style lang="postcss">
  .timeline-replay-chick {
    @apply pointer-events-none fixed bottom-6 right-6 z-[20] select-none;
  }

  .chick {
    @apply inline-block text-4xl;
    animation: chick-dance 0.55s ease-in-out infinite;
  }

  @keyframes chick-dance {
    0%,
    100% {
      transform: translateY(0) rotate(-10deg) scaleX(1);
    }
    25% {
      transform: translateY(-12px) rotate(8deg) scaleX(-1);
    }
    50% {
      transform: translateY(-4px) rotate(-6deg) scaleX(1);
    }
    75% {
      transform: translateY(-14px) rotate(12deg) scaleX(-1);
    }
  }
</style>
