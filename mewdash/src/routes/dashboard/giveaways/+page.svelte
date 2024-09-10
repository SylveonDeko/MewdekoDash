<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api.ts';
    import { currentGuild } from "$lib/stores/currentGuild.ts";
    import { fade, slide } from 'svelte/transition';
    import type { Giveaways } from "$lib/types/models.ts";
    import { goto } from "$app/navigation";
    import Notification from "$lib/Notification.svelte";
    import MultiSelectDropdown from '$lib/MultiSelectDropdown.svelte';
    import DatePicker from "$lib/DatePicker.svelte";

    let giveaways: Giveaways[] = [];
    let expandedGiveaway: number | null = null;
    let loading = true;
    let error: string | null = null;
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';
    let guildRoles: Array<{ id: string, name: string }> = [];
    let selectedRoles: string[] = [];
    let entryMethod: 'reaction' | 'button' | 'captcha' = 'reaction';

    let newGiveaway: Partial<Giveaways> = {
        item: '',
        winners: 1,
        channelId: BigInt(0),
        when: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
        restrictTo: '',
        useButton: false,
        useCaptcha: false,
        messageCountReq: BigInt(0),
        serverId: BigInt(0),
        userId: BigInt(0),
        ended: 0,
        messageId: BigInt(0),
        emote: ''
    };

    onMount(async () => {
        if (!$currentGuild) await goto("/dashboard");
        await fetchGiveaways();
        await loadGuildRoles();
    });

    function validateGiveaway(): string | null {
        if (!newGiveaway.item || newGiveaway.item.trim() === '') {
            return "Please enter a valid giveaway item.";
        }
        if (!newGiveaway.winners || newGiveaway.winners < 1) {
            return "The number of winners must be at least 1.";
        }
        if (!newGiveaway.channelId || newGiveaway.channelId <= BigInt(0)) {
            return "Please enter a valid channel ID.";
        }
        if (!newGiveaway.when || newGiveaway.when <= new Date()) {
            return "The end time must be in the future.";
        }
        if (newGiveaway.messageCountReq < BigInt(0)) {
            return "The required message count cannot be negative.";
        }
        return null;
    }


    function handleEntryMethodChange(method: 'reaction' | 'button' | 'captcha') {
        entryMethod = method;
        newGiveaway.useButton = method === 'button';
        newGiveaway.useCaptcha = method === 'captcha';
    }


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
            const validationError = validateGiveaway();
            if (validationError) {
                showNotificationMessage(validationError, 'error');
                return;
            }
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
            item: '',
            winners: 1,
            channelId: BigInt(0),
            when: new Date(Date.now() + 24 * 60 * 60 * 1000),
            restrictTo: '',
            useButton: false,
            useCaptcha: false,
            messageCountReq: BigInt(0),
            serverId: BigInt(0),
            userId: BigInt(0),
            ended: 0
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
        selectedRoles = event.detail;
        newGiveaway.restrictTo = selectedRoles.join(' ');
    }

    function handleDateTimeChange(event: CustomEvent<Date>) {
        const selectedDate = event.detail;
        if (selectedDate <= new Date()) {
            showNotificationMessage('The end time must be in the future.', 'error');
        } else {
            newGiveaway.when = selectedDate;
        }
    }

    function handleWinnersChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = parseInt(input.value);
        if (value < 1) {
            input.value = '1';
            newGiveaway.winners = 1;
            showNotificationMessage('The number of winners must be at least 1.', 'error');
        } else {
            newGiveaway.winners = value;
        }
    }

    function handleMessageCountChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = BigInt(input.value);
        if (value < BigInt(0)) {
            input.value = '0';
            newGiveaway.messageCountReq = BigInt(0);
            showNotificationMessage('The required message count cannot be negative.', 'error');
        } else {
            newGiveaway.messageCountReq = value;
        }
    }

    function handleKeyDown(event: KeyboardEvent, giveawayId: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            toggleGiveawayExpand(giveawayId);
        }
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
        <div class="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-semibold mb-6">Create New Giveaway</h2>
            <form on:submit|preventDefault={createGiveaway} class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col">
                    <label for="giveaway-item" class="mb-2 font-medium text-gray-300">Giveaway Item</label>
                    <input id="giveaway-item" bind:value={newGiveaway.item} placeholder="Enter the item to be given away" class="p-2 rounded bg-gray-700 text-white" required />
                </div>
                <div class="flex flex-col">
                    <label for="winners-count" class="mb-2 font-medium text-gray-300">Number of Winners</label>
                    <input id="winners-count" bind:value={newGiveaway.winners} type="number" min="1" placeholder="Enter number of winners" class="p-2 rounded bg-gray-700 text-white" on:change={handleWinnersChange} required />
                </div>
                <div class="flex flex-col">
                    <label for="channel-id" class="mb-2 font-medium text-gray-300">Channel ID</label>
                    <input id="channel-id" bind:value={newGiveaway.channelId} placeholder="Enter the channel ID for the giveaway" class="p-2 rounded bg-gray-700 text-white" required />
                </div>
                <div class="flex flex-col">
                    <label for="end-time" class="mb-2 font-medium text-gray-300">End Time</label>
                    <DatePicker value={newGiveaway.when} on:change={handleDateTimeChange} />
                </div>
                <div class="flex flex-col">
                    <label for="required-roles" class="mb-2 font-medium text-gray-300">Required Roles</label>
                    <MultiSelectDropdown
                            options={guildRoles}
                            bind:selected={selectedRoles}
                            on:change={handleRoleSelection}
                            placeholder="Select required roles"
                    />
                </div>
                <div class="flex flex-col">
                    <label for="message-count" class="mb-2 font-medium text-gray-300">Required Message Count</label>
                    <input id="message-count" bind:value={newGiveaway.messageCountReq} type="number" min="0" placeholder="Enter required message count" class="p-2 rounded bg-gray-700 text-white" on:change={handleMessageCountChange} />
                </div>
                <div class="flex flex-col md:col-span-2 items-center">
                    <fieldset class="w-full max-w-md">
                        <legend class="mb-2 font-medium text-gray-300">Entry Method</legend>
                        <div class="flex rounded-md shadow-sm" role="group">
                            <button
                                    type="button"
                                    class="flex-1 px-4 py-2 text-sm font-medium rounded-l-md {entryMethod === 'reaction' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
                                    on:click={() => handleEntryMethodChange('reaction')}
                            >
                                Reaction
                            </button>
                            <button
                                    type="button"
                                    class="flex-1 px-4 py-2 text-sm font-medium {entryMethod === 'button' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
                                    on:click={() => handleEntryMethodChange('button')}
                            >
                                Button
                            </button>
                            <button
                                    type="button"
                                    class="flex-1 px-4 py-2 text-sm font-medium rounded-r-md {entryMethod === 'captcha' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
                                    on:click={() => handleEntryMethodChange('captcha')}
                            >
                                Captcha
                            </button>
                        </div>
                    </fieldset>
                </div>
                <div class="md:col-span-2">
                    <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                        Create Giveaway
                    </button>
                </div>
            </form>
        </div>

        <h2 class="text-xl font-semibold mb-4">Current Giveaways</h2>
        {#if giveaways.length === 0}
            <p transition:fade class="text-gray-400 italic">No giveaways found for this guild.</p>
        {:else}
            <ul class="space-y-4">
                {#each giveaways as giveaway (giveaway.id)}
                    <li class="bg-gray-800 rounded-lg p-4">
                        <div
                                role="button"
                                tabindex="0"
                                class="flex justify-between items-center cursor-pointer"
                                on:click={() => toggleGiveawayExpand(giveaway.id)}
                                on:keydown={(event) => handleKeyDown(event, giveaway.id)}
                        >
                            <div>
                                <p class="font-semibold">{giveaway.item}</p>
                                <p class="text-sm text-gray-400">Ends: {new Date(giveaway.when).toLocaleString()}</p>
                            </div>
                            <span class="text-blue-500">
                                {expandedGiveaway === giveaway.id ? 'Collapse' : 'Expand'}
                            </span>
                        </div>

                        {#if expandedGiveaway === giveaway.id}
                            <div transition:slide class="mt-4 space-y-2">
                                <p>Winners: {giveaway.winners}</p>
                                <p>Channel: {giveaway.channelId}</p>
                                {#if giveaway.restrictTo}
                                    <p>Required Roles: {giveaway.restrictTo}</p>
                                {/if}
                                <p>Message Count Requirement: {giveaway.messageCountReq}</p>
                                <p>Use Button: {giveaway.useButton ? 'Yes' : 'No'}</p>
                                <p>Use Captcha: {giveaway.useCaptcha ? 'Yes' : 'No'}</p>
                                {#if !giveaway.ended}
                                    <button on:click={() => endGiveaway(giveaway.id)} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                        End Giveaway
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    {/if}
</div>