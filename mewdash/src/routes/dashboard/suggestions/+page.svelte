<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import {api} from '$lib/api';
    import type {PageData} from './$types';
    import {currentGuild} from "$lib/stores/currentGuild.ts"
    import {fade, slide} from 'svelte/transition';
    import {SuggestionState} from "$lib/types/models.ts"
    import type {SuggestionsModel, GuildConfig} from "$lib/types/models.ts";
    import {goto} from "$app/navigation";
    import Notification from "$lib/Notification.svelte";
    import {browser} from "$app/environment";

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
    let isMobile = false;

    $: sortedSuggestions = [...suggestions].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    function toggleSortDirection() {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    function checkMobile() {
        isMobile = browser && window.innerWidth < 768;
    }

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await fetchGuildConfig();
        await fetchSuggestions();
        checkMobile();
        if (browser)
            window.addEventListener('resize', checkMobile);
    });

    onDestroy(async () => {
        if (browser)
            window.removeEventListener('resize', checkMobile);
    })

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
            suggestion.currentState = newState;
            showNotificationMessage('Suggestion status updated', 'success');
            stateChangeReason = "";
        } catch (error) {
            showNotificationMessage('Failed to update suggestion status: ' + error.message, 'error');
        }
    }

    function toggleSuggestionExpand(id: number, event: Event) {
        // Prevent the click from propagating to parent elements
        event.stopPropagation();
        expandedSuggestion = expandedSuggestion === id ? null : id;
    }

    function handleKeydown(event: KeyboardEvent, id: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSuggestionExpand(id, event);
        }
    }

    function getStatusString(state: SuggestionState): string {
        switch (state) {
            case SuggestionState.Pending:
                return "Pending";
            case SuggestionState.Accepted:
                return "Accepted";
            case SuggestionState.Denied:
                return "Denied";
            case SuggestionState.Considered:
                return "Considered";
            case SuggestionState.Implemented:
                return "Implemented";
            default:
                return "Unknown";
        }
    }

    function getStateColor(state: SuggestionState): string {
        switch (state) {
            case SuggestionState.Pending:
                return "bg-yellow-500";
            case SuggestionState.Accepted:
                return "bg-green-500";
            case SuggestionState.Denied:
                return "bg-red-500";
            case SuggestionState.Considered:
                return "bg-blue-500";
            case SuggestionState.Implemented:
                return "bg-purple-500";
            default:
                return "bg-gray-500";
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
        <Notification message={notificationMessage} type={notificationType}/>
    {/if}
    {#if loading}
        <p>Loading...</p>
    {:else if !suggestions || suggestions.length === 0}
        <p transition:fade class="text-gray-400 italic">No suggestions found.</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else}
        <div class="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label for="sortBy" class="sr-only">Sort by</label>
            <select id="sortBy" bind:value={sortBy} class="w-full sm:w-auto mb-2 sm:mb-0 mr-0 sm:mr-2 bg-gray-700 text-white rounded p-2">
                <option value="dateAdded">Sort by Date</option>
                <option value="currentState">Sort by State</option>
            </select>
            <button on:click={toggleSortDirection} class="w-full sm:w-auto bg-gray-700 text-white rounded p-2">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
        </div>
        <ul class="space-y-4">
            {#each sortedSuggestions as suggestion (suggestion.id)}
                <li class="bg-gray-800 rounded-lg overflow-hidden relative">
                    <button
                            class="w-full text-left p-4 hover:bg-gray-700 transition-colors duration-200"
                            on:click={(event) => toggleSuggestionExpand(suggestion.id, event)}
                            aria-expanded={expandedSuggestion === suggestion.id}
                    >
                        <div class={`absolute left-0 top-0 bottom-0 w-1 ${getStateColor(suggestion.currentState)}`}></div>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center">
                            <img
                                    src={suggestion.user.avatarUrl}
                                    alt={`${suggestion.user.username}'s avatar`}
                                    class="w-10 h-10 rounded-full mb-2 sm:mb-0 sm:mr-3"
                            />
                            <div class="flex-grow mb-2 sm:mb-0">
                                <p class="font-semibold">{suggestion.user.username}</p>
                                <p class="text-sm text-gray-400">{suggestion.suggestion}</p>
                                <p class="text-sm text-gray-400">Status: {getStatusString(suggestion.currentState)}</p>
                            </div>
                            <div class="flex flex-wrap gap-2 justify-start sm:justify-end w-full sm:w-auto">
                                {#each getEmotes() as emote, index}
                                    <div class="flex items-center bg-gray-700 rounded-full px-2 py-1">
                                        <span class="mr-1">{@html renderEmote(emote)}</span>
                                        <span class="text-xs font-semibold">{suggestion[`emoteCount${index + 1}`]}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </button>

                    {#if expandedSuggestion === suggestion.id}
                        <div transition:slide class="p-4 bg-gray-750">
                            <p class="text-sm text-gray-400 mb-2">
                                Suggestion ID: {suggestion.suggestionId}
                            </p>
                            <div class="mb-2">
                                <label for={`reason-${suggestion.id}`} class="sr-only">Reason for status change</label>
                                <input
                                        id={`reason-${suggestion.id}`}
                                        type="text"
                                        bind:value={stateChangeReason}
                                        placeholder="Reason (Optional)"
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