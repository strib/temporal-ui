<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  type ConfettiPiece = {
    id: number;
    color: string;
    left: number;
    size: number;
    duration: number;
    delay: number;
    rotation: number;
    drift: number;
    restingTop: number;
  };

  const colors = ['#1ff1a5', '#14b8a6', '#facc15', '#fb7185', '#60a5fa'];
  const pieceCount = 180;
  const animationDuration = 5200;

  const createPieces = (): ConfettiPiece[] => {
    return Array.from({ length: pieceCount }, (_, id) => ({
      id,
      color: colors[id % colors.length],
      left: Math.random() * 100,
      size: 8 + Math.random() * 12,
      duration: 3000 + Math.random() * 1600,
      delay: Math.random() * 450,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 90,
      restingTop: 8 + Math.random() * 76,
    }));
  };

  let pieces = $state<ConfettiPiece[]>([]);
  let visible = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    pieces = createPieces();
    visible = true;
    timeout = setTimeout(() => {
      visible = false;
    }, animationDuration);
  });

  onDestroy(() => {
    clearTimeout(timeout);
  });
</script>

{#if visible}
  <div
    class="pointer-events-none fixed inset-0 z-[1000] overflow-hidden"
    aria-hidden="true"
    data-testid="workflow-completion-confetti"
  >
    {#each pieces as piece (piece.id)}
      <span
        class="confetti-piece absolute block rounded-sm"
        style:--confetti-color={piece.color}
        style:--confetti-left={`${piece.left}%`}
        style:--confetti-size={`${piece.size}px`}
        style:--confetti-duration={`${piece.duration}ms`}
        style:--confetti-delay={`${piece.delay}ms`}
        style:--confetti-rotation={`${piece.rotation}deg`}
        style:--confetti-drift={`${piece.drift}vw`}
        style:--confetti-resting-top={`${piece.restingTop}vh`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-piece {
    top: -20px;
    left: var(--confetti-left);
    width: var(--confetti-size);
    height: calc(var(--confetti-size) * 1.7);
    background-color: var(--confetti-color);
    opacity: 0;
    transform: translate3d(0, -20px, 0) rotate(var(--confetti-rotation));
    animation: workflow-completion-confetti var(--confetti-duration) ease-out
      var(--confetti-delay) forwards;
  }

  @keyframes workflow-completion-confetti {
    0% {
      opacity: 1;
      transform: translate3d(0, -20px, 0) rotate(var(--confetti-rotation));
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--confetti-drift), 105vh, 0)
        rotate(calc(var(--confetti-rotation) + 720deg));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-piece {
      animation: none;
      top: var(--confetti-resting-top);
      opacity: 1;
      transform: rotate(var(--confetti-rotation));
    }
  }
</style>
