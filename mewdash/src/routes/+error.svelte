<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import { fly } from "svelte/transition";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let showDetails = $state(false);
  let buttonMousePositions = $state<{ [key: string]: { x: number, y: number } }>({});

  // Log error details for debugging
  $effect(() => {
    if (browser && page.error) {
      console.error("Page error:", page.error);
    }
  });

  // Get error icon based on status
  function getErrorIcon(status: number) {
    if (status === 401) return "fa-lock";
    if (status === 403) return "fa-ban";
    if (status === 404) return "fa-magnifying-glass";
    if (status >= 500) return "fa-server";
    return "fa-triangle-exclamation";
  }

  function handleButtonMouseMove(e: MouseEvent, buttonId: string) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    buttonMousePositions[buttonId] = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleButtonMouseLeave(buttonId: string) {
    delete buttonMousePositions[buttonId];
  }

  let errorIcon = $derived(getErrorIcon(page.status));
</script>

<svelte:head>
  <title>Error {page.status} - Mewdeko</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style="background: radial-gradient(circle at top,
        {$colorStore.gradientStart}15 0%,
        {$colorStore.gradientEnd}10 50%,
        {$colorStore.gradientEnd}05 100%
      );">

  <!-- Floating background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 animate-float-slow"
         style="background: radial-gradient(circle, {$colorStore.primary}40, transparent);"></div>
    <div class="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 animate-float-slower"
         style="background: radial-gradient(circle, {$colorStore.secondary}40, transparent);"></div>
  </div>

  <div class="text-center max-w-2xl mx-auto relative z-10" in:fly={{ y: 20, duration: 500 }}>
    <!-- Error icon -->
    <div class="mb-8">
      <div class="inline-block p-8 rounded-2xl mb-6"
           style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10);
                  border: 1px solid {$colorStore.primary}30;">
        <i class="fa-utility-duo fa-regular {errorIcon}"
           style="--fa-primary-color: {$colorStore.primary};
                  --fa-secondary-color: {$colorStore.secondary};
                  font-size: 72px;"></i>
      </div>

      <h1 class="text-5xl sm:text-6xl font-extrabold mb-4" style="color: {$colorStore.text}">
        Error {page.status}
      </h1>
      <p class="text-xl sm:text-2xl mb-2" style="color: {$colorStore.muted}">
        {page.error?.message || 'Something went wrong'}
      </p>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8 px-4">
      {#if page.status === 401}
        <a
          href="/api/discord/login?redirect_to={encodeURIComponent(page.url.pathname)}"
          class="group relative px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
          style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10);
                 border: 1px solid {$colorStore.primary}30;
                 box-shadow: 0 4px 20px {$colorStore.primary}10;"
          onmousemove={(e) => handleButtonMouseMove(e, 'login')}
          onmouseleave={() => handleButtonMouseLeave('login')}
        >
          {#if buttonMousePositions['login']}
            <div
              class="pointer-events-none absolute w-32 h-32 rounded-full opacity-30 transition-all duration-100 ease-out"
              style="background: radial-gradient(circle at center, {$colorStore.primary}60, transparent 70%);
                        left: {buttonMousePositions['login'].x}px;
                        top: {buttonMousePositions['login'].y}px;
                        transform: translate(-50%, -50%);
                        filter: blur(20px);"></div>
          {/if}
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}15);"></div>
          <i class="fa-brands fa-discord text-xl relative z-10" style="color: {$colorStore.text}"></i>
          <span class="relative z-10" style="color: {$colorStore.text}">Login with Discord</span>
        </a>
      {:else}
        <a
          href="/"
          class="group relative px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
          style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10);
                 border: 1px solid {$colorStore.primary}30;
                 box-shadow: 0 4px 20px {$colorStore.primary}10;"
          onmousemove={(e) => handleButtonMouseMove(e, 'home')}
          onmouseleave={() => handleButtonMouseLeave('home')}
        >
          {#if buttonMousePositions['home']}
            <div
              class="pointer-events-none absolute w-32 h-32 rounded-full opacity-30 transition-all duration-100 ease-out"
              style="background: radial-gradient(circle at center, {$colorStore.primary}60, transparent 70%);
                        left: {buttonMousePositions['home'].x}px;
                        top: {buttonMousePositions['home'].y}px;
                        transform: translate(-50%, -50%);
                        filter: blur(20px);"></div>
          {/if}
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}15);"></div>
          <i class="fa-utility-duo fa-regular fa-house text-xl relative z-10"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          <span class="relative z-10" style="color: {$colorStore.text}">Return Home</span>
        </a>

        <button
          onclick={() => window.location.reload()}
          class="group relative px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
          style="background: {$colorStore.secondary}08;
                 border: 1px solid {$colorStore.secondary}20;
                 box-shadow: 0 2px 12px {$colorStore.secondary}05;"
          onmousemove={(e) => handleButtonMouseMove(e, 'retry')}
          onmouseleave={() => handleButtonMouseLeave('retry')}
        >
          {#if buttonMousePositions['retry']}
            <div
              class="pointer-events-none absolute w-24 h-24 rounded-full opacity-25 transition-all duration-100 ease-out"
              style="background: radial-gradient(circle at center, {$colorStore.secondary}50, transparent 70%);
                        left: {buttonMousePositions['retry'].x}px;
                        top: {buttonMousePositions['retry'].y}px;
                        transform: translate(-50%, -50%);
                        filter: blur(15px);"></div>
          {/if}
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               style="background: {$colorStore.secondary}12;"></div>
          <i class="fa-solid fa-rotate-right relative z-10" style="color: {$colorStore.text}"></i>
          <span class="relative z-10" style="color: {$colorStore.text}">Retry</span>
        </button>
      {/if}
    </div>

    <!-- Error details -->
    {#if browser && page.error}
      <div class="mt-8">
        <button
          onclick={() => showDetails = !showDetails}
          class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}08;
                 color: {$colorStore.muted};
                 border: 1px solid {$colorStore.primary}20;"
        >
          <i class="fa-solid fa-{showDetails ? 'chevron-up' : 'chevron-down'} mr-2"></i>
          {showDetails ? 'Hide' : 'Show'} Error Details
        </button>

        {#if showDetails}
          <div class="mt-4 p-6 rounded-xl text-left"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}10);
                      border: 1px solid {$colorStore.primary}20;"
               in:fly={{ y: -10, duration: 300 }}>
            <pre class="text-xs whitespace-pre-wrap break-words overflow-x-auto"
                 style="color: {$colorStore.muted};">{JSON.stringify(page.error, null, 2)}</pre>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Footer message -->
    <p class="mt-12 text-sm" style="color: {$colorStore.muted}">
      Need help? Join our <a class="hover:underline font-semibold" href="https://discord.gg/twQw45rBjN"
                             style="color: {$colorStore.primary}">Discord community</a>
    </p>
  </div>
</main>

<style>
    .animate-float-slow {
        animation: float 25s ease-in-out infinite;
    }

    .animate-float-slower {
        animation: float 30s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
        }
        25% {
            transform: translate(-20px, -20px);
        }
        50% {
            transform: translate(20px, -10px);
        }
        75% {
            transform: translate(-10px, 20px);
        }
    }
</style>