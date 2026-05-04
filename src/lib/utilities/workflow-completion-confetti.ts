import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldCelebrateWorkflowCompletion(
  previous: WorkflowStatus | null | undefined,
  current: WorkflowStatus | null | undefined,
): boolean {
  if (!current || current !== 'Completed') {
    return false;
  }
  if (!previous) {
    return false;
  }
  return previous !== 'Completed';
}

export async function fireWorkflowCompletionConfetti(): Promise<void> {
  const { default: confetti } = await import('canvas-confetti');
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      zIndex: 10000,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      zIndex: 10000,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 10000,
  });
}
