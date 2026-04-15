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
    pauseLiveUpdates,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    getReplayActivities,
    getReplayPlaybackDurationMs,
    getReplayWindow,
  } from '$lib/utilities/activity-replay';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
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
  $: replayActivities = getReplayActivities(ascendingGroups);
  $: replayWindow = getReplayWindow(replayActivities);
  $: replayPlaybackDurationMs = replayWindow
    ? getReplayPlaybackDurationMs(replayWindow)
    : 0;

  $: workflowTaskFailedError = getWorkflowTaskFailedEvent(
    $currentEventHistory,
    'ascending',
  );

  $: isNotPending = workflow && !workflow?.isRunning && !workflow?.isPaused;
  $: canReplayActivities =
    workflow?.status === 'Completed' &&
    replayActivities.length > 0 &&
    !!replayWindow;

  let replayAnimationFrame = 0;
  let replayStartedAt = 0;
  let replayCurrentTimeMs: number | null = null;
  let replayActive = false;
  let replayResetTimeout: ReturnType<typeof setTimeout> | null = null;

  beforeNavigate(() => {
    clearActives();
    stopReplay();
  });

  $: {
    if (isNotPending && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  }

  let showDownloadPrompt = false;

  const stopReplay = (reset = true) => {
    if (replayAnimationFrame) {
      cancelAnimationFrame(replayAnimationFrame);
    }

    if (replayResetTimeout) {
      clearTimeout(replayResetTimeout);
    }

    replayAnimationFrame = 0;
    replayStartedAt = 0;
    replayActive = false;
    replayResetTimeout = null;

    if (reset) {
      replayCurrentTimeMs = null;
    }
  };

  const stepReplay = (now: number) => {
    if (!replayWindow) {
      stopReplay();
      return;
    }

    if (!replayStartedAt) {
      replayStartedAt = now;
    }

    const elapsed = now - replayStartedAt;
    const progress = Math.min(
      elapsed / Math.max(replayPlaybackDurationMs, 1),
      1,
    );
    const nextReplayTime =
      replayWindow.startTimeMs + replayWindow.durationMs * progress;

    if (nextReplayTime >= replayWindow.endTimeMs) {
      replayCurrentTimeMs = replayWindow.endTimeMs;
      replayActive = false;
      replayAnimationFrame = 0;
      replayStartedAt = 0;
      replayResetTimeout = setTimeout(() => {
        replayCurrentTimeMs = null;
        replayResetTimeout = null;
      }, 900);
      return;
    }

    replayCurrentTimeMs = nextReplayTime;
    replayAnimationFrame = requestAnimationFrame(stepReplay);
  };

  const toggleActivityReplay = () => {
    if (replayActive) {
      stopReplay();
      return;
    }

    if (!replayWindow) {
      return;
    }

    stopReplay();
    replayActive = true;
    replayCurrentTimeMs = replayWindow.startTimeMs;
    replayAnimationFrame = requestAnimationFrame(stepReplay);
  };

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

  $: if (
    !canReplayActivities &&
    (replayActive || replayCurrentTimeMs !== null)
  ) {
    stopReplay();
  }

  onDestroy(() => {
    stopReplay();
  });
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
      {#if canReplayActivities}
        <Button
          size="sm"
          variant="secondary"
          active={replayActive}
          data-testid="activity-replay-button"
          leadingIcon={replayActive ? 'pause' : 'play'}
          on:click={toggleActivityReplay}
        >
          {replayActive
            ? translate('workflows.stop-activity-replay')
            : translate('workflows.replay-activities')}
        </Button>
      {/if}
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
      </ToggleButtons>
    </div>
  </div>
  <div class="flex w-full flex-col">
    <TimelineGraph
      {workflow}
      {groups}
      viewportHeight={undefined}
      error={Boolean(workflowTaskFailedError)}
      {replayCurrentTimeMs}
      {replayActive}
    />
  </div>
</div>
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
