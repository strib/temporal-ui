<script lang="ts">
  import { BROWSER } from 'esm-env';
  import { onDestroy } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  interface Props {
    runId?: string;
    status?: WorkflowStatus;
  }

  let { runId, status }: Props = $props();

  const colors = [
    '#7c3aed',
    '#2563eb',
    '#0891b2',
    '#16a34a',
    '#f59e0b',
    '#ec4899',
  ];
  const confettiPieces = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: (index * 17 + (index % 5) * 3) % 100,
    width: 8 + (index % 4) * 2,
    height: 12 + (index % 3) * 4,
    drift: (index % 2 === 0 ? 1 : -1) * (22 + (index % 6) * 10),
    delay: (index % 7) * 80,
    fallDuration: 2200 + (index % 5) * 260,
    spinDuration: 650 + (index % 4) * 140,
    color: colors[index % colors.length],
    round: index % 5 === 0,
  }));

  let celebrationKey = $state(0);
  let isVisible = $state(false);
  let lastCelebratedRunId = $state<string>();
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (status === 'Completed') return;

    clearTimeout(hideTimer);
    isVisible = false;
  });

  $effect(() => {
    if (
      status !== 'Completed' ||
      !runId ||
      !BROWSER ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    if (lastCelebratedRunId === runId) return;

    lastCelebratedRunId = runId;
    celebrationKey += 1;
    isVisible = true;

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      isVisible = false;
    }, 4200);
  });

  onDestroy(() => {
    clearTimeout(hideTimer);
  });
</script>

{#if isVisible}
  {#key celebrationKey}
    <div
      class="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
      data-testid="workflow-completion-confetti"
    >
      {#each confettiPieces as piece (piece.id)}
        <span
          class="confetti-piece"
          class:rounded-full={piece.round}
          style={`--left:${piece.left}%; --width:${piece.width}px; --height:${piece.height}px; --delay:${piece.delay}ms; --drift:${piece.drift}px; --fall-duration:${piece.fallDuration}ms; --spin-duration:${piece.spinDuration}ms; --color:${piece.color};`}
        >
          <span class="confetti-shape"></span>
        </span>
      {/each}
    </div>
  {/key}
{/if}

<style>
  .confetti-piece {
    position: absolute;
    top: -10vh;
    left: var(--left);
    width: var(--width);
    height: var(--height);
    animation: confetti-fall var(--fall-duration) ease-out var(--delay) forwards;
  }

  .confetti-shape {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color);
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 20%);
    animation: confetti-spin var(--spin-duration) linear var(--delay) infinite;
  }

  .rounded-full .confetti-shape {
    border-radius: 9999px;
  }

  @keyframes confetti-fall {
    0% {
      transform: translate3d(0, -10vh, 0);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    100% {
      transform: translate3d(var(--drift), 110vh, 0);
      opacity: 0;
    }
  }

  @keyframes confetti-spin {
    0% {
      transform: rotate(0deg) scale(1);
    }

    50% {
      transform: rotate(180deg) scale(0.85);
    }

    100% {
      transform: rotate(360deg) scale(1);
    }
  }
</style>
