<nav class="py-4 bg-mewd-dark-grey">
    <div class="container flex flex-wrap items-center justify-between mx-auto px-6">
        <a title="mewdeko-banner" class="flex items-center mr-4 py-[0.3rem]" href="/">
            <img alt="Mewdekos Avatar" class="h-12 mr-3" height="48" width="48"
                 src="https://cdn.mewdeko.tech/Mewdeko.png"/>
            <span aria-hidden="true"
                  class="self-center text-xl font-semibold whitespace-nowrap text-mewd-white">Mewdeko</span>
        </a>
        <!--suppress HtmlWrongAttributeValue -->
        <button class="inline-flex items-center px-3 py-1 rounded-3xl border border-px border-transparent hover:border-mewd-light-transparent md:hidden"
                aria-controls="mobile-navbar" aria-expanded="{showMenu?'true':'false'}" on:click={()=>showMenu ^= true}>
            <span class="sr-only">open nav-menu</span>
            <svg class="h-8 stroke-mewd-transparent" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h22M4 15h22M4 23h22" stroke-linecap="round" stroke-miterlimit="10"
                      stroke-width="2"/>
            </svg>
        </button>
        {#if showMenu}
            <div class="md:hidden w-full  flex flex-col p-4 mt-4" transition:slide={{ duration: 300 }}
                 id="mobile-navbar" title="pages nav">
                {#each items as item}
                    <Link href="{item.href}" title="{item.title}"
                          current="{route === item.href}"/>
                {/each}
            </div>
        {/if}
        <div class="hidden md:flex w-auto flex-row p-4 space-x-8 text-[16px] font-medium border-0"
             id="desktop-navbar" title="pages nav">
            {#each items as item}
                <Link href="{item.href}" title="{item.title}" current="{route === item.href}"/>
            {/each}
            {#if !user}
                <a class=" rounded-md bg-teal-800 p-2 text-white" href="/api/discord/login">Login</a>
            {:else}
                <div class="flex flex-col h-full">
                    <button class="h-full self-end " on:click={toggleUserMenu}>
                        <img src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png"
                             alt={user.username}
                             class="h-full p-1 rounded-full bg-gray-600"/>
                    </button>
                    {#if userMenu}
                        <div class="relative right-0 w-min bg-gray-900 rounded-b-md p-2 flex flex-col space-y-3">
                            <div class="flex flex-row space-x-2">
                                <h1 class="font-bold text-xl text-white">{user.username}</h1>
                                <h2 class="text-lg text-gray-300">#{user.discriminator}</h2>
                            </div>
                            <a class="w-max px-3 py-1 rounded-full bg-gray-700 text-lg font-black text-white"
                               href="/api/discord/logout">Logout</a>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</nav>


<script lang="ts">
    import Link from '$lib/nav/NavLink.svelte'
    import {page} from '$app/stores';
    import {slide} from 'svelte/transition';
    import type {DiscordUser} from "../types/discord";

    export let user: DiscordUser | null = null;
    function toggleUserMenu() {
        userMenu = !userMenu;
    }
    let userMenu: boolean = false;

    $: route = $page.route.id;
    let showMenu: boolean = false;

    export let items: { title: string, href: string }[] = []
</script>