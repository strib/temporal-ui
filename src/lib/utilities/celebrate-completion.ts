import confetti from 'canvas-confetti';

const prefersReducedMotion = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const celebrateWorkflowCompletion = (): void => {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion()) return;

  const duration = 1800;
  const end = Date.now() + duration;
  const colors = [
    '#16a34a',
    '#22c55e',
    '#86efac',
    '#3b82f6',
    '#a855f7',
    '#f59e0b',
  ];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors,
    zIndex: 9999,
    disableForReducedMotion: true,
  });

  requestAnimationFrame(frame);
};
