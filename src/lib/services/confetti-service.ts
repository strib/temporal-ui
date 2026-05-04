import confetti from 'canvas-confetti';

const colors = ['#00A3FF', '#14F195', '#FDE047', '#FF5C8A', '#7C3AED'];

const bursts = [
  { origin: { x: 0, y: 0.7 }, angle: 60 },
  { origin: { x: 1, y: 0.7 }, angle: 120 },
  { origin: { x: 0.5, y: 0.2 }, angle: 90 },
];

export const blastWorkflowCompletionConfetti = (): void => {
  bursts.forEach(({ origin, angle }) => {
    confetti({
      angle,
      colors,
      disableForReducedMotion: true,
      gravity: 0.9,
      origin,
      particleCount: 90,
      scalar: 1.1,
      spread: 70,
      startVelocity: 55,
      ticks: 240,
      zIndex: 2147483647,
    });
  });
};
