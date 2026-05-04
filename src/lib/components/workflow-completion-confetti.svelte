<script lang="ts">
  import { BROWSER } from 'esm-env';
  import { onDestroy, tick } from 'svelte';

  import type { WorkflowExecution } from '$lib/types/workflows';
  import { shouldCelebrateWorkflowCompletion } from '$lib/utilities/workflow-completion-confetti';

  export let workflow: WorkflowExecution | null | undefined;

  type ConfettiPiece = {
    color: string;
    rotation: number;
    rotationSpeed: number;
    size: number;
    speedX: number;
    speedY: number;
    x: number;
    y: number;
  };

  const colors = [
    '#00A1E0',
    '#14B8A6',
    '#22C55E',
    '#A855F7',
    '#EC4899',
    '#F97316',
    '#FACC15',
  ];

  let canvas: HTMLCanvasElement | undefined;
  let context: CanvasRenderingContext2D | null = null;
  let pieces: ConfettiPiece[] = [];
  let frame: number | null = null;
  let previousRunId: string | undefined;
  let previousStatus = workflow?.status;
  let active = false;

  const createPiece = (sourceX: number, sourceY: number): ConfettiPiece => {
    const angle = Math.random() * Math.PI - Math.PI;
    const velocity = 8 + Math.random() * 9;

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 24,
      size: 7 + Math.random() * 7,
      speedX: Math.cos(angle) * velocity,
      speedY: Math.sin(angle) * velocity - 5,
      x: sourceX,
      y: sourceY,
    };
  };

  const resizeCanvas = () => {
    if (!canvas) return;

    const { innerWidth, innerHeight, devicePixelRatio } = window;
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    context = canvas.getContext('2d');
    context?.scale(devicePixelRatio, devicePixelRatio);
  };

  const drawPiece = (piece: ConfettiPiece) => {
    if (!context) return;

    context.save();
    context.translate(piece.x, piece.y);
    context.rotate((piece.rotation * Math.PI) / 180);
    context.fillStyle = piece.color;
    context.fillRect(
      -piece.size / 2,
      -piece.size / 3,
      piece.size,
      piece.size / 1.5,
    );
    context.restore();
  };

  const animate = () => {
    if (!canvas || !context) return;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces = pieces
      .map((piece) => ({
        ...piece,
        rotation: piece.rotation + piece.rotationSpeed,
        speedX: piece.speedX * 0.985,
        speedY: piece.speedY + 0.38,
        x: piece.x + piece.speedX,
        y: piece.y + piece.speedY,
      }))
      .filter((piece) => piece.y < window.innerHeight + 40);

    pieces.forEach(drawPiece);

    if (pieces.length) {
      frame = window.requestAnimationFrame(animate);
      return;
    }

    active = false;
    frame = null;
  };

  const motionIsReduced = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const blastConfetti = async () => {
    if (!BROWSER) return;
    if (motionIsReduced()) return;

    active = true;
    await tick();

    requestAnimationFrame(() => {
      resizeCanvas();

      const leftSourceX = window.innerWidth * 0.18;
      const rightSourceX = window.innerWidth * 0.82;
      const sourceY = window.innerHeight + 10;

      pieces = Array.from({ length: 180 }, (_, index) =>
        createPiece(index % 2 === 0 ? leftSourceX : rightSourceX, sourceY),
      );

      if (frame) window.cancelAnimationFrame(frame);
      animate();
    });
  };

  const syncWorkflowStatus = (
    currentWorkflow: WorkflowExecution | null | undefined,
  ) => {
    const currentRunId = currentWorkflow?.runId;
    const sameWorkflow = Boolean(
      currentRunId && previousRunId && currentRunId === previousRunId,
    );

    if (
      shouldCelebrateWorkflowCompletion(
        previousStatus,
        currentWorkflow?.status,
        sameWorkflow,
      )
    ) {
      blastConfetti();
    }

    previousRunId = currentRunId;
    previousStatus = currentWorkflow?.status;
  };

  $: syncWorkflowStatus(workflow);

  onDestroy(() => {
    if (frame) window.cancelAnimationFrame(frame);
  });
</script>

{#if active}
  <canvas
    bind:this={canvas}
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-50"
    data-testid="workflow-completion-confetti"
  />
{/if}
