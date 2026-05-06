import confetti from 'canvas-confetti';

import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldTriggerWorkflowCompletionCelebration = (
  previous: WorkflowStatus | undefined,
  current: WorkflowStatus | null | undefined,
): boolean =>
  previous !== undefined &&
  previous !== 'Completed' &&
  current === 'Completed';

export const blastWorkflowCompletionConfetti = (): void => {
  if (typeof window === 'undefined') return;

  const count = 220;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 10000,
    disableForReducedMotion: true,
  };

  const fire = (particleRatio: number, opts: Parameters<typeof confetti>[0]) => {
    void confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.22, { spread: 28, startVelocity: 60 });
  fire(0.18, { spread: 68, startVelocity: 45 });
  fire(0.32, { spread: 110, decay: 0.89, scalar: 0.85 });
  fire(0.09, { spread: 130, startVelocity: 32, decay: 0.91, scalar: 1.15 });
  fire(0.09, { spread: 130, startVelocity: 48 });
  fire(0.1, {
    spread: 85,
    startVelocity: 42,
    origin: { x: 0.08, y: 0.62 },
  });
  fire(0.1, {
    spread: 85,
    startVelocity: 42,
    origin: { x: 0.92, y: 0.62 },
  });
  fire(0.1, {
    spread: 95,
    startVelocity: 38,
    origin: { x: 0.5, y: 0.55 },
  });

  window.setTimeout(() => {
    fire(0.08, {
      spread: 70,
      startVelocity: 48,
      origin: { x: 0.25, y: 0.68 },
    });
    fire(0.08, {
      spread: 70,
      startVelocity: 48,
      origin: { x: 0.75, y: 0.68 },
    });
  }, 250);
};
