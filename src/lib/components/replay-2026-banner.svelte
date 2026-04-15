<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  const replayUrl = 'https://replay.temporal.io/';
</script>

<section
  class="border-b border-indigo-500 bg-indigo-600 text-white"
  data-testid="replay-2026-banner"
>
  <div
    class="mx-auto flex w-full max-w-screen-2xl flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8"
  >
    <p class="text-sm font-medium md:text-base">
      {translate('common.replay-2026-banner-message')}
    </p>
    <a
      href={replayUrl}
      target="_blank"
      rel="noreferrer noopener"
      class="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-semibold text-indigo-900 no-underline shadow-sm transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      data-testid="replay-2026-banner-cta"
    >
      <span>{translate('common.replay-2026-banner-cta')}</span>
      <span aria-hidden="true">-></span>
    </a>
  </div>
</section>
