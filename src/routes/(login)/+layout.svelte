<script lang="ts">
  import type { Snippet } from 'svelte';

  import Replay2026Banner from '$lib/components/replay-2026-banner.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<Replay2026Banner />
{@render children()}
