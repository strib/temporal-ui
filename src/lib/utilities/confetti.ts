import type confetti from 'canvas-confetti';
import { BROWSER as browser } from 'esm-env';

let confettiPromise: Promise<typeof confetti> | null = null;

const loadConfetti = () => {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then(
      (m) => (m as unknown as { default: typeof confetti }).default,
    );
  }
  return confettiPromise;
};

export const blastConfetti = async (): Promise<void> => {
  if (!browser) return;

  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const confetti = await loadConfetti();

  const duration = 1500;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 70,
    zIndex: 9999,
    colors: ['#1d4ed8', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#facc15'],
  };

  confetti({
    ...defaults,
    particleCount: 120,
    spread: 90,
    origin: { x: 0.5, y: 0.6 },
  });

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.3, y: Math.random() * 0.4 + 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.7 + Math.random() * 0.3, y: Math.random() * 0.4 + 0.2 },
    });
  }, 250);
};
