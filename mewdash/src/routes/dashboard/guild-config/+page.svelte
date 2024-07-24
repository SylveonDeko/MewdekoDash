<script lang="ts">
    import { api } from '$lib/api';
    import type { PageData } from './$types';
    import type { GuildConfig } from '$lib/types';

    export let data: PageData;

    let config: GuildConfig = data.config || { guildId: data.guildId, prefix: '!' };

    async function updateConfig() {
        try {
            await api.updateGuildConfig(data.guildId, config);
            alert('Guild config updated');
        } catch (error) {
            alert('Failed to update guild config');
        }
    }
</script>

<svelte:head>
    <title>Guild Config - Mewdeko Dashboard</title>
</svelte:head>

<h1>Guild Config</h1>

<div>
    <label>
        Prefix:
        <input bind:value={config.prefix} />
    </label>
    <!-- Add more config options here -->
    <button on:click={updateConfig}>Update Config</button>
</div>

<style>
    label {
        display: block;
        margin-bottom: 10px;
    }
</style>