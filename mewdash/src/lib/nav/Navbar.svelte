<nav class="py-4 bg-mewd-dark-grey">
    <div class="sm:container flex flex-wrap items-center justify-between mx-auto p-4">
        <a title="mewdeko-banner" class="flex items-center mr-4 py-[0.3rem] w-[150px] justify-start" href="/">
            <img alt="Mewdekos Avatar" class="h-12 mr-3" height="48" width="48"
                 src="https://flowbite.com/docs/images/logo.svg"/>
            <span aria-hidden="true"
                  class="hidden xs:block self-center text-xl font-semibold whitespace-nowrap text-mewd-white">Mewdeko</span>
        </a>
        <div class="flex md:order-2 grow max-w-[150px] justify-end">
            <a class="rounded-md bg-teal-800 p-2 text-white" href="/api/discord/login">Login</a>
            <!--suppress HtmlWrongAttributeValue -->
            <button class="inline-flex items-center ml-4 px-3 py-1 rounded-3xl border border-px border-transparent hover:border-mewd-light-transparent md:hidden"
                    aria-controls="mobile-navbar" aria-expanded="{showMenu?'true':'false'}"
                    on:click={()=>showMenu ^= true}>
                <span class="sr-only">open nav-menu</span>
                <svg class="h-8 stroke-mewd-transparent" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7h22M4 15h22M4 23h22" stroke-linecap="round" stroke-miterlimit="10"
                          stroke-width="2"/>
                </svg>
            </button>
        </div>
        {#if showMenu}
            <div class="md:hidden w-full  flex flex-col p-4 mt-4" transition:slide={{ duration: 300 }}
                 id="mobile-navbar" title="pages nav">
                {#each computedItems as item}
                    <Link item="{item}" current="{current}"/>
                {/each}
            </div>
        {/if}
        <div class="hidden md:flex w-auto flex-row p-4 space-x-4 text-[16px] font-medium border-0"
             id="tablet-navbar" title="pages nav">
            {#each computedItems as item}
                <Link item="{item}" current="{current}"/>
            {/each}
        </div>
    </div>
</nav>
<!--
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
-->

<script lang="ts">
    import {page} from '$app/stores';
    import {slide} from 'svelte/transition';
    import Link from '$lib/nav/NavLink.svelte';
    /*    import type {DiscordUser} from "../types/discord";

        export let user: DiscordUser | null = null;

        function toggleUserMenu() {
            userMenu = !userMenu;
        }

        let userMenu: boolean = false;
    */
    let showMenu: boolean = false;
    $: current = $page.route.id;

    type NavItem = {
        title: string,
        elements: {
            title?: string,
            href: string
        }[]
    }

    type Item = {
        title: string,
        wrapped: boolean,
        href?: string,
        children?: { title: string, href: string }[]
    }

    export let items: NavItem[] = []
    $: computedItems = buildItems(items);

    const buildItems = (items: NavItem[]): Item[] => items.flatMap(item => {
        const elems = item.elements;
        if (elems.length == 1 && !elems[0].title) {
            return [{title: item.title, wrapped: false, href: elems[0].href}]
        }
        return [{title: item.title, wrapped: true, children: elems}]
    });
</script>