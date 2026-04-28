<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { portal } from '$lib/holocene/portal/portal-action';

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
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
  let burstTimeouts: number[] = [];
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
    const nextParticles = Array.from(
      { length: count },
      (): Particle => ({
        x: originX,
        y: originY,
        vx: randomBetween(-10, 10),
        vy: randomBetween(-20, -8),
        width: randomBetween(10, 22),
        height: randomBetween(8, 18),
        rotation: randomBetween(0, Math.PI * 2),
        rotationVelocity: randomBetween(-0.35, 0.35),
        color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
        shape: Math.random() > 0.2 ? 'rect' : 'circle',
        alpha: 1,
      }),
    );

    particles = [...particles, ...nextParticles];
  };

  const drawParticle = (particle: Particle) => {
    if (!context) return;

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = Math.max(particle.alpha, 0);
    context.fillStyle = particle.color;
    context.shadowColor = particle.color;
    context.shadowBlur = 8;

    if (particle.shape === 'circle') {
      context.beginPath();
      context.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height,
      );
    }

    context.restore();
  };

  const step = () => {
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles
      .map((particle) => {
        const nextVy = particle.vy + 0.22;
        const nextX = particle.x + particle.vx;
        const nextY = particle.y + nextVy;
        const nextAlpha = particle.alpha - 0.0065;

        return {
          ...particle,
          x: nextX,
          y: nextY,
          vx: particle.vx * 0.994,
          vy: nextVy * 0.996,
          alpha: nextAlpha,
          rotation: particle.rotation + particle.rotationVelocity,
        };
      })
      .filter(
        (particle) =>
          particle.alpha > 0 &&
          particle.y < canvas.height + 80 &&
          particle.x > -80 &&
          particle.x < canvas.width + 80,
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

    for (const timeout of burstTimeouts) {
      clearTimeout(timeout);
    }
    burstTimeouts = [];
    particles = [];

    resizeCanvas();

    const waveOrigins = [0.08, 0.24, 0.4, 0.6, 0.76, 0.92];
    const waveHeights = [
      Math.max(window.innerHeight * 0.24, 140),
      Math.max(window.innerHeight * 0.18, 120),
      Math.max(window.innerHeight * 0.14, 100),
    ];

    const launchWave = (originY: number) => {
      for (const horizontalOrigin of waveOrigins) {
        spawnBurst(window.innerWidth * horizontalOrigin, originY, 90);
      }
    };

    launchWave(waveHeights[0]);
    burstTimeouts.push(
      window.setTimeout(() => launchWave(waveHeights[1]), 140),
      window.setTimeout(() => launchWave(waveHeights[2]), 280),
    );

    if (!animationFrame) {
      active = true;
      animationFrame = window.requestAnimationFrame(step);
    }
  };

  onMount(() => {
    mounted = true;
    context = canvas.getContext('2d');
    reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  onDestroy(() => {
    for (const timeout of burstTimeouts) {
      clearTimeout(timeout);
    }
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
  use:portal
  aria-hidden="true"
  class:pointer-events-none={true}
  class:opacity-0={!active}
  class:opacity-100={active}
  class="fixed inset-0 z-[70] h-screen w-screen transition-opacity duration-150"
></canvas>
