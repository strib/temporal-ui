import { browser } from 'esm-env';

import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldCelebrateWorkflowCompletion(
  previous: WorkflowStatus | null | undefined,
  current: WorkflowStatus | null | undefined,
): boolean {
  return (
    current === 'Completed' && previous != null && previous !== 'Completed'
  );
}

export async function blastWorkflowCompletionConfetti(): Promise<void> {
  if (!browser) return;

  const confetti = (await import('canvas-confetti')).default;
  const duration = 2500;
  const end = Date.now() + duration;

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.45 },
    zIndex: 10000,
  });

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.55 },
      zIndex: 10000,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.55 },
      zIndex: 10000,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
