<script lang="ts">
  import confetti from 'canvas-confetti';
  import { BROWSER } from 'esm-env';
  import { onMount } from 'svelte';

  export let burst = 0;

  let canvas: HTMLCanvasElement;
  let fire: ReturnType<typeof confetti.create> | null = null;
  let lastBurst = 0;
  let timers: number[] = [];

  const colors = ['#34d399', '#60a5fa', '#f472b6', '#facc15', '#c084fc'];

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const launch = ({
    origin,
    particleCount,
    spread,
  }: {
    origin: { x: number; y: number };
    particleCount: number;
    spread: number;
  }) => {
    fire?.({
      colors,
      gravity: 0.95,
      origin,
      particleCount,
      scalar: 1.05,
      spread,
      startVelocity: 42,
      ticks: 260,
    });
  };

  const blast = () => {
    if (!fire) return;

    clearTimers();

    launch({
      origin: { x: 0.15, y: 0.2 },
      particleCount: 90,
      spread: 72,
    });
    launch({
      origin: { x: 0.85, y: 0.2 },
      particleCount: 90,
      spread: 72,
    });
    launch({
      origin: { x: 0.5, y: 0.14 },
      particleCount: 70,
      spread: 110,
    });

    timers = [
      window.setTimeout(() => {
        launch({
          origin: { x: 0.25, y: 0.28 },
          particleCount: 50,
          spread: 65,
        });
      }, 150),
      window.setTimeout(() => {
        launch({
          origin: { x: 0.75, y: 0.28 },
          particleCount: 50,
          spread: 65,
        });
      }, 150),
      window.setTimeout(() => {
        launch({
          origin: { x: 0.5, y: 0.2 },
          particleCount: 40,
          spread: 120,
        });
      }, 260),
    ];
  };

  onMount(() => {
    if (!BROWSER) return;

    fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    return () => {
      clearTimers();
      fire?.reset();
      fire = null;
    };
  });

  $: if (fire && burst > lastBurst) {
    lastBurst = burst;
    blast();
  }

  $: if (burst < lastBurst) {
    lastBurst = burst;
  }
</script>

<canvas
  bind:this={canvas}
  class="pointer-events-none fixed inset-0 z-50 h-full w-full"
  aria-hidden="true"
></canvas>
