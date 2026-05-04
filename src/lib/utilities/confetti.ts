import { BROWSER as browser } from 'esm-env';

const COLORS = [
  '#26a69a',
  '#7c4dff',
  '#ff5252',
  '#ffd740',
  '#40c4ff',
  '#69f0ae',
];

export async function blastConfetti(): Promise<void> {
  if (!browser) return;
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (prefersReducedMotion) return;

  const { default: confetti } = await import('canvas-confetti');

  const duration = 1500;
  const end = Date.now() + duration;

  const fire = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(fire);
    }
  };

  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors: COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
  });

  fire();
}
