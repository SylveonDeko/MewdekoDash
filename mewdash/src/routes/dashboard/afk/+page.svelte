<script lang="ts">
    import {onMount} from 'svelte';
    import {api} from '$lib/api';
    import type {PageData} from "./$types";
    import {currentGuild} from "$lib/stores/currentGuild.ts"
    import {fade, slide} from 'svelte/transition';
    import type {Afk} from "$lib/types/models.ts";
    import {goto} from "$app/navigation";
    import Notification from "$lib/Notification.svelte";


    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';

    export let data: PageData;

    let afkMessage = "";
    let afkUsers: Afk[] = [];
    let expandedUser = null;
    let loading = true;
    let error = null;

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await fetchAfkUsers();
    });

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
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

    async function setAfkStatus() {
        try {
            if (!$currentGuild?.id || !data.user?.id) {
                throw new Error("Guild or user information is missing");
            }
            await api.setAfkStatus($currentGuild.id, data.user.id, afkMessage);
            showNotificationMessage('AFK Updated', 'success');
            await fetchAfkUsers();
        } catch (error) {
            showNotificationMessage(`Failed to set AFK: ${error.message}`, 'error');
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
</script>

<svelte:head>
    <title>AFK Management - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">AFK Management</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType}/>
    {/if}
    <div class="mb-6">
        <input
                bind:value={afkMessage}
                class="p-2 border rounded mr-2 text-black"
                placeholder="AFK message"
        />
        <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={!$currentGuild?.id || !data.user?.id}
                on:click={setAfkStatus}
        >
            Set AFK Status
        </button>
    </div>

    <h2 class="text-xl font-semibold mb-3">Currently AFK Users</h2>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if afkUsers.length === 0}
        <p transition:fade class="text-gray-400 italic">No users are currently AFK.</p>
    {:else}
        <ul class="space-y-2">
            {#each afkUsers as user (user.userId)}
                <li
                        class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                        on:click={() => toggleUserExpand(user.userId)}
                >
                    <div class="flex items-center">
                        <img
                                src={user.avatarUrl}
                                alt={user.username}
                                class="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p class="font-semibold">{user.username}</p>
                            <p class="text-sm text-gray-400">{user.afkStatus.message}</p>
                        </div>
                    </div>

                    {#if expandedUser === user.userId}
                        <div transition:slide class="mt-3 pl-13">
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