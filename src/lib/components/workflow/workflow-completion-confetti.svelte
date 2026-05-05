<script lang="ts">
  import { BROWSER } from 'esm-env';
  import { onDestroy } from 'svelte';

  interface Props {
    fire?: number;
  }

  type Particle = {
    color: string;
    height: number;
    rotation: number;
    rotationSpeed: number;
    timeToLive: number;
    velocityX: number;
    velocityY: number;
    width: number;
    x: number;
    y: number;
  };

  let { fire = 0 }: Props = $props();

  const colors = [
    '#00C2FF',
    '#6E56CF',
    '#29A383',
    '#FFE66D',
    '#FF7A90',
    '#FFB86B',
  ];

  let canvas: HTMLCanvasElement;
  let animationFrame: number | undefined;
  let active = $state(false);
  let lastFire = $state(0);
  let particles: Particle[] = [];

  const prefersReducedMotion = (): boolean => {
    return (
      BROWSER && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  };

  const resetCanvas = (): void => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }

    const context = canvas?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    particles = [];
    active = false;
  };

  const createParticle = (width: number, height: number): Particle => {
    const angle = Math.random() * Math.PI - Math.PI;
    const speed = 6 + Math.random() * 9;

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      height: 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      timeToLive: 90 + Math.random() * 50,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 3,
      width: 6 + Math.random() * 8,
      x: width / 2 + (Math.random() - 0.5) * Math.min(width, 280),
      y: Math.min(height * 0.28, 220),
    };
  };

  const drawParticle = (
    context: CanvasRenderingContext2D,
    particle: Particle,
  ): void => {
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    context.fillRect(
      -particle.width / 2,
      -particle.height / 2,
      particle.width,
      particle.height,
    );
    context.restore();
  };

  const animate = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void => {
    context.clearRect(0, 0, width, height);

    particles = particles.filter((particle) => particle.timeToLive > 0);

    for (const particle of particles) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.28;
      particle.velocityX *= 0.99;
      particle.rotation += particle.rotationSpeed;
      particle.timeToLive -= 1;

      drawParticle(context, particle);
    }

    if (particles.length) {
      animationFrame = requestAnimationFrame(() =>
        animate(context, width, height),
      );
    } else {
      active = false;
      animationFrame = undefined;
    }
  };

  const celebrate = (): void => {
    if (!BROWSER || !canvas || prefersReducedMotion()) {
      return;
    }

    resetCanvas();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = Array.from({ length: 180 }, () =>
      createParticle(width, height),
    );
    active = true;
    animate(context, width, height);
  };

  $effect(() => {
    if (fire > lastFire) {
      lastFire = fire;
      celebrate();
    }
  });

  onDestroy(resetCanvas);
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class:hidden={!active}
  class="pointer-events-none fixed inset-0 z-[9999] h-screen w-screen"
  data-active={active}
  data-testid="workflow-completion-confetti"
></canvas>
