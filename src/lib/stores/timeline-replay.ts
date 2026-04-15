import { get, writable } from 'svelte/store';

const DEFAULT_REPLAY_DURATION_MS = 8000;

export const replayActive = writable(false);
export const replayProgress = writable(0);
export const replayDurationMs = writable(DEFAULT_REPLAY_DURATION_MS);

let rafId: number | null = null;
let startedAt: number | null = null;

const tick = () => {
  if (startedAt === null) return;
  const duration = get(replayDurationMs);
  const elapsed = performance.now() - startedAt;
  const progress = Math.min(elapsed / duration, 1);
  replayProgress.set(progress);
  if (progress >= 1) {
    rafId = null;
    startedAt = null;
    replayActive.set(false);
    return;
  }
  rafId = requestAnimationFrame(tick);
};

export const startReplay = (durationMs?: number) => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (typeof durationMs === 'number' && durationMs > 0) {
    replayDurationMs.set(durationMs);
  }
  startedAt = performance.now();
  replayProgress.set(0);
  replayActive.set(true);
  rafId = requestAnimationFrame(tick);
};

export const stopReplay = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  startedAt = null;
  replayActive.set(false);
  replayProgress.set(0);
};

export const toggleReplay = (durationMs?: number) => {
  if (get(replayActive)) {
    stopReplay();
  } else {
    startReplay(durationMs);
  }
};
