<script lang="ts">
  import { BROWSER } from 'esm-env';
  import { onDestroy } from 'svelte';

  type Props = {
    trigger?: number;
  };

  type ConfettiPiece = {
    id: number;
    color: string;
    delay: number;
    drift: number;
    duration: number;
    left: number;
    rotation: number;
    size: number;
  };

  const colors = [
    '#00A3FF',
    '#00C48C',
    '#9B5CFF',
    '#FFC857',
    '#FF5C8A',
    '#34D399',
  ];
  const pieceCount = 140;
  const hideDelay = 3600;

  let { trigger = 0 }: Props = $props();
  let confettiPieces = $state<ConfettiPiece[]>([]);
  let previousTrigger = $state(0);
  let visible = $state(false);
  let hideTimeout: ReturnType<typeof setTimeout>;

  const createConfettiPieces = (): ConfettiPiece[] => {
    return Array.from({ length: pieceCount }, (_, id) => ({
      id,
      color: colors[id % colors.length],
      delay: Math.random() * 0.5,
      drift: Math.random() * 480 - 240,
      duration: Math.random() * 1.3 + 2,
      left: Math.random() * 100,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 6,
    }));
  };

  const blastConfetti = () => {
    if (!BROWSER) return;

    clearTimeout(hideTimeout);
    confettiPieces = createConfettiPieces();
    visible = true;
    hideTimeout = setTimeout(() => {
      visible = false;
    }, hideDelay);
  };

  $effect(() => {
    if (trigger === previousTrigger) return;

    previousTrigger = trigger;
    if (trigger > 0) blastConfetti();
  });

  onDestroy(() => {
    clearTimeout(hideTimeout);
  });
</script>

{#if visible}
  <div
    class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    data-testid="workflow-completion-confetti"
    aria-hidden="true"
  >
    {#each confettiPieces as piece (piece.id)}
      <span
        class="confetti-piece"
        style={`--confetti-color: ${piece.color}; --confetti-delay: ${piece.delay}s; --confetti-drift: ${piece.drift}px; --confetti-duration: ${piece.duration}s; --confetti-left: ${piece.left}%; --confetti-rotation: ${piece.rotation}deg; --confetti-size: ${piece.size}px;`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-piece {
    position: absolute;
    top: -10vh;
    left: var(--confetti-left);
    width: var(--confetti-size);
    height: calc(var(--confetti-size) * 0.45);
    border-radius: 2px;
    background: var(--confetti-color);
    opacity: 0;
    animation: confetti-fall var(--confetti-duration) ease-in
      var(--confetti-delay) forwards;
    will-change: transform, opacity;
  }

  .confetti-piece:nth-child(3n) {
    height: var(--confetti-size);
    border-radius: 9999px;
  }

  .confetti-piece:nth-child(4n) {
    height: calc(var(--confetti-size) * 0.8);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }

  @keyframes confetti-fall {
    0% {
      opacity: 1;
      transform: translate3d(0, -10vh, 0) rotate(var(--confetti-rotation));
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--confetti-drift), 110vh, 0)
        rotate(calc(var(--confetti-rotation) + 900deg));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-piece {
      animation-duration: 1ms;
    }
  }
</style>
