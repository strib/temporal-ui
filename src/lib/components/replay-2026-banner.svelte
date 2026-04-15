<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
</script>

<a
  href="https://replay.temporal.io"
  target="_blank"
  rel="noopener noreferrer"
  class="replay-banner"
  data-testid="replay-2026-banner"
  aria-label="Temporal Replay 2026 Conference"
>
  <span class="flex items-center gap-2">
    <Icon name="temporal-logo" width={18} height={18} />
    <span class="font-semibold">Temporal Replay 2026</span>
    <span class="hidden sm:inline">
      Join us for the premier workflow engineering conference.
    </span>
  </span>
  <span class="flex items-center gap-1 underline underline-offset-2">
    <span>Register now</span>
    <Icon name="external-link" width={14} height={14} />
  </span>
</a>

<style lang="postcss">
  .replay-banner {
    @apply sticky top-0 z-50 flex w-full flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-sm text-white;

    background-image: linear-gradient(90deg, #4338ca 0%, #7c3aed 50%, #db2777 100%);
  }

  .replay-banner:hover {
    @apply brightness-110;
  }
</style>
