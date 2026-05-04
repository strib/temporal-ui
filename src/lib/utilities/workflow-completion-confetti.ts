import type { WorkflowStatus } from '$lib/types/workflows';

type Particle = {
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  velocityX: number;
  velocityY: number;
  x: number;
  y: number;
};

type ConfettiOptions = {
  duration?: number;
  particleCount?: number;
};

type Blast = {
  finished: Promise<void>;
  stop: () => void;
};

type ConfettiWindow = typeof window & {
  __TEMPORAL_WORKFLOW_COMPLETION_CONFETTI_DURATION__?: number;
};

const noBlast = (): Blast => ({
  finished: Promise.resolve(),
  stop: () => undefined,
});

const colors = [
  '#22c55e',
  '#3b82f6',
  '#f97316',
  '#eab308',
  '#ec4899',
  '#8b5cf6',
];

const createParticle = (width: number, height: number): Particle => {
  const fromLeft = Math.random() > 0.5;

  return {
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 18 - 9,
    size: Math.random() * 8 + 5,
    velocityX: (fromLeft ? 1 : -1) * (Math.random() * 8 + 5),
    velocityY: Math.random() * -10 - 5,
    x: fromLeft ? -20 : width + 20,
    y: Math.random() * height * 0.65 + height * 0.1,
  };
};

export const shouldBlastWorkflowCompletionConfetti = (
  previousStatus: WorkflowStatus | undefined,
  currentStatus: WorkflowStatus | undefined,
) => {
  return (
    previousStatus !== undefined &&
    previousStatus !== 'Completed' &&
    currentStatus === 'Completed'
  );
};

export const blastWorkflowCompletionConfetti = ({
  duration,
  particleCount = 220,
}: ConfettiOptions = {}): Blast => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return noBlast();
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    return noBlast();
  }

  const blastDuration =
    duration ??
    (window as ConfettiWindow)
      .__TEMPORAL_WORKFLOW_COMPLETION_CONFETTI_DURATION__ ??
    3000;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return noBlast();
  }

  canvas.dataset.testid = 'workflow-completion-confetti';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.position = 'fixed';
  canvas.style.zIndex = '2147483647';
  document.body.append(canvas);

  let animationFrame = 0;
  let isRunning = true;
  const start = performance.now();
  const particles: Particle[] = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  for (let i = 0; i < particleCount; i += 1) {
    particles.push(createParticle(canvas.width, canvas.height));
  }

  let resolveFinished: () => void;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  const stop = () => {
    if (!isRunning) return;
    isRunning = false;
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resize);
    canvas.remove();
    resolveFinished();
  };

  const animate = (time: number) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / blastDuration, 1);

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of particles) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.35;
      particle.velocityX *= 0.99;
      particle.rotation += particle.rotationSpeed;

      context.save();
      context.globalAlpha = 1 - progress;
      context.translate(particle.x, particle.y);
      context.rotate((particle.rotation * Math.PI) / 180);
      context.fillStyle = particle.color;
      context.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size * 0.55,
      );
      context.restore();
    }

    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      stop();
    }
  };

  window.addEventListener('resize', resize);
  animationFrame = window.requestAnimationFrame(animate);

  return { finished, stop };
};
