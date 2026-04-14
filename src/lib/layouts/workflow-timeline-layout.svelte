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
  import {
    filterEventsUpToTime,
    replayDurationMs,
    validTimeToMs,
  } from '$lib/utilities/timeline-replay';

  const namespace = $derived($page.params.namespace);
  const workflow = $derived($workflowRun.workflow);
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);

  $effect(() => {
    const urlParams = parseEventFilterParams($page.url);
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  });

  const reverseSort = $derived($eventFilterSort === 'descending');

  const ascendingGroups = $derived(
    groupEvents(
      $filteredEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  const groups = $derived(
    reverseSort ? [...ascendingGroups].reverse() : ascendingGroups,
  );

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  const isNotPending = $derived(
    Boolean(workflow && !workflow?.isRunning && !workflow?.isPaused),
  );

  const firstStartTimeForReplay = $derived(
    $fullEventHistory[0]?.eventTime < workflow?.executionTime
      ? $fullEventHistory[0]?.eventTime
      : workflow?.executionTime,
  );
  const replayTimelineStart = $derived(
    workflow &&
      ((!isWorkflowDelayed(workflow) && firstStartTimeForReplay) ||
        workflow.startTime),
  );

  let isReplaying = $state(false);
  let playbackNowMs = $state<number | null>(null);
  let replayRaf: number | undefined;

  const stopTimelineReplay = () => {
    isReplaying = false;
    playbackNowMs = null;
    if (replayRaf != null) {
      cancelAnimationFrame(replayRaf);
      replayRaf = undefined;
    }
  };

  const toggleTimelineReplay = () => {
    if (!workflow || !replayTimelineStart || !workflow.endTime) return;
    if (isReplaying) {
      stopTimelineReplay();
      return;
    }
    if (replayRaf != null) {
      cancelAnimationFrame(replayRaf);
      replayRaf = undefined;
    }
    const startMs = validTimeToMs(replayTimelineStart);
    const endMs = validTimeToMs(workflow.endTime);
    if (startMs == null || endMs == null || endMs <= startMs) return;
    const spanMs = getMillisecondDuration({
      start: replayTimelineStart,
      end: workflow.endTime,
      onlyUnderSecond: false,
    });
    if (spanMs == null) return;
    const wallMs = replayDurationMs(spanMs);
    playbackNowMs = startMs;
    isReplaying = true;
    const wallStart = performance.now();
    const tick = (now: number) => {
      if (!isReplaying) return;
      const t = Math.min(1, (now - wallStart) / wallMs);
      playbackNowMs = startMs + t * (endMs - startMs);
      if (t >= 1) {
        stopTimelineReplay();
        return;
      }
      replayRaf = requestAnimationFrame(tick);
    };
    replayRaf = requestAnimationFrame(tick);
  };

  const replayGroups = $derived(
    isReplaying
      ? groupEvents(
          filterEventsUpToTime($fullEventHistory, playbackNowMs ?? 0),
          'ascending',
          pendingActivities,
          pendingNexusOperations,
        )
      : groups,
  );

  beforeNavigate(() => {
    clearActives();
    stopTimelineReplay();
  });

  onDestroy(() => {
    stopTimelineReplay();
  });

  $effect(() => {
    if (isNotPending && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  let showDownloadPrompt = $state(false);

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
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
          on:click={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
        <ToggleButton
          data-testid="timeline-replay"
          leadingIcon="play"
          size="sm"
          active={isReplaying}
          disabled={!isNotPending}
          on:click={toggleTimelineReplay}
        >
          {isReplaying
            ? translate('workflows.stop-timeline-replay')
            : translate('workflows.replay-timeline')}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>
  <div class="flex w-full flex-col">
    <TimelineGraph
      {workflow}
      groups={replayGroups}
      viewportHeight={undefined}
      error={Boolean(workflowTaskFailedError)}
      playbackNowMs={isReplaying ? playbackNowMs : null}
    />
  </div>
</div>
{#if isReplaying}
  <div
    class="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-center gap-1"
    aria-hidden="true"
  >
    <svg
      class="chicken-dance h-16 w-16 text-amber-400 drop-shadow-md"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="48" rx="14" ry="10" fill="currentColor" />
      <circle cx="32" cy="22" r="14" fill="currentColor" />
      <path
        d="M18 18 L10 12 M46 18 L54 12"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        class="chicken-wing"
      />
      <path
        d="M22 40 L12 52 M42 40 L52 52"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        class="chicken-leg"
      />
      <polygon points="26,10 30,4 34,10" fill="#f97316" />
    </svg>
    <span class="rounded bg-primary/90 px-2 py-0.5 text-xs text-primary">
      {translate('workflows.replay-timeline')}
    </span>
  </div>
{/if}

<style lang="postcss">
  .chicken-dance {
    animation: chicken-bob 0.35s ease-in-out infinite alternate;
    transform-origin: center bottom;
  }

  .chicken-wing {
    animation: chicken-flap 0.25s ease-in-out infinite alternate;
    transform-origin: 32px 18px;
  }

  .chicken-leg {
    animation: chicken-kick 0.3s ease-in-out infinite alternate;
    transform-origin: 32px 44px;
  }

  @keyframes chicken-bob {
    from {
      transform: translateY(0) rotate(-4deg);
    }

    to {
      transform: translateY(-6px) rotate(4deg);
    }
  }

  @keyframes chicken-flap {
    from {
      transform: rotate(-6deg);
    }

    to {
      transform: rotate(8deg);
    }
  }

  @keyframes chicken-kick {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(3px);
    }
  }
</style>

<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
