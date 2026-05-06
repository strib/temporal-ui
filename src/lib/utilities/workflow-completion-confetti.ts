const COLORS = [
  '#26ccff',
  '#a25afd',
  '#ff5e7e',
  '#88ff5a',
  '#fcff42',
  '#ffa62d',
  '#ff36ef',
];

export async function blastWorkflowCompletionConfetti(): Promise<void> {
  if (typeof window === 'undefined') return;
  const confetti = (await import('canvas-confetti')).default;

  const end = Date.now() + 2800;
  const frame = (): void => {
    void confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.35 },
      colors: COLORS,
      zIndex: 99999,
      ticks: 220,
    });
    void confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.35 },
      colors: COLORS,
      zIndex: 99999,
      ticks: 220,
    });
    void confetti({
      particleCount: 3,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0 },
      colors: COLORS,
      zIndex: 99999,
      ticks: 220,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  requestAnimationFrame(frame);

  void confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    colors: COLORS,
    zIndex: 99999,
    ticks: 320,
  });
}
