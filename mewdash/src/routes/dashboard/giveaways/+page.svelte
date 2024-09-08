<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api.ts';
    import { currentGuild } from "$lib/stores/currentGuild.ts";
    import { fade, slide } from 'svelte/transition';
    import type { Giveaways } from "$lib/types/models.ts";
    import { goto } from "$app/navigation";
    import Notification from "$lib/Notification.svelte";
    import MultiSelectDropdown from '$lib/MultiSelectDropdown.svelte';

    let giveaways: Giveaways[] = [];
    let expandedGiveaway: number | null = null;
    let loading = true;
    let error: string | null = null;
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';
    let guildRoles: Array<{ id: string, name: string }> = [];

    let newGiveaway: Partial<Giveaways> = {
        Item: '',
        Winners: 1,
        ChannelId: BigInt(0),
        When: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
        RestrictTo: '',
        UseButton: false,
        UseCaptcha: false,
        MessageCountReq: BigInt(0),
        ServerId: BigInt(0),
        UserId: BigInt(0),
        Ended: 0,
        MessageId: BigInt(0),
        Emote: ''
    };

    onMount(async () => {
        if (!$currentGuild) await goto("/dashboard");
        await fetchGiveaways();
        await loadGuildRoles();
    });

    async function fetchGiveaways() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) throw new Error("No guild selected");
            giveaways = await api.getGiveaways($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch giveaways:', err);
            error = err.message || "Failed to fetch giveaways";
        } finally {
            loading = false;
        }
    }

    async function loadGuildRoles() {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");
            guildRoles = await api.getGuildRoles($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch guild roles:', err);
        }
    }

    async function createGiveaway() {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");
            newGiveaway.ServerId = BigInt($currentGuild.id);
            await api.createGiveaway($currentGuild.id, newGiveaway);
            showNotificationMessage('Giveaway created successfully', 'success');
            await fetchGiveaways();
            resetNewGiveaway();
        } catch (error) {
            showNotificationMessage('Failed to create giveaway: ' + error.message, 'error');
        }
    }

    async function endGiveaway(giveawayId: number) {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");
            await api.endGiveaway($currentGuild.id, giveawayId);
            showNotificationMessage('Giveaway ended successfully', 'success');
            await fetchGiveaways();
        } catch (error) {
            showNotificationMessage('Failed to end giveaway: ' + error.message, 'error');
        }
    }

    function toggleGiveawayExpand(id: number) {
        expandedGiveaway = expandedGiveaway === id ? null : id;
    }

    function resetNewGiveaway() {
        newGiveaway = {
            Item: '',
            Winners: 1,
            ChannelId: BigInt(0),
            When: new Date(Date.now() + 24 * 60 * 60 * 1000),
            RestrictTo: '',
            UseButton: false,
            UseCaptcha: false,
            MessageCountReq: BigInt(0),
            ServerId: BigInt(0),
            UserId: BigInt(0),
            Ended: 0
        };
    }

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    function handleRoleSelection(event: CustomEvent<string[]>) {
        newGiveaway.RestrictTo = event.detail.join(' ');
    }
</script>

<svelte:head>
    <title>Giveaways - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Giveaways</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType} />
    {/if}
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else}
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Create New Giveaway</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input bind:value={newGiveaway.Item} placeholder="Giveaway Item" class="p-2 rounded bg-gray-700" />
                <input bind:value={newGiveaway.Winners} type="number" placeholder="Number of Winners" class="p-2 rounded bg-gray-700" />
                <input bind:value={newGiveaway.ChannelId} placeholder="Channel ID" class="p-2 rounded bg-gray-700" />
                <input type="datetime-local" bind:value={newGiveaway.When} class="p-2 rounded bg-gray-700" />
                <MultiSelectDropdown options={guildRoles} on:change={handleRoleSelection} placeholder="Required Roles" />
                <input bind:value={newGiveaway.MessageCountReq} type="number" placeholder="Required Message Count" class="p-2 rounded bg-gray-700" />
                <label class="flex items-center">
                    <input type="checkbox" bind:checked={newGiveaway.UseButton} class="mr-2" />
                    Use Button
                </label>
                <label class="flex items-center">
                    <input type="checkbox" bind:checked={newGiveaway.UseCaptcha} class="mr-2" />
                    Use Captcha
                </label>
            </div>
            <button on:click={createGiveaway} class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create Giveaway
            </button>
        </div>

        <h2 class="text-xl font-semibold mb-4">Current Giveaways</h2>
        {#if giveaways.length === 0}
            <p transition:fade class="text-gray-400 italic">No giveaways found.</p>
        {:else}
            <ul class="space-y-4">
                {#each giveaways as giveaway (giveaway.Id)}
                    <li class="bg-gray-800 rounded-lg p-4">
                        <div class="flex justify-between items-center cursor-pointer" on:click={() => toggleGiveawayExpand(giveaway.Id)}>
                            <div>
                                <p class="font-semibold">{giveaway.Item}</p>
                                <p class="text-sm text-gray-400">Ends: {new Date(giveaway.When).toLocaleString()}</p>
                            </div>
                            <button class="text-blue-500">
                                {expandedGiveaway === giveaway.Id ? 'Collapse' : 'Expand'}
                            </button>
                        </div>

                        {#if expandedGiveaway === giveaway.Id}
                            <div transition:slide class="mt-4 space-y-2">
                                <p>Winners: {giveaway.Winners}</p>
                                <p>Channel: {giveaway.ChannelId}</p>
                                {#if giveaway.RestrictTo}
                                    <p>Required Roles: {giveaway.RestrictTo}</p>
                                {/if}
                                <p>Message Count Requirement: {giveaway.MessageCountReq}</p>
                                <p>Use Button: {giveaway.UseButton ? 'Yes' : 'No'}</p>
                                <p>Use Captcha: {giveaway.UseCaptcha ? 'Yes' : 'No'}</p>
                                <button on:click={() => endGiveaway(giveaway.Id)} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    End Giveaway
                                </button>
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    {/if}
</div>