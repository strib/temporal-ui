import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  blastWorkflowCompletionConfetti,
  shouldCelebrateWorkflowCompletion,
} from './workflow-completion-confetti';

describe('blastWorkflowCompletionConfetti', () => {
  const rafQueue: FrameRequestCallback[] = [];
  let perfTime = 0;

  beforeEach(() => {
    perfTime = 10_000;
    vi.stubGlobal('performance', {
      now: () => perfTime,
    });
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rafQueue.length = 0;
  });

  it('appends a full-viewport canvas and removes it after the burst', () => {
    const ctx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(HTMLCanvasElement.prototype, 'remove');

    blastWorkflowCompletionConfetti(200);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    const canvas = appendSpy.mock.calls[0]?.[0];
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);

    let guard = 0;
    while (rafQueue.length > 0 && guard++ < 500) {
      perfTime += 40;
      const cb = rafQueue.shift();
      if (cb) cb(perfTime);
    }

    expect(removeSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe('shouldCelebrateWorkflowCompletion', () => {
  it('returns false when previous is undefined (initial load)', () => {
    expect(shouldCelebrateWorkflowCompletion(undefined, 'Completed')).toBe(
      false,
    );
  });

  it('returns false when already completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Completed', 'Completed')).toBe(
      false,
    );
  });

  it('returns true when transitioning from Running to Completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Completed')).toBe(
      true,
    );
  });

  it('returns false when transitioning to non-completed', () => {
    expect(shouldCelebrateWorkflowCompletion('Running', 'Failed')).toBe(false);
  });
});
