<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  interface Props {
    status?: WorkflowStatus;
  }

  type ConfettiPiece = {
    id: string;
    color: string;
    delay: number;
    drift: number;
    duration: number;
    rotation: number;
    shape: 'circle' | 'rectangle' | 'ribbon';
    size: number;
    x: number;
  };

  const colors = [
    '#14b8a6',
    '#22c55e',
    '#38bdf8',
    '#6366f1',
    '#a855f7',
    '#eab308',
    '#f97316',
    '#f43f5e',
  ];
  const shapes: ConfettiPiece['shape'][] = ['circle', 'rectangle', 'ribbon'];
  const pieceCount = 140;
  const blastDuration = 3200;

  let { status }: Props = $props();
  let previousStatus = $state<WorkflowStatus | undefined>();
  let pieces = $state<ConfettiPiece[]>([]);
  let blastId = $state(0);
  let clearTimer: ReturnType<typeof setTimeout> | undefined;

  const randomBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const createPieces = (): ConfettiPiece[] => {
    return Array.from({ length: pieceCount }, (_, index) => ({
      id: `${blastId}-${index}`,
      color: colors[index % colors.length],
      delay: randomBetween(0, 0.45),
      drift: randomBetween(-34, 34),
      duration: randomBetween(1.8, 3.1),
      rotation: randomBetween(0, 360),
      shape: shapes[index % shapes.length],
      size: randomBetween(6, 13),
      x: randomBetween(0, 100),
    }));
  };

  const blastConfetti = () => {
    blastId += 1;
    pieces = createPieces();

    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      pieces = [];
    }, blastDuration);
  };

  $effect(() => {
    if (
      status === 'Completed' &&
      previousStatus &&
      previousStatus !== 'Completed'
    ) {
      blastConfetti();
    }

    previousStatus = status;
  });

  onDestroy(() => {
    clearTimeout(clearTimer);
  });
</script>

{#if pieces.length}
  <div
    class="pointer-events-none fixed inset-0 z-[1000] overflow-hidden"
    data-testid="workflow-completion-confetti"
    aria-hidden="true"
  >
    {#each pieces as piece (piece.id)}
      <span
        class={`confetti-piece ${piece.shape}`}
        data-testid="workflow-completion-confetti-piece"
        style={`--color: ${piece.color}; --delay: ${piece.delay}s; --drift: ${piece.drift}vw; --duration: ${piece.duration}s; --rotation: ${piece.rotation}deg; --size: ${piece.size}px; --x: ${piece.x}vw;`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-piece {
    position: absolute;
    top: -1rem;
    left: 0;
    width: var(--size);
    height: calc(var(--size) * 0.55);
    border-radius: 2px;
    background: var(--color);
    opacity: 0.96;
    transform: translate3d(var(--x), -2rem, 0) rotate(var(--rotation));
    animation: confetti-fall var(--duration) cubic-bezier(0.16, 0.72, 0.28, 1)
      var(--delay) forwards;
    will-change: transform, opacity;
  }

  .confetti-piece.circle {
    height: var(--size);
    border-radius: 9999px;
  }

  .confetti-piece.ribbon {
    width: calc(var(--size) * 0.42);
    height: calc(var(--size) * 1.45);
  }

  @keyframes confetti-fall {
    0% {
      opacity: 0;
      transform: translate3d(var(--x), -2rem, 0) rotate(var(--rotation));
    }

    8% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(calc(var(--x) + var(--drift)), 105vh, 0)
        rotate(calc(var(--rotation) + 760deg));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-piece {
      animation: none;
      opacity: 0;
    }
  }
</style>
