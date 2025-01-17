<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import type { BotInstance } from '$lib/types/models';
    import { currentInstance } from '$lib/stores/instanceStore';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';

    let instances: BotInstance[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            const response = await api.getBotInstances();
            instances = response;

            if (instances.length === 1) {
                currentInstance.set(instances[0]);
                await goto('/dashboard');
            }
        } catch (err) {
            error = 'Failed to load bot instances';
            logger.error(err);
        } finally {
            loading = false;
        }
    });

    async function handleInstanceSelect(instance: BotInstance) {
    currentInstance.set(instance);
    // Save to localStorage
    localStorage.setItem('selectedInstance', JSON.stringify(instance));
    await goto('/dashboard');
}
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">Select Bot Instance</h1>
        <p class="text-gray-400">Choose which bot instance to manage</p>
    </div>

    {#if loading}
        <div class="flex justify-center">
            <div class="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
    {:else if error}
        <div class="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4">
            {error}
        </div>
    {:else if instances.length === 0}
        <div class="text-center py-12">
            <p class="text-xl text-gray-400">No bot instances found</p>
        </div>
    {:else}
        <div class="grid gap-4" in:fade>
            {#each instances as instance (instance.botId)}
                <button
                    on:click={() => handleInstanceSelect(instance)}
                    class="flex items-center p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    <img
                        src={instance.botAvatar}
                        alt=""
                        class="w-16 h-16 rounded-full mr-6"
                    />
                    <div class="text-left">
                        <h2 class="text-xl font-semibold">{instance.botName}</h2>
                        <p class="text-gray-400">Port: {instance.port}</p>
                    </div>
                    {#if !instance.isActive}
                        <span class="ml-auto px-3 py-1 rounded-full bg-red-500 bg-opacity-10 text-red-500 text-sm">
                            Offline
                        </span>
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
</div>