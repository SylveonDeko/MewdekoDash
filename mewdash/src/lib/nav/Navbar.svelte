<nav class="py-4 bg-mewd-dark-grey">
    <div class="container flex flex-wrap items-center justify-between mx-auto px-6">
        <a class="flex items-center mr-4 py-[0.3rem]" href="/">
            <img alt="Mewdeko Avatar" class="h-12 mr-3" height="48" width="48" src="img/cdn/Mewdeko.png"/>
            <span class="self-center text-xl font-semibold whitespace-nowrap text-mewd-white">Mewdeko</span>
        </a>
        <!--suppress HtmlWrongAttributeValue -->
        <button aria-controls="mobile-navbar"
                aria-expanded="{showMenu?'true':'false'}"
                on:click={toggleNavbar}
                class="inline-flex items-center px-3 py-1 rounded-3xl border border-px border-transparent hover:border-mewd-light-transparent md:hidden" >
            <span class="sr-only">open nav-menu</span>
            <svg class="h-8 stroke-mewd-transparent" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h22M4 15h22M4 23h22" stroke-linecap="round" stroke-miterlimit="10"
                      stroke-width="2"/>
            </svg>
        </button>
        {#if showMenu}
            <div id="mobile-navbar" class="w-full md:hidden" transition:slide={{ duration: 300 }}>
                <ul class="flex flex-col p-4 mt-4">
                    {#each items as item}
                        <Link href="{item.href}" title="{item.title}" current="{isCurrentPage(item.href)}"/>
                    {/each}
                </ul>
            </div>
        {/if}
        <div class="hidden md:block w-auto" id="desktop-navbar">
            <ul class="flex flex-row p-4 space-x-8 text-[16px] font-medium border-0">
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