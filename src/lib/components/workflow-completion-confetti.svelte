<script lang="ts">
  import { onDestroy } from 'svelte';

  type Confetti = {
    x: number;
    y: number;
    angle: number;
    size: number;
    tilt: number;
    velocityX: number;
    velocityY: number;
    spin: number;
    color: string;
  };

  export let blast = 0;

  const colors = [
    '#5e5ce6',
    '#00a3ff',
    '#00c47c',
    '#ffd60a',
    '#ff8a00',
    '#ff375f',
    '#bf5af2',
  ];
  const confettiCount = 220;
  const duration = 2800;
  const gravity = 0.22;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let pieces: Confetti[] = [];
  let animationFrame: number;
  let startedAt = 0;
  let lastBlast = 0;

  const createPiece = (width: number, height: number): Confetti => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const originX = side < 0 ? -24 : width + 24;
    const originY = height * (0.1 + Math.random() * 0.35);

    return {
      x: originX,
      y: originY,
      angle: Math.random() * Math.PI * 2,
      size: 6 + Math.random() * 8,
      tilt: Math.random() * Math.PI,
      velocityX: side * -(5 + Math.random() * 12),
      velocityY: -8 + Math.random() * 12,
      spin: -0.24 + Math.random() * 0.48,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  };

  const resizeCanvas = () => {
    if (!canvas) return;

    context = context ?? canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const drawPiece = (piece: Confetti) => {
    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.angle);
    context.fillStyle = piece.color;
    context.fillRect(
      -piece.size / 2,
      -piece.size / 4,
      piece.size,
      piece.size / 2,
    );
    context.restore();
  };

  const animate = (timestamp: number) => {
    const elapsed = timestamp - startedAt;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const piece of pieces) {
      piece.x += piece.velocityX;
      piece.y += piece.velocityY;
      piece.velocityY += gravity;
      piece.angle += piece.spin;
      piece.velocityX *= 0.99;
      piece.velocityY *= 0.992;
      drawPiece(piece);
    }

    pieces = pieces.filter(
      ({ x, y, size }) =>
        x > -size &&
        x < window.innerWidth + size &&
        y < window.innerHeight + size,
    );

    if (elapsed < duration && pieces.length) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      pieces = [];
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  const launch = () => {
    if (!canvas) return;

    context = context ?? canvas.getContext('2d');
    if (!context) return;

    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    startedAt = performance.now();
    pieces = Array.from({ length: confettiCount }, () =>
      createPiece(window.innerWidth, window.innerHeight),
    );
    animationFrame = requestAnimationFrame(animate);
  };

  $: if (blast > 0 && blast !== lastBlast) {
    lastBlast = blast;
    launch();
  }

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<svelte:window on:resize={resizeCanvas} />

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-[10000]"
  data-testid="workflow-completion-confetti"
></canvas>
