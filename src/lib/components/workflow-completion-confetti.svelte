<script lang="ts">
  import { onDestroy } from 'svelte';

  import { browser } from '$app/environment';

  type ConfettiPiece = {
    id: number;
    round: boolean;
    style: string;
  };

  type Props = {
    blastKey?: number;
  };

  let { blastKey = 0 }: Props = $props();

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
  const pieceCount = 120;
  const clearAfterMs = 3000;

  let pieces = $state<ConfettiPiece[]>([]);
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const randomBetween = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const createPiece = (
    id: number,
    viewportWidth: number,
    viewportHeight: number,
  ): ConfettiPiece => {
    const originX = viewportWidth * randomBetween(0.08, 0.92);
    const originY = viewportHeight * randomBetween(0.08, 0.22);
    const endX = viewportWidth * randomBetween(-0.08, 1.08);
    const endY = viewportHeight * randomBetween(0.55, 1.05);
    const size = randomBetween(6, 14);
    const duration = randomBetween(1600, 2600);
    const delay = randomBetween(0, 260);
    const color = colors[id % colors.length];

    return {
      id,
      round: id % 5 === 0,
      style: [
        `--confetti-x-start: ${originX}px`,
        `--confetti-y-start: ${originY}px`,
        `--confetti-x-end: ${endX}px`,
        `--confetti-y-end: ${endY}px`,
        `--confetti-size: ${size}px`,
        `--confetti-rotation: ${randomBetween(360, 1440)}deg`,
        `--confetti-duration: ${duration}ms`,
        `--confetti-delay: ${delay}ms`,
        `--confetti-color: ${color}`,
      ].join(';'),
    };
  };

  const blast = (): void => {
    if (!browser || !blastKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const viewportWidth = window.innerWidth || 1200;
    const viewportHeight = window.innerHeight || 800;

    clearTimeout(timeout);
    pieces = Array.from({ length: pieceCount }, (_, index) =>
      createPiece(index, viewportWidth, viewportHeight),
    );
    timeout = setTimeout(() => {
      pieces = [];
    }, clearAfterMs);
  };

  $effect(() => {
    blast();
  });

  onDestroy(() => {
    clearTimeout(timeout);
  });
</script>

{#if pieces.length}
  <div
    class="confetti-overlay"
    aria-hidden="true"
    data-testid="workflow-completion-confetti"
  >
    {#each pieces as piece (piece.id)}
      <span class:round={piece.round} style={piece.style}></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-overlay {
    pointer-events: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow: hidden;
  }

  span {
    position: absolute;
    top: var(--confetti-y-start);
    left: var(--confetti-x-start);
    width: var(--confetti-size);
    height: calc(var(--confetti-size) * 0.58);
    border-radius: 2px;
    background: var(--confetti-color);
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg);
    animation: confetti-blast var(--confetti-duration)
      cubic-bezier(0.14, 0.82, 0.24, 1) var(--confetti-delay) forwards;
  }

  .round {
    height: var(--confetti-size);
    border-radius: 9999px;
  }

  @keyframes confetti-blast {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) rotate(0deg);
    }

    8% {
      opacity: 1;
    }

    70% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(
          calc(var(--confetti-x-end) - var(--confetti-x-start)),
          calc(var(--confetti-y-end) - var(--confetti-y-start)),
          0
        )
        rotate(var(--confetti-rotation));
    }
  }
</style>
