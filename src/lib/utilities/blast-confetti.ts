import { BROWSER } from 'esm-env';

type ConfettiModule = typeof import('canvas-confetti');
type ConfettiFn = ConfettiModule extends { default: infer F }
  ? F
  : ConfettiModule;

let confettiPromise: Promise<ConfettiFn> | null = null;

const loadConfetti = (): Promise<ConfettiFn> => {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then(
      (m) =>
        ((m as unknown as { default?: ConfettiFn }).default ??
          (m as unknown as ConfettiFn)) as ConfettiFn,
    );
  }
  return confettiPromise;
};

export const blastConfetti = async (): Promise<void> => {
  if (!BROWSER) return;

  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const confetti = await loadConfetti();

  const duration = 2000;
  const end = Date.now() + duration;
  const colors = [
    '#22c55e',
    '#3b82f6',
    '#a855f7',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
  ];

  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.6 },
    colors,
    zIndex: 9999,
  });

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      startVelocity: 60,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      startVelocity: 60,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
};

const completedRunIds = new Set<string>();

export const blastConfettiOnce = (runId: string | undefined | null): void => {
  if (!runId) return;
  if (completedRunIds.has(runId)) return;
  completedRunIds.add(runId);
  void blastConfetti();
};

export const resetConfettiCache = (): void => {
  completedRunIds.clear();
};
