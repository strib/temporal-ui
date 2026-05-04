<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  export let status: WorkflowStatus = null;
  export let runId: string | null | undefined = null;
  export let durationMs = 4200;

  const colors = [
    '#0ea5e9',
    '#22c55e',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#ef4444',
  ];

  const confettiPieces = Array.from({ length: 42 }, (_, index) => {
    const size = 10 + (index % 4) * 3;
    const shapeIndex = index % 3;
    return {
      id: index,
      color: colors[index % colors.length],
      left: `${2 + ((index * 11) % 96)}%`,
      delay: `${(index % 7) * 60}ms`,
      duration: `${2600 + (index % 6) * 180}ms`,
      drift: `${(index % 2 === 0 ? 1 : -1) * (10 + (index % 5) * 5)}vw`,
      rotation: `${(index * 47) % 360}deg`,
      size: `${size}px`,
      shape:
        shapeIndex === 0 ? 'circle' : shapeIndex === 1 ? 'square' : 'ribbon',
    };
  });

  let active = false;
  let burstKey = 0;
  let previousRunId: string | null = null;
  let previousStatus: WorkflowStatus = null;
  let hideTimeout: ReturnType<typeof setTimeout> | undefined;

  const clearHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
  };

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const trigger = () => {
    if (prefersReducedMotion()) {
      return;
    }

    clearHideTimeout();
    burstKey += 1;
    active = true;
    hideTimeout = setTimeout(() => {
      active = false;
    }, durationMs);
  };

  $: {
    const nextRunId = runId ?? null;
    const nextStatus = status ?? null;

    if (nextRunId !== previousRunId) {
      previousRunId = nextRunId;
      previousStatus = nextStatus;
      active = false;
      clearHideTimeout();
    } else if (
      previousStatus &&
      previousStatus !== 'Completed' &&
      nextStatus === 'Completed'
    ) {
      trigger();
      previousStatus = nextStatus;
    } else {
      previousStatus = nextStatus;
    }
  }

  onDestroy(() => {
    clearHideTimeout();
  });
</script>

{#if active}
  <div
    class="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    aria-hidden="true"
    data-testid="workflow-completion-confetti"
    data-burst={burstKey}
  >
    {#key burstKey}
      <div class="absolute inset-0">
        {#each confettiPieces as piece (piece.id)}
          <span
            class={`confetti-piece ${piece.shape}`}
            style={`--left:${piece.left}; --delay:${piece.delay}; --duration:${piece.duration}; --drift:${piece.drift}; --rotation:${piece.rotation}; --size:${piece.size}; --color:${piece.color};`}
            data-testid="workflow-completion-confetti-piece"
          >
            <span class="confetti-piece-inner"></span>
          </span>
        {/each}
      </div>
    {/key}
  </div>
{/if}

<style>
  .confetti-piece {
    position: absolute;
    left: var(--left);
    top: -18vh;
    width: var(--size);
    height: calc(var(--size) * 2.1);
    opacity: 0;
    animation: confetti-fall var(--duration) cubic-bezier(0.16, 0.84, 0.24, 1)
      var(--delay) forwards;
  }

  .confetti-piece-inner {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color);
    animation: confetti-spin 560ms linear var(--delay) infinite;
  }

  .confetti-piece.circle,
  .confetti-piece.circle .confetti-piece-inner {
    border-radius: 999px;
  }

  .confetti-piece.square,
  .confetti-piece.square .confetti-piece-inner {
    border-radius: 2px;
  }

  .confetti-piece.ribbon,
  .confetti-piece.ribbon .confetti-piece-inner {
    width: calc(var(--size) * 0.7);
    height: calc(var(--size) * 2.8);
    border-radius: 999px;
  }

  @keyframes confetti-fall {
    0% {
      opacity: 0;
      transform: translate3d(calc(var(--drift) * -0.18), -16vh, 0)
        rotate(var(--rotation)) scale(0.8);
    }

    12% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--drift), 112vh, 0)
        rotate(calc(var(--rotation) + 460deg)) scale(1);
    }
  }

  @keyframes confetti-spin {
    0% {
      transform: rotate(0deg) scaleX(1);
    }

    50% {
      transform: rotate(180deg) scaleX(0.55);
    }

    100% {
      transform: rotate(360deg) scaleX(1);
    }
  }
</style>
