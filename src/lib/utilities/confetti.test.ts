import { beforeEach, describe, expect, it, vi } from 'vitest';

const confettiSpy = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: confettiSpy,
}));

import {
  _resetCompletionConfettiCacheForTests,
  blastCompletionConfetti,
} from './confetti';

const flush = () => new Promise((resolve) => setTimeout(resolve, 25));

describe('blastCompletionConfetti', () => {
  beforeEach(() => {
    confettiSpy.mockClear();
    _resetCompletionConfettiCacheForTests();
    vi.stubGlobal('requestAnimationFrame', () => 0);
  });

  it('fires confetti when status is Completed', async () => {
    blastCompletionConfetti('run-1', 'Completed');
    await flush();
    expect(confettiSpy).toHaveBeenCalledTimes(1);
  });

  it('does not fire confetti for non-completed statuses', async () => {
    blastCompletionConfetti('run-2', 'Running');
    blastCompletionConfetti('run-2', 'Failed');
    blastCompletionConfetti('run-2', 'Canceled');
    blastCompletionConfetti('run-2', 'Terminated');
    blastCompletionConfetti('run-2', 'TimedOut');
    await flush();
    expect(confettiSpy).not.toHaveBeenCalled();
  });

  it('only fires once per workflow run id', async () => {
    blastCompletionConfetti('run-3', 'Completed');
    blastCompletionConfetti('run-3', 'Completed');
    blastCompletionConfetti('run-3', 'Completed');
    await flush();
    expect(confettiSpy).toHaveBeenCalledTimes(1);
  });

  it('fires for distinct workflow keys', async () => {
    blastCompletionConfetti('run-a', 'Completed');
    await flush();
    blastCompletionConfetti('run-b', 'Completed');
    await flush();
    expect(confettiSpy).toHaveBeenCalledTimes(2);
  });

  it('ignores empty keys', async () => {
    blastCompletionConfetti('', 'Completed');
    blastCompletionConfetti(null, 'Completed');
    blastCompletionConfetti(undefined, 'Completed');
    await flush();
    expect(confettiSpy).not.toHaveBeenCalled();
  });
});
