import { BROWSER } from 'esm-env';

export function shouldCelebrateWorkflowCompletion(
  previousStatus: string | undefined,
  nextStatus: string | undefined,
  isRunning: boolean,
): boolean {
  return Boolean(
    previousStatus &&
    previousStatus !== 'Completed' &&
    nextStatus === 'Completed' &&
    !isRunning,
  );
}

export async function fireWorkflowCompletedConfetti(): Promise<void> {
  if (!BROWSER) return;
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const confetti = (await import('canvas-confetti')).default;

  const burst = (opts: Parameters<typeof confetti>[0]) => {
    void confetti({
      disableForReducedMotion: true,
      ticks: 220,
      gravity: 1.05,
      decay: 0.92,
      ...opts,
    });
  };

  burst({
    particleCount: 120,
    spread: 70,
    origin: { x: 0.15, y: 0.35 },
    angle: 60,
    startVelocity: 48,
  });
  burst({
    particleCount: 120,
    spread: 70,
    origin: { x: 0.85, y: 0.35 },
    angle: 120,
    startVelocity: 48,
  });
  burst({
    particleCount: 160,
    spread: 100,
    origin: { x: 0.5, y: 0.2 },
    startVelocity: 42,
    scalar: 1.05,
  });

  window.setTimeout(() => {
    burst({
      particleCount: 90,
      spread: 55,
      origin: { x: 0.35, y: 0.55 },
      angle: 90,
      startVelocity: 35,
    });
    burst({
      particleCount: 90,
      spread: 55,
      origin: { x: 0.65, y: 0.55 },
      angle: 90,
      startVelocity: 35,
    });
  }, 180);
}
