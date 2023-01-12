<nav class="py-4 bg-gray-900">
    <div class="container flex flex-wrap items-center justify-between mx-auto px-3">
        <a class="flex items-center mr-4 py-[0.3rem]" href="/">
            <img alt="Mewdeko Avatar" class="h-12 mr-3" src="img/Mewdeko.png"/>
            <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Mewdeko</span>
        </a>
        <!--suppress HtmlWrongAttributeValue -->
        <button aria-controls="mobile-navbar"
                aria-expanded="{showMenu?'true':'false'}"
                on:click={toggleNavbar}
                class="inline-flex items-center px-3 py-1 rounded-3xl border border-px border-md-light-transparent focus:border-transparent md:hidden  focus:outline-none focus:ring-4 focus:ring-gray-200  dark:focus:ring-gray-400" >
            <span class="sr-only">open nav-menu</span>
            <svg class="h-8 stroke-md-transparent" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h22M4 15h22M4 23h22" stroke-linecap="round" stroke-miterlimit="10"
                      stroke-width="2"/>
            </svg>
        </button>
        {#if showMenu}
            <div id="mobile-navbar" class="w-full md:hidden" transition:slide={{ duration: 300 }}>
                <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    {#each items as item}
                        <Link href="{item.href}" title="{item.title}" current="{isCurrentPage(item.href)}"/>
                    {/each}
                </ul>
            </div>
        {/if}
        <div class="hidden md:block w-auto" id="desktop-navbar">
            <ul class="flex flex-row p-4 border border-gray-100 rounded-lg space-x-8 text-sm font-medium border-0 bg-white dark:bg-gray-900 dark:border-gray-700">
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