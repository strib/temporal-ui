<script lang="ts">
  import { onDestroy, tick } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';
  import { shouldCelebrateWorkflowCompletion } from '$lib/utilities/workflow-completion-confetti';

  type Particle = {
    color: string;
    opacity: number;
    rotation: number;
    rotationVelocity: number;
    size: number;
    velocityX: number;
    velocityY: number;
    x: number;
    y: number;
  };

  type Props = {
    status?: WorkflowStatus;
  };

  const colors = ['#2bb3ff', '#00c78c', '#f8c23a', '#f56b6b', '#8b5cf6'];
  const duration = 3200;

  let { status = null }: Props = $props();
  let canvas: HTMLCanvasElement | undefined = $state();
  let visible = $state(false);
  let previousStatus: WorkflowStatus | undefined = undefined;
  let animationFrame: number | undefined;
  let context: CanvasRenderingContext2D | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let particles: Particle[] = [];
  let resizeHandler: (() => void) | undefined;
  let startTime = 0;

  const randomBetween = (minimum: number, maximum: number): number => {
    return Math.random() * (maximum - minimum) + minimum;
  };

  const createParticle = (width: number, height: number): Particle => ({
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 1,
    rotation: randomBetween(0, Math.PI),
    rotationVelocity: randomBetween(-0.22, 0.22),
    size: randomBetween(7, 14),
    velocityX: randomBetween(-4.5, 4.5),
    velocityY: randomBetween(4, 8.5),
    x: randomBetween(0, width),
    y: randomBetween(-height * 0.15, height * 0.12),
  });

  const resizeCanvas = () => {
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context = canvas.getContext('2d');
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const stopConfetti = () => {
    visible = false;
    particles = [];

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = undefined;
    }
  };

  const draw = (timestamp: number) => {
    if (!context || !canvas) return;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const particle of particles) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.06;
      particle.rotation += particle.rotationVelocity;
      particle.opacity = 1 - progress;

      context.save();
      context.globalAlpha = Math.max(particle.opacity, 0);
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(
        -particle.size / 2,
        -particle.size / 4,
        particle.size,
        particle.size / 2,
      );
      context.restore();
    }

    if (progress < 1) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      stopConfetti();
    }
  };

  const launchConfetti = async () => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    stopConfetti();
    visible = true;
    await tick();

    if (!canvas) return;

    resizeCanvas();
    resizeHandler = resizeCanvas;
    window.addEventListener('resize', resizeHandler);
    particles = Array.from({ length: 220 }, () =>
      createParticle(window.innerWidth, window.innerHeight),
    );
    startTime = performance.now();
    animationFrame = requestAnimationFrame(draw);
    hideTimer = setTimeout(stopConfetti, duration + 250);
  };

  $effect(() => {
    if (shouldCelebrateWorkflowCompletion(previousStatus, status)) {
      void launchConfetti();
    }

    previousStatus = status;
  });

  onDestroy(stopConfetti);
</script>

{#if visible}
  <canvas
    bind:this={canvas}
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-[9999]"
    data-testid="workflow-completion-confetti"
  ></canvas>
{/if}
