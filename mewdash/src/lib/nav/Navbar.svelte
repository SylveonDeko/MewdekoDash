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
        <div class="{!showMenu ?  'hidden' : ''} w-full md:block md:w-auto" id="navbar-default">
            <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                {#each items as item}
                    <Link href="{item.href}" title="{item.title}" current="{isCurrentPage(item.href)}"/>
                {/each}
            </ul>
        </div>
    </div>
</nav>

<script lang="ts">
    import Link from '$lib/nav/NavLink.svelte'
    import {page} from '$app/stores';

    function isCurrentPage(href: string) {
        return $page.url.pathname.trim() === href.trim();
    }

    let showMenu: boolean = false;

    function toggleNavbar() {
        showMenu ^= true;
    }

    export let items: { title: string, href: string }[] = []
</script>