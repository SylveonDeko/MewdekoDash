<script lang="ts">
    import { page } from '$app/stores';
    import { fly, slide, fade } from 'svelte/transition';
    import { clickOutside } from './clickOutside';
    import { userAdminGuilds } from '$lib/stores/adminGuildsStore';
    import { currentGuild } from "$lib/stores/currentGuild.ts";
    import type { DiscordGuild } from "$lib/types/discordGuild.ts";
    import { browser } from '$app/environment';
    import { onMount, onDestroy, tick } from 'svelte';
    import { triggerAnimation, triggerMenuAnimation } from "$lib/stores/animationStores.ts";

    let items = [
        { href: '/dashboard', text: 'Dashboard', icon: '📊' },
        { href: '/dashboard/afk', text: 'AFK', icon: '💤' },
        { href: '/dashboard/chat-triggers', text: 'Triggers', icon: '💬' },
        { href: '/dashboard/suggestions', text: 'Suggestions', icon: '💡' },
        { href: '/dashboard/permissions', text: 'Permissions', icon: '🔒' },
        { href: '/dashboard/giveaways', text: 'Giveaways', icon: '🎁'}
    ];

    let sidebarOpen = false;
    let dropdownOpen = false;
    let isMobile = false;
    let animationKey = 0;

    function checkMobile() {
        isMobile = browser && window.innerWidth < 768;
    }

    onMount(() => {
        if (browser) {
            checkMobile();
            window.addEventListener('resize', checkMobile);
        }
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

    async function selectGuild(guild: DiscordGuild) {
        if ($currentGuild === guild)
            return;
        currentGuild.set(guild);
        closeDropdown();
        await tick();
        animationKey += 1;
        triggerMenuAnimation();
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
        if (browser) {
            document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDropdown();
        }
    }

    function handleGuildKeydown(event: KeyboardEvent, guild: DiscordGuild) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectGuild(guild);
        }
    }
</script>

<div class="dashboard-container flex flex-col min-h-0">
    <div class="flex-grow flex {isMobile ? 'flex-col' : ''} overflow-hidden">
        {#if isMobile}
            <header class="bg-gray-800 p-4 flex items-center justify-between">
                <button on:click={toggleSidebar} class="text-white" aria-label="Toggle menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <div class="text-white font-bold">{$currentGuild ? $currentGuild.name : 'Dashboard'}</div>
                <div class="w-6"></div>
            </header>
        {/if}

        {#if isMobile && sidebarOpen}
            <div class="fixed inset-0 bg-black bg-opacity-50 z-40"
                 on:click={toggleSidebar}
                 transition:fade={{duration: 300}}
                 role="presentation">
            </div>
        {/if}

        <aside class="sidebar {isMobile ? 'fixed inset-y-0 left-0 z-50' : 'w-64'} bg-gray-800 overflow-y-auto transition-transform duration-300 ease-in-out"
               class:translate-x-0={!isMobile || sidebarOpen}
               class:-translate-x-full={isMobile && !sidebarOpen}
               role="region"
               aria-label="Main navigation">
            <div class="sidebar-content p-5">
                {#if isMobile}
                    <button on:click={toggleSidebar} class="text-white mb-4" aria-label="Close menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                {/if}
                <div class="guild-selector relative mb-5" use:clickOutside on:clickoutside={handleClickOutside}>
                    <button class="dropdown-toggle w-full p-2 bg-gray-700 text-white border border-gray-600 rounded cursor-pointer text-sm text-left flex items-center"
                            on:click={toggleDropdown}
                            on:keydown={handleKeydown}
                            aria-haspopup="listbox"
                            aria-expanded={dropdownOpen}
                            aria-label="Select a guild">
                        {#if $currentGuild}
                            <img src={getGuildIconUrl($currentGuild)} alt="" class="guild-icon w-6 h-6 rounded-full mr-2 object-cover"/>
                            <span class="guild-name flex-grow">{$currentGuild.name}</span>
                        {:else}
                            <span class="guild-name flex-grow">Select a Guild</span>
                        {/if}
                        <span class="dropdown-arrow text-xs" aria-hidden="true">▼</span>
                    </button>
                    {#if dropdownOpen}
                        <ul class="dropdown-menu absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto z-10"
                            transition:fly="{{ y: -10, duration: 200 }}"
                            role="listbox"
                            tabindex="-1">
                            {#each $userAdminGuilds as guild}
                                <li role="option" aria-selected={$currentGuild === guild}>
                                    <button on:click={() => selectGuild(guild)}
                                            on:keydown={(event) => handleGuildKeydown(event, guild)}
                                            class="dropdown-item w-full text-left p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-600 flex items-center">
                                        <img src={getGuildIconUrl(guild)} alt="" class="guild-icon w-6 h-6 rounded-full mr-2 object-cover"/>
                                        <span class="guild-name">{guild.name}</span>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <nav>
                    <ul>
                        {#key $currentGuild}
                            {#if $currentGuild}
                                <li>
                                    <a href="/dashboard"
                                       class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 nav-link.active {$page.url.pathname === '/dashboard' ? 'bg-yellow-700' : ''}"
                                       on:click={() => sidebarOpen = false}>
                                        📊 Dashboard
                                    </a>
                                </li>
                                {#each items.slice(1) as item, index}
                                    <li>
                                        {#key $triggerAnimation}
                                            <a href={item.href}
                                               class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 {$page.url.pathname === item.href ? 'bg-yellow-700' : ''}"
                                               on:click={() => sidebarOpen = false}
                                               in:fly="{{ y: 50, delay: getStaggeredDelay(index, 100), duration: 300 }}">
                                                <span aria-hidden="true">{item.icon}</span> {item.text}
                                            </a>
                                        {/key}
                                    </li>
                                {/each}
                            {:else}
                                <li>
                                    <a href="/dashboard"
                                       class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 {$page.url.pathname === '/dashboard' ? 'bg-yellow-700' : ''}"
                                       on:click={() => sidebarOpen = false}>
                                        <span aria-hidden="true">📊</span> Dashboard
                                    </a>
                                </li>
                            {/if}
                        {/key}
                    </ul>
                </nav>
            </div>
        </aside>

        <main class="dashboard-content flex-grow p-4 overflow-y-auto transition-transform duration-300 ease-in-out"
              class:translate-x-64={isMobile && sidebarOpen}>
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

        .sidebar {
            width: 250px; /* Set a fixed width for mobile */
        }
    }
</style>

<svelte:window on:resize={checkMobile}/>

<svelte:head>
    <title>{$currentGuild ? $currentGuild.name : 'Dashboard'} - Mewdeko</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
</svelte:head>