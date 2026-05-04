import type confetti from 'canvas-confetti';

import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldCelebrateWorkflowCompletion(
  previousStatus: WorkflowStatus | undefined,
  nextStatus: WorkflowStatus | null | undefined,
): boolean {
  if (previousStatus === undefined) return false;
  if (nextStatus !== 'Completed') return false;
  if (previousStatus === 'Completed') return false;
  return true;
}

export function blastWorkflowCompletionConfetti(confettiFn: typeof confetti): void {
  const end = Date.now() + 2800;
  const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

  const frame = () => {
    confettiFn({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confettiFn({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  confettiFn({
    particleCount: 140,
    spread: 100,
    origin: { y: 0.55 },
    colors,
  });

  confettiFn({
    particleCount: 100,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.55 },
    colors,
  });

  confettiFn({
    particleCount: 100,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.55 },
    colors,
  });
}
