import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const confettiSpy = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: (...args: unknown[]) => confettiSpy(...args),
}));

describe('blastConfetti', () => {
  beforeEach(() => {
    confettiSpy.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires multiple bursts of confetti when motion is allowed', async () => {
    vi.stubGlobal(
      'matchMedia',
      () => ({ matches: false }) as unknown as MediaQueryList,
    );

    const { blastConfetti } = await import('./confetti');
    const promise = blastConfetti({ durationMs: 500 });

    await vi.advanceTimersByTimeAsync(0);
    expect(confettiSpy.mock.calls.length).toBeGreaterThanOrEqual(3);

    await vi.advanceTimersByTimeAsync(700);
    await promise;

    expect(confettiSpy.mock.calls.length).toBeGreaterThanOrEqual(6);
    const firstCall = confettiSpy.mock.calls[0][0];
    expect(firstCall).toMatchObject({
      origin: { x: 0, y: 0.7 },
      angle: 60,
      zIndex: 9999,
    });

    vi.unstubAllGlobals();
  });

  it('does nothing when prefers-reduced-motion is set', async () => {
    vi.stubGlobal(
      'matchMedia',
      () => ({ matches: true }) as unknown as MediaQueryList,
    );

    const { blastConfetti } = await import('./confetti');
    await blastConfetti({ durationMs: 100 });

    expect(confettiSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
