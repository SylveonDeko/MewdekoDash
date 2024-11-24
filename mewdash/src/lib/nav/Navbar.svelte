<!-- lib/nav/Navbar.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { slide } from "svelte/transition";
  import Link from "$lib/nav/NavLink.svelte";
  import type { DiscordUser } from "../types/discord";
  import { userAdminGuilds } from "../stores/adminGuildsStore";
  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import {currentUser} from "$lib/stores/currentUserStore.ts";

  let menuOpen = false;
  let menuButtonRef: HTMLButtonElement;
  let mobileMenuButtonRef: HTMLButtonElement;
  let menuRef: HTMLDivElement;

  function handleMenuOpen() {
    menuOpen = true;
    setTimeout(() => menuRef?.focus(), 0);
    document.addEventListener("click", handleMenuClose);
  }

  function handleMenuClose(event: MouseEvent) {
    if (
      !menuButtonRef.contains(event.target as Node) &&
      !menuRef?.contains(event.target as Node)
    ) {
      menuOpen = false;
      document.removeEventListener("click", handleMenuClose);
    }
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      menuOpen = false;
      menuButtonRef.focus();
    }
  }

  function toggleMobileMenu() {
    showMenu = !showMenu;
  }

  export let user: DiscordUser | null = null;
  let adminGuilds: DiscordGuild[];

  userAdminGuilds.subscribe((value) => {
    adminGuilds = value;
  });

  function toggleUserMenu() {
    userMenu = !userMenu;
  }

  let userMenu: boolean = false;
  let showMenu: boolean = false;
  $: current = $page.route.id;

  type NavItem = {
    title: string;
    elements: {
      title?: string;
      href: string;
    }[];
  };

  type Item = {
    title: string;
    wrapped: boolean;
    href?: string;
    children?: { title: string; href: string }[];
  };

  export let items: NavItem[] = [];
  $: computedItems = buildItems(items);

  const buildItems = (items: NavItem[]): Item[] =>
    items.flatMap((item) => {
      const elems = item.elements;
      if (elems.length == 1 && !elems[0].title) {
        return [{ title: item.title, wrapped: false, href: elems[0].href }];
      }
      return [{ title: item.title, wrapped: true, children: elems }];
    });

  function findTitleByHref(href: string) {
    for (const item of items) {
      for (const element of item.elements) {
        if (element.href === href) {
          return item.title;
        }
      }
    }
    return "";
  }

  let titles = [
    "Come back!",
    "We miss you!",
    "Still here for you!",
    "Still Free!",
    "Never gonna let you down...",
    "Never gonna run around...",
    "Never gonna desert you...",
    "Never gonna make you cry...",
    "Never gonna say goodbye...",
    "Never gonna tell a lie...",
    "Your heart's been aching...",
    "We know the game...",
    "Never gonna give you up...",
    "Nya.",
  ];

  let titleIndex = 0;
  let originalTitle: string;
  let handleVisibilityChange: () => void;

  onMount(() => {
    if (typeof window !== "undefined") {
      // Check if window is defined
      originalTitle = document.title;

      handleVisibilityChange = function () {
        if (document.visibilityState === "hidden") {
          document.title = titles[titleIndex];
          titleIndex = (titleIndex + 1) % titles.length; // Cycle through the titles
        } else {
          document.title = originalTitle;
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      // Check if window is defined
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  });
</script>

<head>
  <title>Mewdeko - {findTitleByHref(current)}</title>
</head>
<nav class="py-4 bg-mewd-dark-grey" aria-label="Main navigation">
  <div
    class="sm:container flex flex-wrap items-center justify-between mx-auto px-4"
  >
    <a
      title="mewdeko-banner"
      class="flex items-center mr-4 py-[0.3rem] grow max-w-[150px] justify-start"
      href="/"
    >
      <img
        alt="Mewdeko's Avatar"
        class="h-12 mr-3"
        height="48"
        width="48"
        src="https://cdn.mewdeko.tech/Mewdeko.png"
      />
      <span
        class="hidden xs:block self-center text-xl font-semibold whitespace-nowrap text-mewd-white"
        >Mewdeko</span
      >
    </a>
    <div class="flex md:order-2 grow max-w-[150px] justify-end">
      {#if !user}
        <a
          class="rounded-md bg-teal-800 p-2 text-white"
          href="/api/discord/login">Login</a
        >
      {:else}
        <div class="flex flex-col relative">
          <button
            class="h-full"
            on:click|stopPropagation={handleMenuOpen}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            bind:this={menuButtonRef}
          >
            {#if $currentUser && $currentUser.avatar && $currentUser.avatar.startsWith("a_")}
              <img
                src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.gif"
                alt={$currentUser.username}
                class="rounded-full bg-gray-600 h-12"
                height="48"
                width="48"
              />
            {:else if $currentUser && $currentUser.avatar}
              <img
                src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png"
                alt={$currentUser.username}
                class="rounded-full bg-gray-600 h-12"
                height="48"
                width="48"
              />
            {/if}
          </button>
          {#if menuOpen}
            <div
              bind:this={menuRef}
              tabindex="-1"
              on:keydown={handleMenuKeydown}
              class="w-auto mt-4 bg-gray-900 rounded-md p-2 flex flex-col space-y-3 items-center absolute z-50 left-1/2 transform -translate-x-1/2 shadow-lg top-full"
              role="menu"
              aria-labelledby="user-menu-button"
            >
              <div class="flex flex-row space-x-2">
                <h2 class="font-bold text-md text-white">{$currentUser.username}</h2>
                {#if $currentUser.discriminator !== "0"}
                  <span class="font-bold text-md text-white"
                    >#{$currentUser.discriminator}</span
                  >
                {/if}
              </div>
              <div class="text-white text-md">
                Manageable Guilds: {adminGuilds.length}
              </div>
              <a
                class="w-max px-3 py-1 rounded-full bg-gray-700 text-md font-black text-white mx-auto"
                href="/api/discord/logout"
                role="menuitem"
              >
                Logout
              </a>
            </div>
          {/if}
        </div>
      {/if}
      <button
        class="inline-flex items-center ml-4 px-3 py-1 rounded-3xl border border-px border-transparent hover:border-mewd-light-transparent md:hidden"
        aria-controls="mobile-navbar"
        aria-expanded={showMenu}
        on:click={toggleMobileMenu}
        bind:this={mobileMenuButtonRef}
      >
        <span class="sr-only">Toggle navigation menu</span>
        <svg
          class="h-8 stroke-mewd-transparent"
          viewBox="0 0 30 30"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 7h22M4 15h22M4 23h22"
            stroke-linecap="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
        </svg>
      </button>
    </div>
    {#if showMenu}
      <nav
        class="md:hidden w-full flex flex-col p-4 mt-4"
        transition:slide={{ duration: 300 }}
        id="mobile-navbar"
        aria-label="Mobile navigation"
      >
        {#each computedItems as item}
          <Link {item} {current} />
        {/each}
      </nav>
    {/if}
    <div
      class="hidden md:flex w-auto flex-row p-4 space-x-4 text-[16px] font-medium border-0"
      id="tablet-navbar"
      role="navigation"
      aria-label="Desktop navigation"
    >
      {#each computedItems as item}
        <Link {item} {current} />
      {/each}
    </div>
  </div>
</nav>
