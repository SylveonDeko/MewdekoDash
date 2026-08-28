<!--
@component
Wizard layout - minimal layout for focused setup experience
-->
<script lang="ts">


  import { colorStore } from "$lib/stores/colorStore";
  import { userStore } from "$lib/stores/userStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { LayoutData } from "./$types";

  interface Props {
        data: LayoutData;
        children?: import('svelte').Snippet;
    }

    let {data, children}: Props = $props();

  // Ensure user is authenticated for wizard
  onMount(() => {
    if (browser && !$userStore && !data?.user) {
      // Redirect to login if not authenticated, preserving the wizard URL
      const currentUrl = page.url.pathname + page.url.search;
      goto(`/api/discord/login?redirect_to=${encodeURIComponent(currentUrl)}`);
    }
  });

  // Sync user data
  $effect(() => {
        if (browser && data?.user && (!$userStore || $userStore.id !== data.user.id)) {
            userStore.set(data.user);
        }
    });

  // Extract colors from guild icon when available
  $effect(() => {
    if ($currentGuild?.icon) {
      const guildIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.png?size=128`;
      colorStore.extractFromServerIcon(guildIconUrl);
    }
  });
</script>

<svelte:head>
  <title>Setup Wizard - Mewdeko Dashboard</title>
  <meta name="description" content="Set up Mewdeko for your Discord server with our guided setup wizard." />
</svelte:head>

<!-- Minimal wizard layout with brand header -->
<div class="min-h-screen w-full overflow-y-auto md:overflow-hidden" style="background: linear-gradient(135deg, 
  {$colorStore?.gradientStart}08, 
  {$colorStore?.gradientMid}12, 
  {$colorStore?.gradientEnd}08
);">
  <!-- Simple header with logo -->
  <header class="py-3 px-4 sm:py-4 sm:px-6 border-b border-opacity-20"
          style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05; backdrop-filter: blur(10px);">
    <div class="flex items-center justify-center max-w-6xl mx-auto">
      <div class="flex items-center gap-2 sm:gap-3">
        <img alt="Mewdeko" class="h-8 w-8 sm:h-10 sm:w-10" src="/img/Mewdeko.png">
        <div>
          <h1 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text};">Setup Wizard</h1>
          <p class="text-xs sm:text-sm hidden sm:block" style="color: {$colorStore.muted};">Get your server configured in minutes</p>
        </div>
      </div>
    </div>
  </header>

  <!-- Wizard content area -->
  <main class="flex-1 w-full pb-6 md:pb-0">
      {@render children?.()}
  </main>
</div>

<style>
    /* Reserve the scrollbar track so steps of differing height don't shift the page sideways */
    :global(html) {
        scrollbar-gutter: stable;
    }
</style>