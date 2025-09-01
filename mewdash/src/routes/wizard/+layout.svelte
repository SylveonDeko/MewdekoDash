<!--
@component
Wizard layout - minimal layout for focused setup experience
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { userStore } from "$lib/stores/userStore";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  // Ensure user is authenticated for wizard
  onMount(() => {
    if (browser && !$userStore && !data?.user) {
      // Redirect to login if not authenticated
      goto('/api/discord/login');
    }
  });

  // Sync user data
  $: if (browser && data?.user && (!$userStore || $userStore.id !== data.user.id)) {
    userStore.set(data.user);
  }
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
          style="border-color: {$colorStore.primary}30; background: {$colorStore.background}95; backdrop-filter: blur(10px);">
    <div class="flex items-center justify-center max-w-6xl mx-auto">
      <div class="flex items-center gap-2 sm:gap-3">
        <img src="/img/Mewdeko.png" alt="Mewdeko" class="h-8 w-8 sm:h-10 sm:w-10" />
        <div>
          <h1 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text};">Setup Wizard</h1>
          <p class="text-xs sm:text-sm hidden sm:block" style="color: {$colorStore.muted};">Get your server configured in minutes</p>
        </div>
      </div>
    </div>
  </header>

  <!-- Wizard content area -->
  <main class="flex-1 w-full pb-6 md:pb-0">
    <slot />
  </main>
</div>