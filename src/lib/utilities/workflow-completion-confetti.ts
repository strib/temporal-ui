import type { WorkflowStatus } from '$lib/types/workflows';

export function shouldCelebrateWorkflowCompletion(
  previous: WorkflowStatus | undefined,
  next: WorkflowStatus | null,
): boolean {
  if (previous === undefined) return false;
  if (previous === 'Completed') return false;
  return next === 'Completed';
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  color: string;
  w: number;
  h: number;
};

const COLORS = [
  '#f472b6',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#38bdf8',
  '#4ade80',
];

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export function blastWorkflowCompletionConfetti(durationMs = 2800): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const z = 2147483646;
  canvas.setAttribute(
    'style',
    `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z}`,
  );
  document.body.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h * 0.35;
  const count = Math.min(420, Math.floor((w * h) / 9000));
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(6, 22);
    particles.push({
      x: cx + randomBetween(-40, 40),
      y: cy + randomBetween(-30, 30),
      vx: Math.cos(angle) * speed + randomBetween(-4, 4),
      vy: Math.sin(angle) * speed - randomBetween(2, 10),
      rot: randomBetween(0, Math.PI * 2),
      vr: randomBetween(-0.35, 0.35),
      color: COLORS[(Math.random() * COLORS.length) | 0] ?? '#60a5fa',
      w: randomBetween(5, 11),
      h: randomBetween(7, 14),
    });
  }

  const gravity = 0.32;
  const drag = 0.988;
  const start = performance.now();

  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - t / durationMs);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (t < durationMs) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };

  requestAnimationFrame(tick);
}
