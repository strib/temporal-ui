import { BROWSER } from 'esm-env';

const COLORS = [
  '#26ccff',
  '#a25afd',
  '#ff5e7e',
  '#88ff5a',
  '#fcff42',
  '#ffa62d',
  '#ff36ff',
];

export type BlastConfettiOptions = {
  durationMs?: number;
  particleCount?: number;
  startVelocity?: number;
};

export const blastConfetti = async ({
  durationMs = 2500,
  particleCount = 60,
  startVelocity = 55,
}: BlastConfettiOptions = {}): Promise<void> => {
  if (!BROWSER) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const reduceMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  )?.matches;
  if (reduceMotion) return;

  const { default: confetti } = await import('canvas-confetti');

  const end = Date.now() + durationMs;

  const burst = () => {
    confetti({
      particleCount,
      spread: 70,
      startVelocity,
      origin: { x: 0, y: 0.7 },
      angle: 60,
      colors: COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount,
      spread: 70,
      startVelocity,
      origin: { x: 1, y: 0.7 },
      angle: 120,
      colors: COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: Math.round(particleCount / 2),
      spread: 100,
      startVelocity: startVelocity - 10,
      origin: { x: 0.5, y: 0.4 },
      angle: 90,
      colors: COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  };

  burst();
  return new Promise<void>((resolve) => {
    const interval = window.setInterval(() => {
      if (Date.now() >= end) {
        window.clearInterval(interval);
        resolve();
        return;
      }
      burst();
    }, 350);
  });
};
