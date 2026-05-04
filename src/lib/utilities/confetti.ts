import confetti from 'canvas-confetti';

import type { WorkflowStatus } from '$lib/types/workflows';

const firedRunIds = new Set<string>();

export const hasCelebratedRun = (runId: string): boolean =>
  firedRunIds.has(runId);

export const markRunCelebrated = (runId: string): void => {
  firedRunIds.add(runId);
};

export const resetCelebratedRuns = (): void => {
  firedRunIds.clear();
};

export const blastConfetti = (): void => {
  if (typeof window === 'undefined') return;

  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ['#bb0000', '#ffffff', '#2563eb', '#16a34a', '#f59e0b'];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { x: 0.5, y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  frame();
};

export const shouldCelebrateTransition = (
  previousStatus: WorkflowStatus | undefined,
  nextStatus: WorkflowStatus | undefined,
): boolean => {
  if (nextStatus !== 'Completed') return false;
  if (!previousStatus) return false;
  if (previousStatus === 'Completed') return false;
  return previousStatus === 'Running' || previousStatus === 'Paused';
};

export const celebrateWorkflowCompletion = (
  runId: string | undefined,
  previousStatus: WorkflowStatus | undefined,
  nextStatus: WorkflowStatus | undefined,
): boolean => {
  if (!runId) return false;
  if (hasCelebratedRun(runId)) return false;
  if (!shouldCelebrateTransition(previousStatus, nextStatus)) return false;
  markRunCelebrated(runId);
  blastConfetti();
  return true;
};
