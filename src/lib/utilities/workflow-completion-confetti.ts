import { BROWSER } from 'esm-env';

import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldFireWorkflowCompletionConfetti(
  previous: WorkflowStatus | null | undefined,
  next: WorkflowStatus | null | undefined,
): boolean {
  if (next !== 'Completed') return false;
  if (previous === undefined || previous === null) return false;
  if (previous === 'Completed') return false;
  return true;
}

export async function blastWorkflowCompletionConfetti(): Promise<void> {
  if (!BROWSER) return;
  const { default: confetti } = await import('canvas-confetti');
  const durationMs = 1800;
  const end = Date.now() + durationMs;
  const colors = ['#2596be', '#141a41', '#fcbf24', '#34d399', '#a78bfa'];

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 3,
      spread: 120,
      origin: { x: 0.5, y: 0.35 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
