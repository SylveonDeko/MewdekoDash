<script lang="ts">
    import { page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import type { LayoutData } from './$types';
    import { userAdminGuilds } from '$lib/stores/adminGuildsStore';
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import type {DiscordGuild} from "$lib/types/discordGuild.ts";

    export let data: LayoutData;

    let selectedGuildId: DiscordGuild = $userAdminGuilds[0];

    let items = [
        { href: '/dashboard/afk', text: 'AFK Management' },
        { href: '/dashboard/chat-triggers', text: 'Chat Triggers' },
        { href: '/dashboard/guild-config', text: 'Guild Config' },
        { href: '/dashboard/suggestions', text: 'Suggestions' }
    ];

    $: if (selectedGuildId) {
        currentGuild.set(selectedGuildId);
    }
</script>

<div class="dashboard">
    <aside class="sidebar">
        <div class="user-info">
            {#if data.user && data.user.avatar && data.user.avatar.startsWith("a_")}
                <img src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.avatar}.gif"
                     alt={data.user.username}
                     class="rounded-full bg-gray-600 h-12" height="48" width="48" />
            {:else if data.user && data.user.avatar}
                <img src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.avatar}.png"
                     alt={data.user.username}
                     class="rounded-full bg-gray-600 h-12" height="48" width="48" />
            {/if}
            <span>{data.user.username}</span>
        </div>
        <nav>
            <ul class="space-y-2">
                <li class="transition-all duration-300 ease-in-out">
                    <a href="/dashboard" class="block py-2 px-4 hover:bg-gray-700 rounded {$page.url.pathname === '/dashboard' ? 'bg-gray-700' : ''}">
                        Dashboard
                    </a>
                </li>
                {#if $currentGuild}
                    {#each items as item, i}
                        <li
                                transition:fly="{{ y: 50, duration: 300, delay: i * 100 }}"
                                class="transition-all duration-300 ease-in-out"
                        >
                            <a
                                    href={item.href}
                                    class="block py-2 px-4 hover:bg-gray-700 rounded {$page.url.pathname === item.href ? 'bg-gray-700' : ''}"
                            >
                                {item.text}
                            </a>
                        </li>
                    {/each}
                {/if}
            </ul>
        </nav>
        <div class="guild-selector">
            <select bind:value={$currentGuild}>
                {#each $userAdminGuilds as guild}
                    <option value={guild}>{guild.name}</option>
                {/each}
            </select>
        </div>
    </aside>
    <main class="main-content">
        <slot />
    </main>
</div>

<style>
    .dashboard {
        display: flex;
        height: 100vh;
    }
    .sidebar {
        width: 250px;
        background-color: #2a2a2a;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }
    .main-content {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
    }
    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }
    .user-info img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    }
    nav ul {
        list-style-type: none;
        padding: 0;
    }
    nav li {
        margin-bottom: 10px;
    }
    nav a {
        color: #ffffff;
        text-decoration: none;
    }
    nav a.active {
        color: #938018;
    }
    .guild-selector {
        margin-top: auto;
    }
    select {
        width: 100%;
        padding: 5px;
        background-color: #3a3a3a;
        color: #ffffff;
        border: none;
        border-radius: 5px;
    }
</style>