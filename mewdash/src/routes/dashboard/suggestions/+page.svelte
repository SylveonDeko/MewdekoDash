<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import type { PageData } from './$types';
    import { currentGuild } from "$lib/stores/currentGuild.ts"
    import { fade, slide } from 'svelte/transition';
    import {SuggestionState } from "$lib/types/models.ts"
    import type { SuggestionsModel, GuildConfig } from "$lib/types/models.ts";
    import {goto} from "$app/navigation";

    export let data: PageData;

    let suggestions: SuggestionsModel[] = [];
    let guildConfig: GuildConfig;
    let expandedSuggestion = null;
    let loading = true;
    let error = null;

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await fetchGuildConfig();
        await fetchSuggestions();
    });

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
            alert('Suggestion deleted');
        } catch (error) {
            alert('Failed to delete suggestion: ' + error.message);
        }
    }

    function toggleSuggestionExpand(id: number) {
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

    function getEmotes(): string[] {
        if (guildConfig && guildConfig.SuggestEmotes) {
            return guildConfig.SuggestEmotes.split(',');
        }
        return ['👍', '👎'];
    }

    function renderEmote(emote: string): string {
        if (emote.startsWith('<') && emote.endsWith('>')) {
            // This is a custom Discord emote
            const match = emote.match(/<(a)?:(\w+):(\d+)>/);
            if (match) {
                const animated = match[1];
                const emoteId = match[3];
                const extension = animated ? 'gif' : 'png';
                return `<img src="https://cdn.discordapp.com/emojis/${emoteId}.${extension}" alt="${emote}" class="inline-block w-6 h-6">`;
            }
        }
        // This is a Unicode emote or the regex didn't match
        return emote;
    }
</script>

<svelte:head>
    <title>Suggestions - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Suggestions</h1>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if !suggestions || suggestions.length === 0}
        <p transition:fade class="text-gray-400 italic">No suggestions found.</p>
    {:else}
        <ul class="space-y-2">
            {#each suggestions as suggestion (suggestion.id)}
                <li
                        class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                        on:click={() => toggleSuggestionExpand(suggestion.id)}
                >
                    <div class="flex items-center">
                        <img
                                src={suggestion.user.avatarUrl}
                                alt={suggestion.user.username}
                                class="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p class="font-semibold">{suggestion.user.username}</p>
                            <p class="text-sm text-gray-400">{suggestion.suggestion}</p>
                            <p class="text-sm text-gray-400">Status: {getStatusString(suggestion.currentState)}</p>
                        </div>
                    </div>

                    {#if expandedSuggestion === suggestion.id}
                        <div transition:slide class="mt-3 pl-13">
                            <p class="text-sm text-gray-400 mb-2">
                                Suggestion ID: {suggestion.suggestionId}
                            </p>
                            <p class="text-sm text-gray-400 mb-2">
                                Emote Counts:
                                {#each getEmotes() as emote, index}
                                    {@html renderEmote(emote)} {suggestion[`emoteCount${index + 1}`]}
                                {/each}
                            </p>
                            <button
                                    on:click|stopPropagation={() => deleteSuggestion(suggestion.id)}
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