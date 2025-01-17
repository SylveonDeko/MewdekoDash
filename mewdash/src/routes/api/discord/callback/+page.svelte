<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto, invalidateAll } from "$app/navigation";

    export let data;

    onMount(async () => {
        if (data.success) {
            await invalidateAll()
            await goto(data.returnTo)
        }
    });

    $: error = $page.url.searchParams.get('error');
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-900">
    <div class="text-center">
        {#if error}
            <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-semibold mb-2">Authentication Failed</h2>
                <p class="text-gray-400">Please try logging in again</p>
                <a href="/api/discord/login" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Retry Login
                </a>
            </div>
        {:else}
            <div class="mb-4">
                <div class="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto" />
            </div>
            <h2 class="text-xl font-semibold text-white mb-2">Logging you in...</h2>
            <p class="text-gray-400">You'll be redirected in a moment</p>
        {/if}
    </div>
</div>