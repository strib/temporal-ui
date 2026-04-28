<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  type Particle = {
    id: number;
    color: string;
    delay: number;
    duration: number;
    rotation: number;
    size: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  };

  type Props = {
    status?: WorkflowStatus;
  };

  let { status = null }: Props = $props();

  let particles = $state<Particle[]>([]);
  let previousStatus: WorkflowStatus | undefined = undefined;
  let hasObservedStatus = false;
  let reduceMotion = false;
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

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

  const createParticle = (id: number): Particle => {
    const emitters = [18, 50, 82];
    const startX = emitters[id % emitters.length] + (Math.random() - 0.5) * 10;

    return {
      id,
      color: colors[id % colors.length],
      delay: Math.random() * 160,
      duration: 1800 + Math.random() * 1100,
      rotation: Math.round((Math.random() - 0.5) * 1080),
      size: 6 + Math.random() * 8,
      startX,
      startY: 14 + Math.random() * 10,
      x: (Math.random() - 0.5) * 110,
      y: 40 + Math.random() * 45,
    };
  };

  const burst = () => {
    if (reduceMotion) return;

    clearTimeout(cleanupTimer);
    particles = Array.from({ length: 96 }, (_, id) => createParticle(id));
    cleanupTimer = setTimeout(() => {
      particles = [];
    }, 3200);
  };

  $effect(() => {
    if (!hasObservedStatus) {
      previousStatus = status;
      hasObservedStatus = true;
      return;
    }

    if (
      previousStatus !== undefined &&
      previousStatus !== 'Completed' &&
      status === 'Completed'
    ) {
      burst();
    }

    previousStatus = status;
  });

  onMount(() => {
    reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  });

  onDestroy(() => {
    clearTimeout(cleanupTimer);
  });
</script>

{#if particles.length}
  <div
    aria-hidden="true"
    class="confetti"
    data-testid="workflow-completion-confetti"
  >
    {#each particles as particle (particle.id)}
      <span
        class="particle"
        style={`--color: ${particle.color}; --delay: ${particle.delay}ms; --duration: ${particle.duration}ms; --rotation: ${particle.rotation}deg; --size: ${particle.size}px; --start-x: ${particle.startX}vw; --start-y: ${particle.startY}vh; --x: ${particle.x}vw; --y: ${particle.y}vh;`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: var(--size);
    height: calc(var(--size) * 0.55);
    border-radius: 2px;
    background: var(--color);
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg);
    animation: confetti-burst var(--duration) cubic-bezier(0.16, 0.8, 0.3, 1)
      var(--delay) forwards;
  }

  .particle:nth-child(3n) {
    border-radius: 9999px;
  }

  .particle:nth-child(4n) {
    height: var(--size);
  }

  @keyframes confetti-burst {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(0deg);
    }

    70% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--x), var(--y), 0) rotate(var(--rotation));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .particle {
      animation: none;
    }
  }
</style>
