import { BROWSER } from 'esm-env';

const CELEBRATED_RUNS_KEY = 'temporal-ui:celebrated-runs';
const MAX_REMEMBERED_RUNS = 100;

const getCelebratedRuns = (): string[] => {
  if (!BROWSER) return [];
  try {
    const raw = sessionStorage.getItem(CELEBRATED_RUNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
};

const rememberCelebratedRun = (key: string) => {
  if (!BROWSER) return;
  try {
    const runs = getCelebratedRuns();
    if (runs.includes(key)) return;
    runs.push(key);
    const trimmed = runs.slice(-MAX_REMEMBERED_RUNS);
    sessionStorage.setItem(CELEBRATED_RUNS_KEY, JSON.stringify(trimmed));
  } catch {
    // best-effort persistence
  }
};

export const hasCelebratedRun = (key: string): boolean => {
  if (!BROWSER) return false;
  return getCelebratedRuns().includes(key);
};

export const blastConfetti = async (): Promise<void> => {
  if (!BROWSER) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const { default: confetti } = await import('canvas-confetti');

  const duration = 1500;
  const end = Date.now() + duration;
  const colors = [
    '#a78bfa',
    '#22d3ee',
    '#34d399',
    '#fbbf24',
    '#f472b6',
    '#60a5fa',
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
    if (Date.now() > end) return;
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      startVelocity: 60,
      origin: { x: 0, y: 0.85 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      startVelocity: 60,
      origin: { x: 1, y: 0.85 },
      colors,
      zIndex: 9999,
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

export const celebrateWorkflowCompletion = async (
  runKey: string,
): Promise<boolean> => {
  if (!BROWSER) return false;
  if (!runKey) return false;
  if (hasCelebratedRun(runKey)) return false;
  rememberCelebratedRun(runKey);
  await blastConfetti();
  return true;
};
