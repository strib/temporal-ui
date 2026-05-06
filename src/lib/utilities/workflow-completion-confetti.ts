import confetti from 'canvas-confetti';

import type { WorkflowStatus } from '$lib/types/workflows';

export const shouldCelebrateWorkflowCompletion = (
  previousStatus: WorkflowStatus | null | undefined,
  nextStatus: WorkflowStatus | null | undefined,
): boolean =>
  nextStatus === 'Completed' &&
  previousStatus !== null &&
  previousStatus !== undefined &&
  previousStatus !== 'Completed';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fireWorkflowCompletionConfetti = (): void => {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return;
  }

  const duration = 2500;
  const end = Date.now() + duration;

  const frame = () => {
    void confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.35 },
      zIndex: 10000,
    });
    void confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.35 },
      zIndex: 10000,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  void confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.55 },
    zIndex: 10000,
  });
  requestAnimationFrame(frame);
};
