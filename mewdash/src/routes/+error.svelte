<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Error {$page.status} - Mewdeko</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-white mb-4">Error {$page.status}</h1>
    <p class="text-xl text-gray-400 mb-8">{$page.error?.message || 'Something went wrong'}</p>

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
        class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Return Home
      </a>
    {/if}
  </div>
</div>