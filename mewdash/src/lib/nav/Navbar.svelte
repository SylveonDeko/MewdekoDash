<nav class="py-4 bg-gray-900">
    <div class="container flex flex-wrap items-center justify-between mx-auto px-3">
        <a href="/" class="flex items-center mr-4 py-[0.3rem]">
            <img src="img/Mewdeko.png" class="h-12 mr-3" alt="Mewdeko Avatar"/>
            <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Mewdeko</span>
        </a>
        <button class="inline-flex items-center px-3 py-1 rounded-3xl border border-px border-md-light-transparent focus:border-transparent md:hidden  focus:outline-none focus:ring-4 focus:ring-gray-200  dark:focus:ring-gray-400"
                on:click={toggleNavbar}>
            <span class="sr-only">open nav-menu</span>
            <svg class="h-8 stroke-md-transparent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                <path stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"
                      d="M4 7h22M4 15h22M4 23h22"/>
            </svg>
        </button>
        {#if showMenu}
            <div class="w-full md:hidden" transition:slide={{ duration: 500 }}>
                <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    {#each items as item}
                        <Link href="{item.href}" title="{item.title}" current="{isCurrentPage(item.href)}"/>
                    {/each}
                </ul>
            </div>
        {/if}
        <div class="hidden md:block w-auto" >
            <ul class="flex flex-row p-4 border border-gray-100 rounded-lg space-x-8 text-sm font-medium border-0 bg-white dark:bg-gray-900 dark:border-gray-700">
                {#each items as item}
                    <Link href="{item.href}" title="{item.title}" current="{isCurrentPage(item.href)}"/>
                {/each}
            </ul>
        </div>
    </div>
</nav>

<script lang="ts">
    //{!showMenu ?  'hidden' : ''}
    import Link from '$lib/nav/NavLink.svelte'
    import {page} from '$app/stores';
    import {slide} from 'svelte/transition';

    function isCurrentPage(href: string) {
        return $page.url.pathname.trim() === href.trim();
    }

    let showMenu: boolean = false;

    function toggleNavbar() {
        showMenu ^= true;
    }

    export let items: { title: string, href: string }[] = []
</script>