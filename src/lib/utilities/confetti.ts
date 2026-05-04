import { BROWSER } from 'esm-env';

import type { WorkflowStatus } from '$lib/types/workflows';

const COMPLETION_FIRED = new Set<string>();

const launchConfetti = async () => {
  if (!BROWSER) return;
  const { default: confetti } = await import('canvas-confetti');

  const duration = 1200;
  const end = Date.now() + duration;
  const colors = [
    '#22c55e',
    '#3b82f6',
    '#a855f7',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
  ];

  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.6 },
    colors,
    zIndex: 9999,
  });

  const tick = () => {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 70,
      startVelocity: 60,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 70,
      startVelocity: 60,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

export const blastCompletionConfetti = (
  key: string | null | undefined,
  status: WorkflowStatus | null | undefined,
): void => {
  if (!BROWSER) return;
  if (status !== 'Completed') return;
  if (!key) return;
  if (COMPLETION_FIRED.has(key)) return;
  COMPLETION_FIRED.add(key);
  void launchConfetti();
};

export const _resetCompletionConfettiCacheForTests = (): void => {
  COMPLETION_FIRED.clear();
};
