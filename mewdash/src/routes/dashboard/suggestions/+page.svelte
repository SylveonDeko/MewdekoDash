<script lang="ts">
    import { api } from '$lib/api';
    import type { PageData } from './$types';
    import type { Suggestion } from '$lib/types';

    export let data: PageData;

    let suggestions: Suggestion[] = data.suggestions || [];

    async function deleteSuggestion(id: string) {
        try {
            await api.deleteSuggestion(data.guildId, id);
            suggestions = suggestions.filter(s => s.id !== id);
            alert('Suggestion deleted');
        } catch (error) {
            alert('Failed to delete suggestion');
        }
    }
</script>

<svelte:head>
    <title>Suggestions - Mewdeko Dashboard</title>
</svelte:head>

<h1>Suggestions</h1>

<div class="suggestions-list">
    {#each suggestions as suggestion (suggestion.id)}
        <div class="suggestion-item">
            <p>{suggestion.content}</p>
            <p>Status: {suggestion.status}</p>
            <button on:click={() => deleteSuggestion(suggestion.id)}>Delete</button>
        </div>
    {/each}
</div>

<style>
    .suggestions-list {
        margin-top: 20px;
    }
    .suggestion-item {
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
    }
    .suggestion-item button {
        margin-top: 5px;
    }
</style>