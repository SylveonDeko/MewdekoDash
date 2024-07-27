<script lang="ts">
    import {page} from '$app/stores';
    import {fly} from 'svelte/transition';
    import {clickOutside} from './clickOutside';
    import type {LayoutData} from './$types';
    import {userAdminGuilds} from '$lib/stores/adminGuildsStore';
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import type {DiscordGuild} from "$lib/types/discordGuild.ts";

    export let data: LayoutData;

    let items = [
        {href: '/dashboard', text: 'Dashboard'},
        {href: '/dashboard/afk', text: 'AFK Management'},
        {href: '/dashboard/chat-triggers', text: 'Chat Triggers'},
        {href: '/dashboard/suggestions', text: 'Suggestions'}
    ];

    let dropdownOpen = false;
    let sidebarOpen = false;

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown() {
        dropdownOpen = false;
    }

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
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
</script>

<div class="dashboard flex h-screen relative">
    <aside class="sidebar w-64 bg-gray-800 h-full overflow-y-auto transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0">
        <div class="sidebar-content p-5">
            <div class="user-info flex items-center mb-5">
                {#if data.user && data.user.avatar}
                    <img src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.avatar}.{data.user.avatar.startsWith('a_') ? 'gif' : 'png'}"
                         alt={data.user.username}
                         class="avatar w-10 h-10 rounded-full mr-3"/>
                {/if}
                <span class="username text-white font-bold">{data.user.username}</span>
            </div>

            <div class="guild-selector relative mb-5" on:clickoutside={handleClickOutside} use:clickOutside>
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
                                        {item.text}
                                    </a>
                                </li>
                            {/each}
                        {:else}
                            <li>
                                <a href="/dashboard"
                                   class="nav-link block text-white no-underline p-2 mb-1 rounded transition-colors duration-200 hover:bg-gray-700 {$page.url.pathname === '/dashboard' ? 'bg-yellow-700' : ''}"
                                   on:click={() => sidebarOpen = false}>
                                    Dashboard
                                </a>
                            </li>
                        {/if}
                    {/key}
                </ul>
            </nav>
        </div>
    </aside>

    <main class="main-content flex-grow p-5 overflow-y-auto">
        <slot/>
    </main>
</div>

<button class="menu-toggle md:hidden fixed top-2 left-2 z-50 bg-gray-700 border-none text-white text-2xl p-1 cursor-pointer"
        on:click={toggleSidebar}>
    ☰
</button>
<style>
    .dashboard {
        display: flex;
        height: 100vh;
        position: relative;
    }

    .sidebar {
        width: 250px;
        background-color: #2a2a2a;
        height: 100%;
        overflow-y: auto;
        transition: transform 0.3s ease-in-out;
    }

    .sidebar-content {
        padding: 20px;
    }

    .main-content {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .menu-toggle {
        display: none;
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background: #3a3a3a;
        border: none;
        color: white;
        font-size: 24px;
        padding: 5px 10px;
        cursor: pointer;
    }

    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    }

    .username {
        color: #ffffff;
        font-weight: bold;
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

    .dropdown-item:hover .guild-icon,
    .dropdown-toggle:hover .guild-icon {
        content: attr(src);
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

    @media (max-width: 768px) {
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            z-index: 1000;
        }

        .sidebar.open {
            transform: translateX(0);
        }

        .menu-toggle {
            display: block;
        }

        .main-content {
            margin-left: 0;
        }
    }
</style>