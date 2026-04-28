<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationVelocity: number;
    color: string;
    shape: 'circle' | 'rect';
    alpha: number;
  };

  export let burstCount = 0;

  const colors = [
    '#f43f5e',
    '#fb7185',
    '#f59e0b',
    '#facc15',
    '#22c55e',
    '#2dd4bf',
    '#38bdf8',
    '#818cf8',
    '#c084fc',
  ] as const;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let particles: Particle[] = [];
  let animationFrame = 0;
  let mounted = false;
  let lastBurstCount = 0;
  let reducedMotion = false;
  let active = false;

  const randomBetween = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

  const resizeCanvas = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawnBurst = (originX: number, originY: number, count: number) => {
    const nextParticles = Array.from({ length: count }, (): Particle => ({
      x: originX,
      y: originY,
      vx: randomBetween(-7, 7),
      vy: randomBetween(-14, -6),
      size: randomBetween(6, 12),
      rotation: randomBetween(0, Math.PI * 2),
      rotationVelocity: randomBetween(-0.25, 0.25),
      color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
      shape: Math.random() > 0.35 ? 'rect' : 'circle',
      alpha: 1,
    }));

    particles = [...particles, ...nextParticles];
  };

  const drawParticle = (particle: Particle) => {
    if (!context) return;

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = Math.max(particle.alpha, 0);
    context.fillStyle = particle.color;

    if (particle.shape === 'circle') {
      context.beginPath();
      context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(
        -particle.size / 2,
        -particle.size / 4,
        particle.size,
        particle.size / 2,
      );
    }

    context.restore();
  };

  const step = () => {
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles
      .map((particle) => {
        const nextVy = particle.vy + 0.28;
        const nextX = particle.x + particle.vx;
        const nextY = particle.y + nextVy;
        const nextAlpha = particle.alpha - 0.012;

        return {
          ...particle,
          x: nextX,
          y: nextY,
          vx: particle.vx * 0.992,
          vy: nextVy * 0.992,
          alpha: nextAlpha,
          rotation: particle.rotation + particle.rotationVelocity,
        };
      })
      .filter(
        (particle) =>
          particle.alpha > 0 &&
          particle.y < canvas.height + 40 &&
          particle.x > -40 &&
          particle.x < canvas.width + 40,
      );

    for (const particle of particles) {
      drawParticle(particle);
    }

    active = particles.length > 0;

    if (active) {
      animationFrame = window.requestAnimationFrame(step);
    } else {
      animationFrame = 0;
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const triggerBurst = () => {
    if (!mounted || !context || reducedMotion) return;

    resizeCanvas();

    const originY = Math.max(window.innerHeight * 0.18, 96);

    spawnBurst(window.innerWidth * 0.18, originY, 70);
    spawnBurst(window.innerWidth * 0.5, originY * 0.72, 90);
    spawnBurst(window.innerWidth * 0.82, originY, 70);

    if (!animationFrame) {
      active = true;
      animationFrame = window.requestAnimationFrame(step);
    }
  };

  onMount(() => {
    mounted = true;
    context = canvas.getContext('2d');
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  onDestroy(() => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  });

  $: if (mounted && burstCount > lastBurstCount) {
    lastBurstCount = burstCount;
    triggerBurst();
  }
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class:pointer-events-none={true}
  class:opacity-0={!active}
  class:opacity-100={active}
  class="fixed inset-0 z-50 transition-opacity duration-300"
/>
