import confetti from 'canvas-confetti';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { blastConfettiAcrossPage } from './confetti';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const confettiMock = vi.mocked(confetti);

describe('blastConfettiAcrossPage', () => {
  beforeEach(() => {
    confettiMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('immediately fires two side bursts on invocation', () => {
    blastConfettiAcrossPage({ duration: 1, force: true });
    expect(confettiMock).toHaveBeenCalledTimes(2);
    const origins = confettiMock.mock.calls.map(([opts]) => opts?.origin);
    expect(origins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: 0 }),
        expect.objectContaining({ x: 1 }),
      ]),
    );
  });

  it('continues firing periodic bursts until duration elapses', () => {
    blastConfettiAcrossPage({ duration: 600, force: true });
    expect(confettiMock).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(260);
    expect(confettiMock.mock.calls.length).toBeGreaterThan(2);

    const callsAfterFirstTick = confettiMock.mock.calls.length;
    vi.advanceTimersByTime(260);
    expect(confettiMock.mock.calls.length).toBeGreaterThan(callsAfterFirstTick);

    vi.advanceTimersByTime(2000);
    const callsAtEnd = confettiMock.mock.calls.length;
    vi.advanceTimersByTime(1000);
    expect(confettiMock.mock.calls.length).toBe(callsAtEnd);
  });

  it('respects prefers-reduced-motion when force is not set', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    try {
      blastConfettiAcrossPage();
      expect(confettiMock).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
