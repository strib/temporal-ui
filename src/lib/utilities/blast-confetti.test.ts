import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const confettiMock = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: confettiMock,
}));

vi.mock('esm-env', () => ({
  BROWSER: true,
}));

import {
  blastConfetti,
  blastConfettiOnce,
  resetConfettiCache,
} from './blast-confetti';

describe('blast-confetti', () => {
  beforeEach(() => {
    confettiMock.mockReset();
    resetConfettiCache();
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({ matches: false }) as unknown as typeof matchMedia,
    );
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 0) as unknown as typeof requestAnimationFrame,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('blasts confetti at least once', async () => {
    await blastConfetti();
    expect(confettiMock).toHaveBeenCalled();
    const firstCall = confettiMock.mock.calls[0][0];
    expect(firstCall.particleCount).toBeGreaterThan(0);
    expect(firstCall.zIndex).toBe(9999);
  });

  it('respects prefers-reduced-motion', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({ matches: true }) as unknown as typeof matchMedia,
    );
    await blastConfetti();
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('only blasts once per runId', async () => {
    blastConfettiOnce('run-1');
    blastConfettiOnce('run-1');
    blastConfettiOnce('run-1');
    await Promise.resolve();
    await Promise.resolve();
    expect(confettiMock.mock.calls.length).toBeGreaterThan(0);
    const initialCalls = confettiMock.mock.calls.length;

    blastConfettiOnce('run-1');
    await Promise.resolve();
    await Promise.resolve();
    expect(confettiMock.mock.calls.length).toBe(initialCalls);
  });

  it('blasts again for a different runId', async () => {
    blastConfettiOnce('run-1');
    await Promise.resolve();
    await Promise.resolve();
    const callsAfterFirst = confettiMock.mock.calls.length;

    blastConfettiOnce('run-2');
    await Promise.resolve();
    await Promise.resolve();
    expect(confettiMock.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });

  it('does nothing when runId is missing', async () => {
    blastConfettiOnce(undefined);
    blastConfettiOnce(null);
    blastConfettiOnce('');
    await Promise.resolve();
    await Promise.resolve();
    expect(confettiMock).not.toHaveBeenCalled();
  });
});
