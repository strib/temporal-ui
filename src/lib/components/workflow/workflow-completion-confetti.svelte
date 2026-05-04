<script module lang="ts">
  export const CONFETTI_DURATION_MS = 3600;
  export const CONFETTI_PIECE_COUNT = 96;
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { shouldBlastWorkflowCompletionConfetti } from '$lib/utilities/workflow-completion-confetti';

  type ConfettiPiece = {
    color: string;
    delay: number;
    duration: number;
    id: number;
    rotation: number;
    shape: 'circle' | 'rectangle';
    size: number;
    startX: number;
    travelX: number;
    travelY: number;
  };

  const colors = [
    '#14b8a6',
    '#22c55e',
    '#38bdf8',
    '#6366f1',
    '#a855f7',
    '#ec4899',
    '#f43f5e',
    '#f59e0b',
    '#fde047',
  ];

  let visible = $state(false);
  let pieces = $state<ConfettiPiece[]>([]);
  let hasSeenStatus = false;
  let previousStatus: WorkflowStatus = null;
  let hideConfettiTimeout: ReturnType<typeof setTimeout> | undefined;

  const randomBetween = (minimum: number, maximum: number) => {
    return Math.random() * (maximum - minimum) + minimum;
  };

  const createConfettiPieces = (): ConfettiPiece[] => {
    return Array.from({ length: CONFETTI_PIECE_COUNT }, (_, id) => {
      const fromLeft = id % 2 === 0;
      return {
        color: colors[id % colors.length],
        delay: randomBetween(0, 0.45),
        duration: randomBetween(2.3, 3.4),
        id,
        rotation: randomBetween(180, 1080),
        shape: id % 4 === 0 ? 'circle' : 'rectangle',
        size: randomBetween(6, 12),
        startX: fromLeft ? randomBetween(-8, 4) : randomBetween(96, 108),
        travelX: fromLeft ? randomBetween(18, 112) : randomBetween(-112, -18),
        travelY: randomBetween(48, 106),
      };
    });
  };

  const hideConfetti = () => {
    visible = false;
    pieces = [];
  };

  const blastConfetti = () => {
    if (typeof window === 'undefined') return;

    pieces = createConfettiPieces();
    visible = true;

    if (hideConfettiTimeout) clearTimeout(hideConfettiTimeout);
    hideConfettiTimeout = setTimeout(hideConfetti, CONFETTI_DURATION_MS);
  };

  const unsubscribe = workflowRun.subscribe(({ workflow }) => {
    const status = workflow?.status ?? null;
    if (
      shouldBlastWorkflowCompletionConfetti({
        hasSeenStatus,
        previousStatus,
        status,
      })
    ) {
      blastConfetti();
    }
    previousStatus = status;
    hasSeenStatus = true;
  });

  onDestroy(() => {
    unsubscribe();
    if (hideConfettiTimeout) clearTimeout(hideConfettiTimeout);
  });
</script>

{#if visible}
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    data-testid="workflow-completion-confetti"
  >
    {#each pieces as piece (piece.id)}
      <span
        class:circle={piece.shape === 'circle'}
        class="confetti-piece"
        style={`--color: ${piece.color}; --delay: ${piece.delay}s; --duration: ${piece.duration}s; --rotation: ${piece.rotation}deg; --size: ${piece.size}px; --start-x: ${piece.startX}vw; --travel-x: ${piece.travelX}vw; --travel-y: -${piece.travelY}vh;`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-piece {
    position: absolute;
    top: 100vh;
    left: var(--start-x);
    width: calc(var(--size) * 0.7);
    height: calc(var(--size) * 1.35);
    border-radius: 2px;
    background: var(--color);
    opacity: 0;
    transform-origin: center;
    animation: workflow-completion-confetti-blast var(--duration) ease-out
      var(--delay) forwards;
  }

  .confetti-piece.circle {
    width: var(--size);
    height: var(--size);
    border-radius: 9999px;
  }

  @keyframes workflow-completion-confetti-blast {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8);
    }

    16% {
      opacity: 1;
      transform: translate3d(
          calc(var(--travel-x) * 0.35),
          calc(var(--travel-y) * 0.72),
          0
        )
        rotate(calc(var(--rotation) * 0.24)) scale(1);
    }

    62% {
      opacity: 1;
      transform: translate3d(var(--travel-x), var(--travel-y), 0)
        rotate(calc(var(--rotation) * 0.7)) scale(1);
    }

    100% {
      opacity: 0;
      transform: translate3d(
          calc(var(--travel-x) * 1.12),
          calc(var(--travel-y) + 120vh),
          0
        )
        rotate(var(--rotation)) scale(0.94);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-piece {
      animation-duration: 800ms;
      animation-delay: 0ms;
    }
  }
</style>
