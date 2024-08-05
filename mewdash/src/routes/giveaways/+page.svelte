<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { api } from '$lib/api';
    import type { PageData } from "../../../.svelte-kit/types/src/routes/dashboard/suggestions/$types";
    import { goto } from "$app/navigation";
    import { browser } from '$app/environment';
    import type { Giveaways } from "$lib/types.ts";
    import {Turnstile} from 'svelte-turnstile';

    let guildId: bigint;
    let giveawayId: number;
    let userId: bigint;
    let turnstileToken: string;
    let message: string = '';
    export let data: PageData;

    let giveaway: Giveaways | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        if (!data.user) {
            goto("/api/discord/login");
            return;
        }
        guildId = BigInt($page.url.searchParams.get('guildId') || '0');
        giveawayId = Number($page.url.searchParams.get('giveawayId') || '0');
        userId = data.user.id;

        if (browser) {
            // Fetch giveaway details
            try {
                giveaway = await api.getGiveaway(giveawayId.toString());
                loading = false;
            } catch (err) {
                error = 'Failed to load giveaway details';
                loading = false;
            }
        }
    });

    async function enterGiveaway() {
        if (!turnstileToken) {
            message = 'Please complete the captcha';
            return;
        }

        try {
            await api.enterGiveaway({
                guildId,
                giveawayId,
                userId,
                turnstileToken
            });
            message = 'Successfully entered the giveaway!';
        } catch (error) {
            message = 'Failed to enter giveaway: ' + error.message;
        }
    }

    function onTurnstileSuccess(event: CustomEvent<{ token: string; }>) {
        turnstileToken = event.detail.token;
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleString();
    }
</script>

<svelte:head>
    <title>Enter Giveaway - Mewdeko</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Enter Giveaway</h1>

    {#if loading}
        <p class="text-gray-500">Loading giveaway details...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if giveaway}
        <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-semibold text-white mb-4">{giveaway.item}</h2>
            <div class="grid grid-cols-2 gap-4 text-gray-300">
                <div>
                    <p class="font-bold">Winners:</p>
                    <p>{giveaway.winners}</p>
                </div>
                <div>
                    <p class="font-bold">Ends:</p>
                    <p>{formatDate(giveaway.when)}</p>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <Turnstile
                    siteKey="0x4AAAAAAAAvvAPaJgbIJWh-"
                    on:callback={onTurnstileSuccess}
            />
        </div>

        <button
                on:click={enterGiveaway}
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Enter Giveaway
        </button>

        {#if message}
            <p class="mt-4 {message.includes('Successfully') ? 'text-green-500' : 'text-red-500'}">
                {message}
            </p>
        {/if}
    {:else}
        <p class="text-gray-500">No giveaway found</p>
    {/if}
</div>