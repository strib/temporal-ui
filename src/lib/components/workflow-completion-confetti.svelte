<script lang="ts">
  const particles = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: `${(index * 13) % 100}%`,
    drift: `${((index % 5) - 2) * 28}px`,
    duration: `${3 + (index % 4) * 0.35}s`,
    delay: `${(index % 7) * 0.08}s`,
    rotation: `${180 + (index % 6) * 70}deg`,
    color: ['#f97316', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'][
      index % 6
    ],
  }));
</script>

<div
  class="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
  data-testid="workflow-completion-confetti"
  aria-hidden="true"
>
  {#each particles as particle (particle.id)}
    <span
      data-testid="workflow-confetti-piece"
      class="confetti-piece"
      style={`--left:${particle.left}; --drift:${particle.drift}; --duration:${particle.duration}; --delay:${particle.delay}; --rotation:${particle.rotation}; --color:${particle.color};`}
    ></span>
  {/each}
</div>

<style>
  .confetti-piece {
    position: absolute;
    top: -10%;
    left: var(--left);
    width: 0.7rem;
    height: 1.2rem;
    border-radius: 9999px;
    background: var(--color);
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg);
    animation: confetti-fall var(--duration) ease-out var(--delay) forwards;
    will-change: transform, opacity;
  }

  @keyframes confetti-fall {
    0% {
      opacity: 0;
      transform: translate3d(0, -5vh, 0) rotate(0deg) scale(0.9);
    }

    10% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--drift), 115vh, 0) rotate(var(--rotation))
        scale(1);
    }
  }
</style>
