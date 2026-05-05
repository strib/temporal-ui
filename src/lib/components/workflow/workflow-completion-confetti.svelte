<script lang="ts">
  import { BROWSER as browser } from 'esm-env';

  import { page } from '$app/stores';

  import { workflowRun } from '$lib/stores/workflow-run';

  const STORAGE_KEY = 'workflow-confetti-celebrated';

  const hasBeenCelebrated = (key: string): boolean => {
    if (!browser) return false;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const set = new Set<string>(JSON.parse(raw));
      return set.has(key);
    } catch {
      return false;
    }
  };

  const markCelebrated = (key: string): void => {
    if (!browser) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      set.add(key);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  };

  const fireConfetti = async () => {
    if (!browser) return;
    const { default: confetti } = await import('canvas-confetti');

    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ['#bb86fc', '#03dac5', '#ff6b6b', '#ffd166', '#06d6a0'];

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      zIndex: 9999,
    });

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 75,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 75,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  let firedFor: string | null = null;

  $: {
    const workflow = $workflowRun.workflow;
    const namespace = $page.params.namespace;
    const workflowId = $page.params.workflow;
    const runId = $page.params.run;
    const key =
      namespace && workflowId && runId
        ? `${namespace}/${workflowId}/${runId}`
        : null;

    if (
      browser &&
      key &&
      workflow?.status === 'Completed' &&
      firedFor !== key &&
      !hasBeenCelebrated(key)
    ) {
      firedFor = key;
      markCelebrated(key);
      fireConfetti();
    }
  }
</script>
