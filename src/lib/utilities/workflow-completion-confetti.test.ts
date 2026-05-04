import {
  blastWorkflowCompletionConfetti,
  shouldBlastWorkflowCompletionConfetti,
} from './workflow-completion-confetti';

describe('workflow completion confetti', () => {
  it('blasts only when a loaded workflow transitions to Completed', () => {
    expect(shouldBlastWorkflowCompletionConfetti(undefined, 'Completed')).toBe(
      false,
    );
    expect(shouldBlastWorkflowCompletionConfetti('Running', 'Running')).toBe(
      false,
    );
    expect(
      shouldBlastWorkflowCompletionConfetti('Completed', 'Completed'),
    ).toBe(false);
    expect(shouldBlastWorkflowCompletionConfetti('Failed', 'Completed')).toBe(
      true,
    );
    expect(shouldBlastWorkflowCompletionConfetti('Running', 'Completed')).toBe(
      true,
    );
  });

  it('adds and removes a full-page confetti canvas', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
      () => undefined,
    );
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const { stop } = blastWorkflowCompletionConfetti();
    const canvas = document.querySelector(
      '[data-testid="workflow-completion-confetti"]',
    );

    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect((canvas as HTMLCanvasElement).style.pointerEvents).toBe('none');
    expect((canvas as HTMLCanvasElement).style.position).toBe('fixed');
    expect((canvas as HTMLCanvasElement).style.zIndex).toBe('2147483647');

    stop();

    expect(
      document.querySelector('[data-testid="workflow-completion-confetti"]'),
    ).toBeNull();
  });
});
