<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  type ConfettiPiece = {
    burstX: number;
    burstY: number;
    delay: number;
    driftX: number;
    duration: number;
    height: number;
    hue: number;
    id: string;
    originX: number;
    rotation: number;
    width: number;
  };

  type Props = {
    burstKey: number;
    durationMs?: number;
  };

  let { burstKey, durationMs = 3600 }: Props = $props();

  let pieces = $state<ConfettiPiece[]>([]);
  let lastBurstKey = $state(0);
  let prefersReducedMotion = $state(false);
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let motionQuery: MediaQueryList | null = null;

  const random = (seed: number): number => {
    const value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
  };

  const burstOrigins = [18, 50, 82];

  const createConfettiPieces = (seed: number): ConfettiPiece[] => {
    const hues = [8, 42, 72, 142, 194, 262, 332];

    return Array.from({ length: 132 }, (_, index) => {
      const burstGroup = index % burstOrigins.length;
      const width = 8 + random(seed * 103 + index) * 10;
      const height = 12 + random(seed * 107 + index) * 18;
      const duration = 2200 + random(seed * 109 + index) * 1400;
      const delay = random(seed * 113 + index) * 220;
      const burstX = (random(seed * 127 + index) - 0.5) * 56;
      const burstY = -18 - random(seed * 131 + index) * 34;
      const driftX = (random(seed * 137 + index) - 0.5) * 46;
      const rotation = (random(seed * 139 + index) - 0.5) * 1440;
      const hue = hues[index % hues.length];

      return {
        burstX,
        burstY,
        delay,
        driftX,
        duration,
        height,
        hue,
        id: `${seed}-${index}`,
        originX: burstOrigins[burstGroup],
        rotation,
        width,
      };
    });
  };

  const updateMotionPreference = () => {
    prefersReducedMotion = motionQuery?.matches ?? false;
  };

  onMount(() => {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    updateMotionPreference();
    motionQuery.addEventListener('change', updateMotionPreference);
  });

  onDestroy(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    motionQuery?.removeEventListener('change', updateMotionPreference);
  });

  $effect(() => {
    if (!burstKey || burstKey === lastBurstKey || prefersReducedMotion) {
      return;
    }

    lastBurstKey = burstKey;
    pieces = createConfettiPieces(burstKey);

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    hideTimeout = setTimeout(() => {
      pieces = [];
    }, durationMs);
  });
</script>

{#if pieces.length}
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    data-testid="workflow-completion-confetti"
  >
    <div class="confetti-glow" />
    {#each pieces as piece (piece.id)}
      <span
        class="confetti-piece"
        style={`--confetti-burst-x:${piece.burstX}; --confetti-burst-y:${piece.burstY}; --confetti-delay:${piece.delay}; --confetti-drift-x:${piece.driftX}; --confetti-duration:${piece.duration}; --confetti-height:${piece.height}; --confetti-hue:${piece.hue}; --confetti-origin-x:${piece.originX}; --confetti-rotation:${piece.rotation}; --confetti-width:${piece.width};`}
      />
    {/each}
  </div>
{/if}

<style>
  .confetti-glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 18% 10%,
        hsl(42deg 100% 72% / 28%),
        transparent 24%
      ),
      radial-gradient(
        circle at 50% 8%,
        hsl(142deg 90% 66% / 22%),
        transparent 24%
      ),
      radial-gradient(
        circle at 82% 10%,
        hsl(332deg 96% 70% / 24%),
        transparent 24%
      );
    opacity: 0;
    animation: confetti-glow-fade 1400ms ease-out forwards;
  }

  .confetti-piece {
    position: absolute;
    top: 8vh;
    left: calc(var(--confetti-origin-x) * 1%);
    width: calc(var(--confetti-width) * 1px);
    height: calc(var(--confetti-height) * 1px);
    border-radius: 999px;
    background: linear-gradient(
      135deg,
      hsl(var(--confetti-hue) 90% 62%),
      hsl(calc(var(--confetti-hue) + 24) 95% 75%)
    );
    box-shadow: 0 0 18px hsl(var(--confetti-hue) 90% 62% / 22%);
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(0.2);
    animation: confetti-burst calc(var(--confetti-duration) * 1ms)
      cubic-bezier(0.18, 0.88, 0.22, 1) forwards;
    animation-delay: calc(var(--confetti-delay) * 1ms);
    will-change: transform, opacity;
  }

  @keyframes confetti-glow-fade {
    0% {
      opacity: 0;
    }

    15% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  @keyframes confetti-burst {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(0.2);
    }

    12% {
      opacity: 1;
      transform: translate3d(
          calc(var(--confetti-burst-x) * 1vw),
          calc(var(--confetti-burst-y) * 1vh),
          0
        )
        rotate(calc(var(--confetti-rotation) * 0.25deg)) scale(1.05);
    }

    35% {
      opacity: 1;
      transform: translate3d(
          calc((var(--confetti-burst-x) + var(--confetti-drift-x) * 0.2) * 1vw),
          16vh,
          0
        )
        rotate(calc(var(--confetti-rotation) * 0.6deg)) scale(1);
    }

    100% {
      opacity: 0;
      transform: translate3d(
          calc((var(--confetti-burst-x) + var(--confetti-drift-x)) * 1vw),
          108vh,
          0
        )
        rotate(calc(var(--confetti-rotation) * 1deg)) scale(0.9);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-glow,
    .confetti-piece {
      animation: none;
    }
  }
</style>
