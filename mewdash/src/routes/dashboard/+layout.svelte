<script lang="ts">
    import { page } from '$app/stores';
    import { fly, slide, fade } from 'svelte/transition';
    import { clickOutside } from './clickOutside';
    import type { LayoutData } from './$types';
    import { userAdminGuilds } from '$lib/stores/adminGuildsStore';
    import { currentGuild } from "$lib/stores/currentGuild.ts";
    import type { DiscordGuild } from "$lib/types/discordGuild.ts";
    import { browser } from '$app/environment';
    import { onMount, onDestroy } from 'svelte';

    export let data: LayoutData;

    let items = [
        { href: '/dashboard', text: 'Dashboard', icon: '📊' },
        { href: '/dashboard/afk', text: 'AFK', icon: '💤' },
        { href: '/dashboard/chat-triggers', text: 'Chat', icon: '💬' },
        { href: '/dashboard/suggestions', text: 'Suggestions', icon: '💡' }
    ];

    let sidebarOpen = false;
    let dropdownOpen = false;
    let isMobile = false;

    function checkMobile() {
        isMobile = browser && window.innerWidth < 768;
    }

    onMount(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('resize', checkMobile);
        }
    });

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown() {
        dropdownOpen = false;
    }

    function selectGuild(guild: DiscordGuild) {
        currentGuild.set(guild);
        closeDropdown();
    }

    function handleClickOutside() {
        closeDropdown();
    }

    function getGuildIconUrl(guild: DiscordGuild) {
        if (guild.icon) {
            const extension = guild.icon.startsWith('a_') ? 'gif' : 'png';
            return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}`;
        }
        return 'https://cdn.discordapp.com/embed/avatars/0.png';
    }

    function getStaggeredDelay(index: number, baseDelay: number = 50) {
        return index * baseDelay;
    }

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
</script>


<div class="dashboard-container flex flex-col min-h-0">
    <div class="flex-grow flex {isMobile ? 'flex-col' : ''} overflow-hidden">
        {#if isMobile}
            <header class="bg-gray-800 p-4 flex items-center justify-between">
                <button on:click={toggleSidebar} class="text-white">
                    <span class="sr-only">Menu</span>
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <div class="text-white font-bold">{$currentGuild ? $currentGuild.name : 'Dashboard'}</div>
                <div class="w-6"></div>
            </header>
        {/if}

        <aside class="sidebar {isMobile ? 'fixed inset-y-0 left-0 z-50' : 'w-64'} bg-gray-800 overflow-y-auto"
               class:translate-x-0={!isMobile || sidebarOpen}
               class:-translate-x-full={isMobile && !sidebarOpen}
               transition:slide={{duration: 300}}>
            <div class="sidebar-content p-5">
                {#if isMobile}
                    <button on:click={toggleSidebar} class="text-white mb-4">
                        <span class="sr-only">Close</span>
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                {/if}
                <div class="guild-selector relative mb-5" use:clickOutside on:clickoutside={handleClickOutside}>
                    <button class="dropdown-toggle w-full p-2 bg-gray-700 text-white border border-gray-600 rounded cursor-pointer text-sm text-left flex items-center"
                            on:click={toggleDropdown}>
                        {#if $currentGuild}
                            <img src={getGuildIconUrl($currentGuild)} alt={$currentGuild.name}
                                 class="guild-icon w-6 h-6 rounded-full mr-2 object-cover"/>
                            <span class="guild-name flex-grow">{$currentGuild.name}</span>
                        {:else}
                            <span class="guild-name flex-grow">Select a Guild</span>
                        {/if}
                        <span class="dropdown-arrow text-xs">▼</span>
                    </button>
                    {#if dropdownOpen}
                        <ul class="dropdown-menu absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto z-10"
                            transition:fly="{{ y: -10, duration: 200 }}">
                            {#each $userAdminGuilds as guild}
                                <li on:click={() => selectGuild(guild)}
                                    class="dropdown-item p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-600 flex items-center">
                                    <img src={getGuildIconUrl(guild)} alt={guild.name}
                                         class="guild-icon w-6 h-6 rounded-full mr-2 object-cover"/>
                                    <span class="guild-name">{guild.name}</span>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <nav>
                    <ul>
                        {#key $currentGuild}
                            {#if $currentGuild}
                                {#each items as item, index}
                                    <li in:fly="{{ x: -50, delay: getStaggeredDelay(index), duration: 300 }}">
                                        <a href={item.href}
                                           class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 {$page.url.pathname === item.href ? 'bg-yellow-700' : ''}"
                                           on:click={() => sidebarOpen = false}>
                                            {item.icon} {item.text}
                                        </a>
                                    </li>
                                {/each}
                            {:else}
                                <li>
                                    <a href="/dashboard"
                                       class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 {$page.url.pathname === '/dashboard' ? 'bg-yellow-700' : ''}"
                                       on:click={() => sidebarOpen = false}>
                                        📊 Dashboard
                                    </a>
                                </li>
                            {/if}
                        {/key}
                    </ul>
                </nav>
            </div>
        </aside>

        <main class="dashboard-content flex-grow p-4 overflow-y-auto">
            <slot/>
        </main>
    </div>
</div>


<style>
    .dashboard-container {
        height: calc(100vh - 100px);
    }

    .sidebar {
        width: 250px;
        background-color: #2a2a2a;
        height: 100%;
        overflow-y: auto;
    }

    .sidebar-content {
        padding: 20px;
    }

    .dashboard-content {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .guild-selector {
        margin-bottom: 20px;
        position: relative;
    }

    .dropdown-toggle {
        width: 100%;
        padding: 10px;
        background-color: #3a3a3a;
        color: #ffffff;
        border: 1px solid #4a4a4a;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        text-align: left;
        display: flex;
        align-items: center;
    }

    .dropdown-toggle:hover, .dropdown-toggle:focus {
        background-color: #4a4a4a;
        outline: none;
    }

    .guild-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 10px;
        object-fit: cover;
    }

    .guild-name {
        flex-grow: 1;
    }

    .dropdown-arrow {
        font-size: 12px;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #3a3a3a;
        border: 1px solid #4a4a4a;
        border-radius: 5px;
        margin-top: 5px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 10;
    }

    .dropdown-item {
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
    }

    .dropdown-item:hover {
        background-color: #4a4a4a;
    }

    nav ul {
        list-style-type: none;
        padding: 0;
    }

    .nav-link {
        display: block;
        color: #ffffff;
        text-decoration: none;
        padding: 10px;
        margin-bottom: 5px;
        border-radius: 5px;
        transition: background-color 0.2s;
    }

    .nav-link:hover {
        background-color: #3a3a3a;
    }

    .nav-link.active {
        background-color: #938018;
    }

    @media (max-width: 767px) {
        .dashboard-content {
            padding: 10px 10px 70px;
        }

        .nav-link {
            padding: 15px 10px;
            margin-bottom: 10px;
        }

        .dropdown-toggle {
            padding: 15px;
            font-size: 16px;
        }

        .guild-icon {
            width: 30px;
            height: 30px;
        }

        .dropdown-item {
            padding: 15px;
        }
    }
</style>

<svelte:window on:resize={checkMobile}/>

<svelte:head>
    <title>{$currentGuild ? $currentGuild.name : 'Dashboard'} - Mewdeko</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
</svelte:head>