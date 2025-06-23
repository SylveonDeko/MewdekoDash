<!-- routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";
  import UnifiedNav from "$lib/components/UnifiedNav.svelte";
  import ErrorBoundary from "$lib/components/ErrorBoundary.svelte";
  import type { LayoutData } from "../../.svelte-kit/types/src/routes/$types";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto, invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { userStore } from "$lib/stores/userStore.ts";


  export let data: LayoutData;

  onMount(async () => {
    if (browser) {
      // Set user from server data if available
      if (data?.user) {
        userStore.set(data.user);
      }
      
      if (window.location.toString().includes("?loggedin")) {
        await invalidateAll();
        await goto("/");
      }

      // Only extract colors for non-dashboard pages
      // Dashboard pages handle their own theming
      if (!window.location.toString().includes("dashboard")) {
        try {
          if (data?.user?.avatar) {
            // Extract colors from user avatar
            await colorStore.extractFromImage(
              data.user.avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`
            );
          } else {
            // Fallback to default image
            await colorStore.extractFromImage("/img/Mewdeko.png");
          }
        } catch (err) {
          logger.error("Failed to extract colors:", err);
          colorStore.reset(); // Reset to default colors
        }
      }
    }
  });

  // Main navigation items
  const navItems = [
    { title: "Home", elements: [{ href: "/" }] },
    { title: "Dashboard", elements: [{ href: "/dashboard" }] },
    { title: "Commands", elements: [{ href: "/commands" }] },
    {
      title: "About",
      elements: [
        { href: "/partners", title: "Partners" },
        { href: "/contacts", title: "Contact Us" },
        { href: "/staff", title: "Staff" }
      ]
    },
    {
      title: "Misc",
      elements: [
        { href: "/placeholders", title: "Placeholders" },
        { href: "/credguide", title: "Credentials Guide" },
        { title: "Privacy", href: "/privacy" },
        { title: "Terms", href: "/terms" }
      ]
    },
    { title: "Reviews", elements: [{ href: "/reviews" }] }
  ];

  // Keep user store in sync with server data
  $: if (browser && data?.user && (!$userStore || $userStore.id !== data.user.id)) {
    console.log("Setting user store from server data:", data.user);
    userStore.set(data.user);
  }

  // Clear user store if server says no user
  $: if (browser && !data?.user && $userStore) {
    console.log("Clearing user store - no server user");
    userStore.set(null);
  }

  // Debug logging
  $: if (browser) {
    console.log("Layout reactive - server user:", data?.user ? "exists" : "null", "store user:", $userStore ? "exists" : "null");
  }

  // Only extract colors for non-dashboard pages
  $: if (browser && !window.location.pathname.startsWith("/dashboard")) {
    if (data?.user?.avatar) {
      try {
        // Extract colors from user avatar
        colorStore.extractFromImage(
          data.user.avatar.startsWith("a_")
            ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
            : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`
        );
      } catch (err) {
        logger.error("Failed to extract colors:", err);
        colorStore.extractFromImage("/img/Mewdeko.png");
      }
    } else {
      colorStore.extractFromImage("/img/Mewdeko.png");
    }
  }
</script>

<svelte:head>
  <meta content="#938018" name="theme-color" />
  <meta content="website" property="og:type" />
  <meta
    content="Mewdeko - The most customizable discord bot."
    name="twitter:title"
  />
  <meta content="summary_large_image" name="twitter:card" />
  <meta
    content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.webp"
    name="twitter:image"
  />
  <meta
    content="Mewdeko, Mewdeko Bot, Mewdeko Discord Bot, Mewdeko Discord, Mewdeko D, free discord bot, free bot, anime themed discord bot, mewdeko.tech, mewdeko website, mewdeko dashboard, mewdeko commands, mewdeko donate, mewdeko paypal, mewdeko discord, mewdeko help"
    name="keywords"
  />
  <meta
    content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.webp"
    property="og:image"
  />
</svelte:head>

<UnifiedNav data={data} items={navItems} />

<ErrorBoundary fallback="The page encountered an unexpected error. Please try refreshing." showDetails={true}>
  <main class="bg-mewd-dark-grey w-full">
    <slot />
  </main>
</ErrorBoundary>