<script lang="ts">
  import { browser } from '$app/environment';

  type Props = {
    trigger: number;
  };

  type Particle = {
    id: string;
    color: string;
    delay: number;
    drift: number;
    duration: number;
    left: number;
    rotation: number;
    shape: 'circle' | 'rect';
    size: number;
  };

  const colors = [
    '#7c3aed',
    '#db2777',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
  ];

  const particleCount = 120;

  let { trigger }: Props = $props();

  let particles = $state<Particle[]>([]);

  let clearTimer: ReturnType<typeof setTimeout> | null = null;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const createParticle = (index: number): Particle => {
    const color = colors[index % colors.length];
    const size = 8 + Math.random() * 10;

    return {
      id: `${trigger}-${index}`,
      color,
      delay: Math.random() * 200,
      drift: -220 + Math.random() * 440,
      duration: 1800 + Math.random() * 900,
      left: Math.random() * 100,
      rotation: -540 + Math.random() * 1080,
      shape: Math.random() > 0.3 ? 'rect' : 'circle',
      size,
    };
  };

  const blast = () => {
    if (!browser || prefersReducedMotion()) return;

    if (clearTimer) clearTimeout(clearTimer);

    particles = Array.from({ length: particleCount }, (_, index) =>
      createParticle(index),
    );

    clearTimer = setTimeout(() => {
      particles = [];
      clearTimer = null;
    }, 3000);
  };

  $effect(() => {
    if (!trigger) return;

    blast();

    return () => {
      if (clearTimer) {
        clearTimeout(clearTimer);
        clearTimer = null;
      }
    };
  });
</script>

{#if particles.length > 0}
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    data-testid="workflow-completion-confetti"
  >
    {#each particles as particle (particle.id)}
      <span
        class="confetti-piece {particle.shape}"
        style={`--confetti-color:${particle.color};--confetti-delay:${particle.delay}ms;--confetti-drift:${particle.drift}px;--confetti-duration:${particle.duration}ms;--confetti-left:${particle.left}%;--confetti-rotation:${particle.rotation}deg;--confetti-size:${particle.size}px;`}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti-piece {
    position: absolute;
    left: var(--confetti-left);
    top: -12vh;
    width: var(--confetti-size);
    height: calc(var(--confetti-size) * 1.6);
    background: var(--confetti-color);
    opacity: 0;
    will-change: opacity, transform;
    animation:
      confetti-fall var(--confetti-duration) cubic-bezier(0.16, 0.84, 0.44, 1)
        forwards,
      confetti-spin calc(var(--confetti-duration) * 0.4) linear infinite;
    animation-delay: var(--confetti-delay), var(--confetti-delay);
  }

  .confetti-piece.circle {
    border-radius: 9999px;
    height: var(--confetti-size);
  }

  .confetti-piece.rect {
    border-radius: 2px;
  }

  @keyframes confetti-fall {
    0% {
      opacity: 0;
      transform: translate3d(0, -15vh, 0) scale(0.8);
    }

    10% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--confetti-drift), 115vh, 0)
        rotate(var(--confetti-rotation)) scale(1.05);
    }
  }

  @keyframes confetti-spin {
    0% {
      rotate: 0deg;
    }

    100% {
      rotate: 360deg;
    }
  }
</style>
