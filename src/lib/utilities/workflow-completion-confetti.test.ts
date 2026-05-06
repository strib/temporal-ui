import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const confettiFn = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: confettiFn,
}));

import { blastWorkflowCompletionConfetti } from './workflow-completion-confetti';

describe('blastWorkflowCompletionConfetti', () => {
  beforeEach(() => {
    confettiFn.mockReset();
    vi.stubGlobal('requestAnimationFrame', (_cb: FrameRequestCallback) => {
      return 0 as unknown as number;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('invokes canvas-confetti in the browser', async () => {
    await blastWorkflowCompletionConfetti();
    expect(confettiFn).toHaveBeenCalled();
  });
});
