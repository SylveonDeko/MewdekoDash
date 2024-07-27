<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import type { PageData } from './$types';
    import { currentGuild } from "$lib/stores/currentGuild.ts"
    import { fade, slide } from 'svelte/transition';
    import { SuggestionState } from "$lib/types/models.ts"
    import type { SuggestionsModel, GuildConfig } from "$lib/types/models.ts";
    import { goto } from "$app/navigation";
    import Notification from "$lib/Notification.svelte";

    export let data: PageData;

    let suggestions: SuggestionsModel[] = [];
    let guildConfig: GuildConfig;
    let expandedSuggestion = null;
    let loading = true;
    let error = null;
    let stateChangeReason = "";
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';
    let sortBy: 'dateAdded' | 'currentState' = 'dateAdded';
    let sortDirection: 'asc' | 'desc' = 'desc';

    $: sortedSuggestions = [...suggestions].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    function toggleSortDirection() {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await fetchGuildConfig();
        await fetchSuggestions();
    });

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    async function fetchGuildConfig() {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            guildConfig = await api.getGuildConfig($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch guild config:', err);
            error = err.message || "Failed to fetch guild config";
        }
    }

    async function fetchSuggestions() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            var fetched = await api.getSuggestions($currentGuild.id);
            if (fetched === null || fetched.length === 0)
                return;
            for (let suggestion of fetched) {
                const userResponse = await api.getUser(suggestion.guildId, suggestion.userId);
                suggestion.user = userResponse;
            }
            suggestions = fetched
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
            error = err.message || "Failed to fetch suggestions";
        } finally {
            loading = false;
        }
    }

    async function deleteSuggestion(id: number) {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            await api.deleteSuggestion($currentGuild.id, id);
            suggestions = suggestions.filter(s => s.id !== id);
            showNotificationMessage('Suggestion Deleted', 'success');
        } catch (error) {
            showNotificationMessage('Failed to delete suggestion: ' + error.message, 'error');
        }
    }

    async function updateSuggestionStatus(suggestion: SuggestionsModel, newState: SuggestionState) {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            await api.updateSuggestionStatus(
                $currentGuild.id,
                suggestion.suggestionId,
                {
                    state: newState,
                    reason: stateChangeReason || null,
                    userId: data.user.id
                }
            );
            // Update the suggestion state locally
            suggestion.currentState = newState;
            showNotificationMessage('Suggestion status updated', 'success');
            stateChangeReason = "";
        } catch (error) {
            showNotificationMessage('Failed to update suggestion status: ' + error.message, 'error');
        }
    }

    function toggleSuggestionExpand(id: number, event: MouseEvent) {
        if (event.target instanceof HTMLElement && event.target.closest('button, input')) {
            // If the click was on a button or input, don't toggle
            return;
        }
        expandedSuggestion = expandedSuggestion === id ? null : id;
    }

    function getStatusString(state: SuggestionState): string {
        switch(state) {
            case SuggestionState.Pending: return "Pending";
            case SuggestionState.Accepted: return "Accepted";
            case SuggestionState.Denied: return "Denied";
            case SuggestionState.Considered: return "Considered";
            case SuggestionState.Implemented: return "Implemented";
            default: return "Unknown";
        }
    }

    function getStateColor(state: SuggestionState): string {
        switch(state) {
            case SuggestionState.Pending: return "bg-yellow-500";
            case SuggestionState.Accepted: return "bg-green-500";
            case SuggestionState.Denied: return "bg-red-500";
            case SuggestionState.Considered: return "bg-blue-500";
            case SuggestionState.Implemented: return "bg-purple-500";
            default: return "bg-gray-500";
        }
    }

    function getEmotes(): string[] {
        if (guildConfig && guildConfig.SuggestEmotes) {
            return guildConfig.SuggestEmotes.split(',');
        }
        return ['👍', '👎'];
    }

    function renderEmote(emote: string): string {
        if (emote.startsWith('<') && emote.endsWith('>')) {
            const match = emote.match(/<(a)?:(\w+):(\d+)>/);
            if (match) {
                const animated = match[1];
                const emoteId = match[3];
                const extension = animated ? 'gif' : 'png';
                return `<img src="https://cdn.discordapp.com/emojis/${emoteId}.${extension}" alt="${emote}" class="inline-block w-6 h-6">`;
            }
        }
        return emote;
    }
</script>

<svelte:head>
    <title>Suggestions - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Suggestions</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType} />
    {/if}
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if !suggestions || suggestions.length === 0}
        <p transition:fade class="text-gray-400 italic">No suggestions found.</p>
    {:else}
        <div class="mb-4 flex items-center">
            <select bind:value={sortBy} class="mr-2 bg-gray-700 text-white rounded p-2">
                <option value="dateAdded">Sort by Date</option>
                <option value="currentState">Sort by State</option>
            </select>
            <button on:click={toggleSortDirection} class="bg-gray-700 text-white rounded p-2">
                {sortDirection === 'asc' ? '▲' : '▼'}
            </button>
        </div>
        <ul class="space-y-2">
            {#each sortedSuggestions as suggestion (suggestion.id)}
                <li
                        class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 relative overflow-hidden"
                        on:click={(event) => toggleSuggestionExpand(suggestion.id, event)}
                >
                    <div class={`absolute left-0 top-0 bottom-0 w-1 ${getStateColor(suggestion.currentState)}`}></div>
                    <div class="flex items-center">
                        <img
                                src={suggestion.user.avatarUrl}
                                alt={suggestion.user.username}
                                class="w-10 h-10 rounded-full mr-3"
                        />
                        <div class="flex-grow">
                            <p class="font-semibold">{suggestion.user.username}</p>
                            <p class="text-sm text-gray-400">{suggestion.suggestion}</p>
                            <p class="text-sm text-gray-400">Status: {getStatusString(suggestion.currentState)}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            {#each getEmotes() as emote, index}
                                <div class="flex items-center bg-gray-700 rounded-full px-2 py-1">
                                    <span class="mr-1">{@html renderEmote(emote)}</span>
                                    <span class="text-xs font-semibold">{suggestion[`emoteCount${index + 1}`]}</span>
                                </div>
                            {/each}
                        </div>
                    </div>

                    {#if expandedSuggestion === suggestion.id}
                        <div transition:slide class="mt-3 pl-13">
                            <p class="text-sm text-gray-400 mb-2">
                                Suggestion ID: {suggestion.suggestionId}
                            </p>
                            <div class="mb-2">
                                <input
                                        type="text"
                                        bind:value={stateChangeReason}
                                        placeholder="Reason for state change"
                                        class="w-full p-2 rounded bg-gray-700 text-white"
                                />
                            </div>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <button
                                        on:click={() => updateSuggestionStatus(suggestion, SuggestionState.Accepted)}
                                        class="bg-green-500 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Accept
                                </button>
                                <button
                                        on:click={() => updateSuggestionStatus(suggestion, SuggestionState.Denied)}
                                        class="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Deny
                                </button>
                                <button
                                        on:click={() => updateSuggestionStatus(suggestion, SuggestionState.Considered)}
                                        class="bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Consider
                                </button>
                                <button
                                        on:click={() => updateSuggestionStatus(suggestion, SuggestionState.Implemented)}
                                        class="bg-purple-500 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Implement
                                </button>
                            </div>
                            <button
                                    on:click={() => deleteSuggestion(suggestion.id)}
                                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Delete Suggestion
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