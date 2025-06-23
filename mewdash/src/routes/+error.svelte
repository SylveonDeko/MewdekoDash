<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";

  export let data: PageData;

  let showDetails = false;

  // Log error details for debugging
  $: if (browser && $page.error) {
    console.error("Page error:", $page.error);
  }
</script>

<svelte:head>
  <title>Error {$page.status} - Mewdeko</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
  <div class="text-center max-w-md mx-auto">
    <div class="mb-6">
      <div class="text-6xl mb-4">⚠️</div>
      <h1 class="text-4xl font-bold text-white mb-2">Error {$page.status}</h1>
      <p class="text-xl text-gray-400 mb-4">{$page.error?.message || 'Something went wrong'}</p>
    </div>

    <div class="space-y-4">
      {#if $page.status === 401}
        <a
          href="/api/discord/login"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Login with Discord
        </a>
      {:else}
        <a
          href="/"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
        >
          Return Home
        </a>
        <button
          on:click={() => window.location.reload()}
          class="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Retry
        </button>
      {/if}
    </div>

    {#if browser && $page.error}
      <div class="mt-8">
        <button
          on:click={() => showDetails = !showDetails}
          class="text-gray-400 hover:text-white text-sm transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Error Details
        </button>

        {#if showDetails}
          <div class="mt-4 p-4 bg-gray-800 rounded-lg text-left">
            <pre class="text-xs text-gray-300 whitespace-pre-wrap break-words">
              {JSON.stringify($page.error, null, 2)}
            </pre>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>