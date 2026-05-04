import confetti from 'canvas-confetti';

const isBrowser = (): boolean => typeof window !== 'undefined';

const prefersReducedMotion = (): boolean => {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

export type BlastConfettiOptions = {
  /**
   * Total duration of the blast in milliseconds.
   */
  duration?: number;
  /**
   * Override reduced-motion detection (mostly for tests).
   */
  force?: boolean;
};

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#a855f7',
  '#14b8a6',
];

/**
 * Fires a celebratory confetti burst across the entire page.
 * No-op in SSR or when the user prefers reduced motion (unless `force` is set).
 */
export const blastConfettiAcrossPage = (
  options: BlastConfettiOptions = {},
): void => {
  if (!isBrowser()) return;
  if (!options.force && prefersReducedMotion()) return;

  const duration = options.duration ?? 2500;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 70,
    zIndex: 9999,
    colors: COLORS,
  } as const;

  const randomInRange = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { x: 0, y: 0.7 },
    angle: 60,
    colors: COLORS,
    zIndex: 9999,
  });
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { x: 1, y: 0.7 },
    angle: 120,
    colors: COLORS,
    zIndex: 9999,
  });

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }

    const particleCount = 60 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};
