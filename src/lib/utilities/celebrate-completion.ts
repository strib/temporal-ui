import confetti from 'canvas-confetti';

const DEFAULT_COLORS = [
  '#22d3ee',
  '#a78bfa',
  '#f472b6',
  '#facc15',
  '#34d399',
  '#fb923c',
];

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const celebrateWorkflowCompletion = (): void => {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion()) return;

  const duration = 1500;
  const end = Date.now() + duration;

  const fire = (
    particleRatio: number,
    opts: confetti.Options,
  ): Promise<null> | null =>
    confetti({
      origin: { y: 0.7 },
      colors: DEFAULT_COLORS,
      zIndex: 2147483647,
      disableForReducedMotion: true,
      ...opts,
      particleCount: Math.floor(200 * particleRatio),
    });

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });

  const burst = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: DEFAULT_COLORS,
      zIndex: 2147483647,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: DEFAULT_COLORS,
      zIndex: 2147483647,
      disableForReducedMotion: true,
    });
    requestAnimationFrame(burst);
  };

  burst();
};
