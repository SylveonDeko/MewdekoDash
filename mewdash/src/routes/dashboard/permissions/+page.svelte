<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import { currentGuild } from "$lib/stores/currentGuild";
    import { fade, slide } from 'svelte/transition';
    import Notification from "$lib/Notification.svelte";
    import { goto } from "$app/navigation";
    import type { PermissionOverride } from "$lib/types";
    import { PermissionParser } from '$lib/PermissionParser';

    let permissionOverrides: PermissionOverride[] = [];
    let loading = true;
    let error: string | null = null;
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';

    let newOverride = {
        command: '',
        perm: 0n
    };

    let showPermissionDropdown = false;
    let selectedPermissions: string[] = [];
    let editingOverride: PermissionOverride | null = null;

    onMount(async () => {
        if (!$currentGuild) {
            await goto("/dashboard");
        }
        await fetchPermissionOverrides();
    });

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    async function fetchPermissionOverrides() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            permissionOverrides = await api.getPermissionOverrides($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch permission overrides:', err);
            error = err.message || "Failed to fetch permission overrides";
        } finally {
            loading = false;
        }
    }

    async function addPermissionOverride() {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            const newOverrideResponse = await api.addPermissionOverride($currentGuild.id, {
                command: newOverride.command,
                permissions: Number(newOverride.perm)
            });
            permissionOverrides = [...permissionOverrides, newOverrideResponse];
            showNotificationMessage('Permission override added', 'success');
            newOverride = { command: '', perm: 0n };
            selectedPermissions = [];
        } catch (error) {
            showNotificationMessage('Failed to add permission override: ' + error.message, 'error');
        }
    }

    async function updatePermissionOverride(override: PermissionOverride) {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            const updatedOverride = await api.addPermissionOverride($currentGuild.id, {
                command: override.command,
                permissions: Number(override.perm)
            });
            permissionOverrides = permissionOverrides.map(o => o.command === updatedOverride.command ? updatedOverride : o);
            showNotificationMessage('Permission override updated', 'success');
            editingOverride = null;
        } catch (error) {
            showNotificationMessage('Failed to update permission override: ' + error.message, 'error');
        }
    }

    async function deletePermissionOverride(commandName: string) {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            await api.deletePermissionOverride($currentGuild.id, commandName);
            permissionOverrides = permissionOverrides.filter(p => p.command !== commandName);
            showNotificationMessage('Permission override deleted', 'success');
            editingOverride = null;
        } catch (error) {
            showNotificationMessage('Failed to delete permission override: ' + error.message, 'error');
        }
    }

    function getPermissionNames(perm: bigint): string[] {
        return Object.entries(PermissionParser.getPermissions())
            .filter(([, value]) => (perm & BigInt(value)) !== 0n)
            .map(([key]) => key);
    }

    function togglePermission(permission: string) {
        const index = selectedPermissions.indexOf(permission);
        if (index === -1) {
            selectedPermissions = [...selectedPermissions, permission];
        } else {
            selectedPermissions = selectedPermissions.filter(p => p !== permission);
        }
        if (editingOverride) {
            editingOverride.perm = BigInt(selectedPermissions.reduce((acc, perm) => acc | PermissionParser.getPermissions()[perm], 0));
        } else {
            newOverride.perm = BigInt(selectedPermissions.reduce((acc, perm) => acc | PermissionParser.getPermissions()[perm], 0));
        }
    }

    function toggleDropdown(event: MouseEvent) {
        event.stopPropagation();
        showPermissionDropdown = !showPermissionDropdown;
    }

    function closeDropdown() {
        showPermissionDropdown = false;
    }

    function formatPermissionName(name: string): string {
        return name.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    }

    function startEditing(override: PermissionOverride) {
        editingOverride = { ...override };
        selectedPermissions = getPermissionNames(BigInt(override.perm));
    }

    function cancelEditing() {
        editingOverride = null;
        selectedPermissions = [];
    }

    $: selectedPermissionsText = selectedPermissions.length
        ? selectedPermissions.map(formatPermissionName).join(', ')
        : 'Select Permissions';
</script>

<svelte:window on:click={closeDropdown} />

<svelte:head>
    <title>Permission Overrides - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Permission Overrides</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType}/>
    {/if}
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else}
        <div class="mb-6 bg-gray-800 p-4 rounded-lg">
            <h2 class="text-xl font-semibold mb-2">Add New Override</h2>
            <div class="flex flex-col gap-2">
                <input
                        bind:value={newOverride.command}
                        placeholder="Command"
                        class="p-2 rounded bg-gray-700 text-white w-full"
                />
                <div class="relative">
                    <button
                            on:click={toggleDropdown}
                            class="p-2 rounded bg-gray-700 text-white w-full text-left flex justify-between items-center"
                    >
                        <span class="truncate">{selectedPermissionsText}</span>
                        <span class="transform transition-transform duration-200 {showPermissionDropdown ? 'rotate-180' : ''}">▼</span>
                    </button>
                    {#if showPermissionDropdown}
                        <div
                                class="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow-lg max-h-60 overflow-y-auto"
                                on:click|stopPropagation={() => {}}
                        >
                            {#each Object.entries(PermissionParser.getPermissions()) as [permission, value]}
                                <label
                                        class="flex items-center p-2 hover:bg-gray-600 cursor-pointer {selectedPermissions.includes(permission) ? 'bg-green-700' : ''}"
                                >
                                    <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(permission)}
                                            on:change={() => togglePermission(permission)}
                                            class="mr-2 hidden"
                                    />
                                    <span>{formatPermissionName(permission)}</span>
                                </label>
                            {/each}
                        </div>
                    {/if}
                </div>
                <button
                        on:click={addPermissionOverride}
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add Override
                </button>
            </div>
        </div>

        {#if permissionOverrides.length === 0}
            <p transition:fade class="text-gray-400 italic">No permission overrides found.</p>
        {:else}
            <ul class="space-y-4">
                {#each permissionOverrides as override (override.command)}
                    <li
                            transition:slide
                            class="bg-gray-800 rounded-lg p-4"
                    >
                        {#if editingOverride && editingOverride.command === override.command}
                            <div class="flex flex-col gap-2">
                                <input
                                        bind:value={editingOverride.command}
                                        class="p-2 rounded bg-gray-700 text-white w-full"
                                        disabled
                                />
                                <div class="relative">
                                    <button
                                            on:click={toggleDropdown}
                                            class="p-2 rounded bg-gray-700 text-white w-full text-left flex justify-between items-center"
                                    >
                                        <span class="truncate">{selectedPermissionsText}</span>
                                        <span class="transform transition-transform duration-200 {showPermissionDropdown ? 'rotate-180' : ''}">▼</span>
                                    </button>
                                    {#if showPermissionDropdown}
                                        <div
                                                class="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow-lg max-h-60 overflow-y-auto"
                                                on:click|stopPropagation={() => {}}
                                        >
                                            {#each Object.entries(PermissionParser.getPermissions()) as [permission, value]}
                                                <label
                                                        class="flex items-center p-2 hover:bg-gray-600 cursor-pointer {selectedPermissions.includes(permission) ? 'bg-green-700' : ''}"
                                                >
                                                    <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission)}
                                                            on:change={() => togglePermission(permission)}
                                                            class="mr-2 hidden"
                                                    />
                                                    <span>{formatPermissionName(permission)}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                                <div class="flex gap-2">
                                    <button
                                            on:click={() => updatePermissionOverride(editingOverride)}
                                            class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                            on:click={cancelEditing}
                                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <p class="font-semibold">{override.command}</p>
                                    <p class="text-sm text-gray-400">Permissions: {getPermissionNames(BigInt(override.perm)).map(formatPermissionName).join(', ')}</p>
                                </div>
                                <div class="flex gap-2 mt-2 sm:mt-0">
                                    <button
                                            on:click={() => startEditing(override)}
                                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                            on:click={() => deletePermissionOverride(override.command)}
                                            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    {/if}
</div>

<style>
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>