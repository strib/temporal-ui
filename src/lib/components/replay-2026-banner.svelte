<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  const replayUrl = 'https://replay.temporal.io/';
</script>

<section
  class="border-b border-indigo-500 bg-indigo-600 text-white"
  data-testid="replay-2026-banner"
>
  <div
    class="flex w-full flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8"
  >
    <p class="text-sm font-medium md:text-base">
      {translate('common.replay-2026-banner-message')}
    </p>
    <Button
      href={replayUrl}
      target="_blank"
      size="sm"
      variant="secondary"
      class="border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:bg-white/20"
      data-testid="replay-2026-banner-cta"
      rel="noreferrer"
    >
      {translate('common.replay-2026-banner-cta')}
    </Button>
  </div>
</section>
