<!-- routes/+layout.svelte -->
<script lang="ts">


  import "../app.css";
  import UnifiedNav from "$lib/components/layout/UnifiedNav.svelte";
  import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
  import type { LayoutData } from "../../.svelte-kit/types/src/routes/$types";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import { initAuthRefresh } from "$lib/authRefresh";
  import { dyslexicFontStore } from "$lib/stores/accessibilityStore.ts";


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
    if (page.url.pathname.startsWith("/dashboard")) {
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
      dyslexicFontStore.init();

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
  let lastPathname: string = "";
  let wasOnDashboard: boolean = false;

  $effect(() => {
        if (!browser) return;

    const currentPathname = page.url.pathname;
    const isOnDashboard = currentPathname.startsWith("/dashboard");

    // Detect transition from dashboard to non-dashboard
    const transitionedFromDashboard = wasOnDashboard && !isOnDashboard;

    // Update tracking variables
    if (currentPathname !== lastPathname) {
      lastPathname = currentPathname;
      wasOnDashboard = isOnDashboard;
    }

        // Update user store if needed
        if (data?.user) {
            if (!$userStore || $userStore.id !== data.user.id) {
                userStore.set(data.user);
            }

          const shouldExtractColors =
            (!isOnDashboard && data.user.id !== lastExtractedUserId) ||
            (transitionedFromDashboard && data.user);

          if (shouldExtractColors && !colorExtractionPromise) {
                lastExtractedUserId = data.user.id;

                // Extract colors and track the promise to avoid duplicates
                colorExtractionPromise = extractColors(data.user);
                colorExtractionPromise.finally(() => {
                    colorExtractionPromise = null;
                });
            }
        } else if ($userStore) {
          // Clear user store if server says no user (logged out)
            userStore.set(null);
            lastExtractedUserId = null;

          // Extract from Mewdeko.png when logged out (not on dashboard)
          if (!isOnDashboard && !colorExtractionPromise) {
            colorExtractionPromise = extractColors(null);
            colorExtractionPromise.finally(() => {
              colorExtractionPromise = null;
            });
            }
        } else if (!data?.user && !$userStore && !isOnDashboard && !lastExtractedUserId && !colorExtractionPromise) {
          // Handle initial page load when not logged in
          lastExtractedUserId = "default";
          colorExtractionPromise = extractColors(null);
          colorExtractionPromise.finally(() => {
            colorExtractionPromise = null;
          });
        }
    });

    // Sync colorStore to CSS custom properties for Font Awesome Jelly Duo icons
    $effect(() => {
        if (browser && document.documentElement) {
            document.documentElement.style.setProperty('--color-primary', $colorStore.primary);
            document.documentElement.style.setProperty('--color-secondary', $colorStore.secondary);
            document.documentElement.style.setProperty('--color-accent', $colorStore.accent);
            document.documentElement.style.setProperty('--color-text', $colorStore.text);
            document.documentElement.style.setProperty('--color-muted', $colorStore.muted);
        }
    });
</script>

<svelte:head>
  <meta content="#3b82f6" name="theme-color" />
  <meta content="website" property="og:type" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" property="og:image" />
  <meta content="Mewdeko" property="og:site_name" />
  <meta content="summary_large_image" name="twitter:card" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" name="twitter:image" />
  <meta content="@MewdekoBot" name="twitter:site" />
  <meta content="@SylveonDeko" name="twitter:creator" />
  <meta content="SylveonDeko" name="author" />
  <meta content="index, follow" name="robots" />
</svelte:head>

{#if !page.url.pathname.startsWith("/dashboard")}
  <UnifiedNav data={data} items={navItems} />
{:else}
  <div class="lg:hidden">
    <UnifiedNav data={data} items={navItems} />
  </div>
{/if}

<ErrorBoundary fallback="The page encountered an unexpected error. Please try refreshing." showDetails={true}>
  <main class="bg-mewd-dark-grey w-full">
      {@render children?.()}
  </main>
</ErrorBoundary>