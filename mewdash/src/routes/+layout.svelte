<!-- routes/+layout.svelte -->
<script lang="ts">
    import {run} from 'svelte/legacy';

    import "../app.css";
    import UnifiedNav from "$lib/components/layout/UnifiedNav.svelte";
    import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
    import type {LayoutData} from "../../.svelte-kit/types/src/routes/$types";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    import {colorStore} from "$lib/stores/colorStore.ts";
    import {userStore} from "$lib/stores/userStore.ts";
    import {initAuthRefresh} from "$lib/authRefresh";


    interface Props {
        data: LayoutData;
        children?: import('svelte').Snippet;
    }

    let {data, children}: Props = $props();

  async function extractColors(user: any) {
      if (!browser) {
          return;
      }

      // Skip color extraction on dashboard pages as they use server icons
      if (window.location.pathname.startsWith("/dashboard")) {
      return;
    }

    try {
      if (user?.avatar) {
          const avatarUrl = user.avatar.startsWith("a_")
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`
              : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

          await colorStore.extractFromImage(avatarUrl);
      } else if (!user) {
          // Only fallback to default image if there's no user at all
        await colorStore.extractFromImage("/img/Mewdeko.png");
      }
    } catch (err) {
      colorStore.reset(); // Reset to default colors
    }
  }

  onMount(async () => {
    if (browser) {
      // Initialize auth refresh system
      initAuthRefresh();

        // Initial color extraction is handled by the reactive statement
        // to avoid duplicate extraction
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

    // Keep user store in sync with server data and handle color extraction
    let lastExtractedUserId: string | null = null;
    let colorExtractionPromise: Promise<void> | null = null;

    run(() => {
        if (!browser) return;

        // Update user store if needed
        if (data?.user) {
            if (!$userStore || $userStore.id !== data.user.id) {
                userStore.set(data.user);
            }

            // Only extract colors if user changed and we're not on dashboard
            if (data.user.id !== lastExtractedUserId && !window.location.pathname.startsWith("/dashboard")) {
                lastExtractedUserId = data.user.id;

                // Extract colors and track the promise to avoid duplicates
                colorExtractionPromise = extractColors(data.user);
                colorExtractionPromise.finally(() => {
                    colorExtractionPromise = null;
                });
            }
        } else if ($userStore) {
            // Clear user store if server says no user
            userStore.set(null);
            lastExtractedUserId = null;

            // Reset to default colors when logged out
            if (!window.location.pathname.startsWith("/dashboard")) {
                colorStore.reset();
            }
        }
    });
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
      {@render children?.()}
  </main>
</ErrorBoundary>