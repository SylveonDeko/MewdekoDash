<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import type { PageData } from "./$types";
    import { currentGuild } from "$lib/stores/currentGuild.ts"
    import { fade, slide } from 'svelte/transition';
    import type { Afk } from "$lib/types/models.ts";
    import { goto } from "$app/navigation";
    import Notification from "$lib/Notification.svelte";


    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';

    let afkUsers: Afk[] = [];
    let expandedUser = null;
    let loading = true;
    let error = null;

    // AFK Settings
    let afkDeletionTime = 0;
    let afkMaxLength = 0;
    let afkType = 1;
    let afkTimeout = 0;
    let afkDisabledChannels: string[] = [];
    let customAfkMessage = '';
    let changedSettings = new Set();

    function markAsChanged(setting: string) {
        changedSettings.add(setting);
    }

    async function updateAllAfkSettings() {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");

            const updatePromises = [];

            if (changedSettings.has('deletion')) {
                updatePromises.push(api.afkDelSet($currentGuild.id, afkDeletionTime));
            }
            if (changedSettings.has('maxLength')) {
                updatePromises.push(api.afkLengthSet($currentGuild.id, afkMaxLength));
            }
            if (changedSettings.has('type')) {
                updatePromises.push(api.afkTypeSet($currentGuild.id, afkType));
            }
            if (changedSettings.has('timeout')) {
                updatePromises.push(api.afkTimeoutSet($currentGuild.id, afkTimeout));
            }
            if (changedSettings.has('customMessage')) {
                updatePromises.push(api.setCustomAfkMessage($currentGuild.id, customAfkMessage));
            }

            await Promise.all(updatePromises);

            showNotificationMessage('AFK settings updated successfully', 'success');
            changedSettings.clear();
        } catch (err) {
            console.error('Failed to update AFK settings:', err);
            showNotificationMessage('Failed to update AFK settings', 'error');
        }
    }

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await Promise.all([fetchAfkUsers(), fetchAfkSettings()]);
    });

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    async function fetchAfkSettings() {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");

            const [deletion, maxLength, type, timeout, disabledChannels, customMessage] = await Promise.all([
                api.getAfkDel($currentGuild.id),
                api.getAfkLength($currentGuild.id),
                api.getAfkType($currentGuild.id),
                api.getAfkTimeout($currentGuild.id),
                api.getDisabledAfkChannels($currentGuild.id),
                api.getCustomAfkMessage($currentGuild.id)
            ]);

            afkDeletionTime = deletion;
            afkMaxLength = maxLength;
            afkType = type;
            afkTimeout = timeout;
            afkDisabledChannels = disabledChannels ? disabledChannels.split(',') : [];
            customAfkMessage = customMessage || '';

        } catch (err) {
            console.error('Failed to fetch AFK settings:', err);
            showNotificationMessage('Failed to fetch AFK settings', 'error');
        }
    }

    async function updateAfkSetting(setting: string, value: any) {
        try {
            if (!$currentGuild?.id) throw new Error("No guild selected");

            switch (setting) {
                case 'deletion':
                    await api.afkDelSet($currentGuild.id, value);
                    break;
                case 'maxLength':
                    await api.afkLengthSet($currentGuild.id, value);
                    break;
                case 'type':
                    await api.afkTypeSet($currentGuild.id, value);
                    break;
                case 'timeout':
                    await api.afkTimeoutSet($currentGuild.id, value);
                    break;
                case 'customMessage':
                    await api.setCustomAfkMessage($currentGuild.id, value);
                    break;
            }
            showNotificationMessage('AFK setting updated successfully', 'success');
        } catch (err) {
            console.error('Failed to update AFK setting:', err);
            showNotificationMessage('Failed to update AFK setting', 'error');
        }
    }

    async function fetchAfkUsers() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            const response = await api.getAllAfkStatus($currentGuild.id);
            afkUsers = response.filter(user => user.afkStatus !== null && user.afkStatus.message !== '' && user.afkStatus.message);
        } catch (err) {
            console.error('Failed to fetch AFK users:', err);
            error = err.message || "Failed to fetch AFK users";
        } finally {
            loading = false;
        }
    }

    async function clearAfkStatus(userId) {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            await api.deleteAfkStatus($currentGuild.id, userId);
            showNotificationMessage('AFK Cleared', 'success');
            await fetchAfkUsers();
        } catch (error) {
            showNotificationMessage('Failed to clear AFK status: ' + error.message, 'error');
        }
    }

    function toggleUserExpand(userId) {
        expandedUser = expandedUser === userId ? null : userId;
    }

    function handleUserKeydown(event: KeyboardEvent, userId: string) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleUserExpand(userId);
        }
    }

</script>

<svelte:head>
    <title>AFK Management - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">AFK Management</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType}/>
    {/if}

    <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">AFK Settings</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-800 p-4 rounded-lg">
                <label for="afk-deletion-time" class="font-semibold mb-2 block">Auto-deletion Time</label>
                <input type="number" id="afk-deletion-time" bind:value={afkDeletionTime}
                       on:input={() => markAsChanged('deletion')}
                       class="w-full p-2 bg-gray-700 rounded"/>
                <p class="text-sm text-gray-400 mt-1">Time in seconds before AFK messages are deleted. Set to 0 to disable.</p>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg">
                <label for="afk-max-length" class="font-semibold mb-2 block">Max AFK Message Length</label>
                <input type="number" id="afk-max-length" bind:value={afkMaxLength}
                       on:input={() => markAsChanged('maxLength')}
                       class="w-full p-2 bg-gray-700 rounded"/>
                <p class="text-sm text-gray-400 mt-1">Maximum allowed length for AFK messages.</p>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg">
                <label for="afk-type" class="font-semibold mb-2 block">AFK Type</label>
                <select id="afk-type" bind:value={afkType}
                        on:change={() => markAsChanged('type')}
                        class="w-full p-2 bg-gray-700 rounded">
                    <option value={1}>Self Disable</option>
                    <option value={2}>On Message</option>
                    <option value={3}>On Type</option>
                    <option value={4}>Either</option>
                </select>
                <p class="text-sm text-gray-400 mt-1">Determines how AFK status is removed.</p>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg">
                <label for="afk-timeout" class="font-semibold mb-2 block">AFK Timeout</label>
                <input type="number" id="afk-timeout" bind:value={afkTimeout}
                       on:input={() => markAsChanged('timeout')}
                       class="w-full p-2 bg-gray-700 rounded"/>
                <p class="text-sm text-gray-400 mt-1">Time before someone is actually considered afk after setting their afk. Format is 1h2m3s</p>
            </div>
        </div>

        <div class="mt-4 bg-gray-800 p-4 rounded-lg">
            <label for="custom-afk-message" class="font-semibold mb-2 block">Custom AFK Message</label>
            <textarea id="custom-afk-message" bind:value={customAfkMessage}
                      on:input={() => markAsChanged('customMessage')}
                      class="w-full p-2 bg-gray-700 rounded h-24"></textarea>
            <p class="text-sm text-gray-400 mt-1">Custom embed to display when a user is afk. Use "-" to reset to default.</p>
        </div>

        <div class="mt-4 flex justify-end">
            <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    on:click={updateAllAfkSettings}
                    disabled={changedSettings.size === 0}
                    aria-disabled={changedSettings.size === 0}>
                Save Changes
            </button>
        </div>
    </div>

    <h2 class="text-xl font-semibold mb-3">Currently AFK Users</h2>

    {#if loading}
        <p role="status">Loading...</p>
    {:else if error}
        <p class="text-red-500" role="alert">{error}</p>
    {:else if afkUsers.length === 0}
        <p transition:fade class="text-gray-400 italic">No users are currently AFK.</p>
    {:else}
        <ul class="space-y-2" aria-label="List of AFK users">
            {#each afkUsers as user (user.userId)}
                <li class="bg-gray-800 rounded-lg overflow-hidden">
                    <button
                            class="w-full text-left p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                            on:keydown={(event) => handleUserKeydown(event, user.userId)}
                            on:click={() => toggleUserExpand(user.userId)}
                            aria-expanded={expandedUser === user.userId}
                            aria-controls={`user-details-${user.userId}`}
                    >
                        <div class="flex items-center">
                            <img
                                    src={user.avatarUrl}
                                    alt=""
                                    class="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <p class="font-semibold">{user.username}</p>
                                <p class="text-sm text-gray-400">{user.afkStatus.message}</p>
                            </div>
                        </div>
                    </button>

                    {#if expandedUser === user.userId}
                        <div transition:slide class="p-4 bg-gray-750" id={`user-details-${user.userId}`}>
                            <p class="text-sm text-gray-400 mb-2">
                                AFK since: {new Date(user.afkStatus.dateAdded).toLocaleString()}
                            </p>
                            <button
                                    on:click|stopPropagation={() => clearAfkStatus(user.userId)}
                                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Clear AFK Status
                            </button>
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }
</style>