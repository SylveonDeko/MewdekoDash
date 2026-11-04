<script lang="ts">
  import { m } from "$lib/i18n";
  import { page } from "$app/state";
  import { logger } from "$lib/logger";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import { fly } from "svelte/transition";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let showDetails = $state(false);

  // Log error details for debugging
  $effect(() => {
    if (browser && page.error) {
      logger.error("Page error:", page.error);
    }
  });

  // Get error icon based on status
  function getErrorIcon(status: number) {
    if (status === 401) return "fa-lock";
    if (status === 403) return "fa-ban";
    if (status === 404) return "fa-magnifying-glass";
    if (status >= 500) return "fa-server";
    return "fa-triangle-exclamation";
  }

  let errorIcon = $derived(getErrorIcon(page.status));
</script>

<svelte:head>
  <title>{m.home.errorTitle({ status: page.status })}</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center px-4 py-12">
  <div class="text-center max-w-2xl mx-auto" in:fly={{ y: 20, duration: 500 }}>
    <div class="mb-8">
      <div class="inline-block p-8 rounded-2xl mb-6"
           style="background: {$colorStore.primary}0c;
                  border: 1px solid {$colorStore.primary}30;">
        <i class="fa-utility-duo fa-regular {errorIcon}"
           style="--fa-primary-color: {$colorStore.primary};
                  --fa-secondary-color: {$colorStore.secondary};
                  font-size: 72px;"></i>
      </div>

      <h1 class="text-5xl sm:text-6xl font-extrabold mb-4" style="color: {$colorStore.text}">
        {m.home.errorHeading({ status: page.status })}
      </h1>
      <p class="text-xl sm:text-2xl mb-2" style="color: {$colorStore.muted}">
        {page.error?.message || m.common.somethingWentWrong()}
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8 px-4">
      {#if page.status === 401}
        <a
          href="/api/discord/login?redirect_to={encodeURIComponent(page.url.pathname)}"
          class="px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 hover:brightness-125"
          style="background: {$colorStore.primary}0c;
                 border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-brands fa-discord text-xl" style="color: {$colorStore.text}"></i>
          <span style="color: {$colorStore.text}">{m.common.loginWithDiscord()}</span>
        </a>
      {:else}
        <a
          href="/"
          class="px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 hover:brightness-125"
          style="background: {$colorStore.primary}0c;
                 border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-utility-duo fa-regular fa-house text-xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          <span style="color: {$colorStore.text}">{m.home.errorReturnHome()}</span>
        </a>

        <button
          onclick={() => window.location.reload()}
          class="px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 hover:brightness-125"
          style="background: {$colorStore.secondary}08;
                 border: 1px solid {$colorStore.secondary}20;"
        >
          <i class="fa-solid fa-rotate-right" style="color: {$colorStore.text}"></i>
          <span style="color: {$colorStore.text}">{m.common.retry()}</span>
        </button>
      {/if}
    </div>

    {#if browser && page.error}
      <div class="mt-8">
        <button
          onclick={() => showDetails = !showDetails}
          class="px-4 py-2 rounded-lg text-sm transition-colors hover:brightness-125"
          style="background: {$colorStore.primary}08;
                 color: {$colorStore.muted};
                 border: 1px solid {$colorStore.primary}20;"
        >
          <i class="fa-solid fa-{showDetails ? 'chevron-up' : 'chevron-down'} mr-2"></i>
          {showDetails ? m.common.hideErrorDetails() : m.common.showErrorDetails()}
        </button>

        {#if showDetails}
          <div class="mt-4 p-6 rounded-xl text-left"
               style="background: {$colorStore.primary}08;
                      border: 1px solid {$colorStore.primary}20;"
               in:fly={{ y: -10, duration: 300 }}>
            <pre class="text-xs whitespace-pre-wrap break-words overflow-x-auto"
                 style="color: {$colorStore.muted};">{JSON.stringify(page.error, null, 2)}</pre>
          </div>
        {/if}
      </div>
    {/if}

    <p class="mt-12 text-sm" style="color: {$colorStore.muted}">
      {@html m.home.errorNeedHelp({ color: $colorStore.primary })}
    </p>
  </div>
</main>
