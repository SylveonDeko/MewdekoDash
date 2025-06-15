<!-- routes/giveaways/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { api } from "$lib/api.ts";
  import type { PageData } from "../../../.svelte-kit/types/src/routes/dashboard/suggestions/$types";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import type { Giveaways } from "$lib/types.ts";
  import { Turnstile } from "svelte-turnstile";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, fly } from "svelte/transition";

  let guildId: bigint;
  let giveawayId: number;
  let userId: bigint;
  let turnstileToken: string;
  let message: string = "";
  let isSubmitting = false;
  let mounted = false;
  export let data: PageData;

  let giveaway: Giveaways | null = null;
  let loading = true;
  let error: string | null = null;

  // Enhanced error handling
  type ErrorType = "network" | "auth" | "validation" | "server" | "unknown";

  function getErrorType(err: unknown): ErrorType {
    if (typeof err === "object" && err !== null && "message" in err) {
      const message = (err as { message: string }).message.toLowerCase();
      if (message.includes("network") || message.includes("connection")) return "network";
      if (message.includes("unauthorized") || message.includes("auth")) return "auth";
      if (message.includes("validation") || message.includes("invalid")) return "validation";
      if (message.includes("server") || message.includes("internal")) return "server";
    }
    return "unknown";
  }

  function getErrorMessage(err: unknown, context: string): string {
    const errorType = getErrorType(err);
    const baseMessage = typeof err === "object" && err !== null && "message" in err
      ? (err as { message: string }).message
      : "An unexpected error occurred";

    switch (errorType) {
      case "network":
        return `Network error: Unable to ${context}. Please check your connection and try again.`;
      case "auth":
        return `Authentication error: Please log in again to ${context}.`;
      case "validation":
        return `Invalid data: ${baseMessage}`;
      case "server":
        return `Server error: ${context} failed. Please try again later.`;
      default:
        return `Failed to ${context}: ${baseMessage}`;
    }
  }

  onMount(async () => {
    mounted = true;
    
    if (!data.user) {
      goto("/api/discord/login");
      return;
    }

    guildId = BigInt($page.url.searchParams.get("guildId") || "0");
    giveawayId = Number($page.url.searchParams.get("giveawayId") || "0");
    userId = data.user.id;

    // Validation
    if (!guildId || guildId === 0n) {
      error = "Invalid guild ID provided";
      loading = false;
      return;
    }

    if (!giveawayId || giveawayId === 0) {
      error = "Invalid giveaway ID provided";
      loading = false;
      return;
    }

    if (browser) {
      try {
        giveaway = await api.getGiveaway(giveawayId.toString());
        loading = false;
      } catch (err) {
        error = getErrorMessage(err, "load giveaway details");
        loading = false;
      }
    }
  });

  async function enterGiveaway() {
    if (!turnstileToken) {
      message = "Please complete the captcha verification";
      return;
    }

    if (isSubmitting) return;

    isSubmitting = true;
    message = "";

    try {
      await api.enterGiveaway({
        guildId,
        giveawayId,
        userId,
        turnstileToken,
      });
      message = "🎉 Successfully entered the giveaway! Good luck!";
    } catch (err) {
      message = getErrorMessage(err, "enter giveaway");
    } finally {
      isSubmitting = false;
    }
  }

  function onTurnstileSuccess(event: CustomEvent<{ token: string }>) {
    turnstileToken = event.detail.token;
  }

  function formatDate(date: string) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    };
    return new Date(date).toLocaleString(undefined, options);
  }

  function getTimeRemaining(endDate: string) {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  $: timeRemaining = giveaway ? getTimeRemaining(giveaway.when) : "";
  $: isGiveawayActive = giveaway ? new Date(giveaway.when).getTime() > Date.now() : false;
</script>

<svelte:head>
  <title>Enter Giveaway - Mewdeko</title>
  <meta content="Enter Mewdeko Discord bot giveaway" name="description" />
  <meta content="Enter Mewdeko Discord bot giveaway" property="og:description" />
  <meta content="Enter Mewdeko Discord bot giveaway" name="twitter:description" />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
    in:fade
  >
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-8" in:fade={{ duration: 300 }}>
        <h1 class="text-3xl lg:text-4xl font-bold mb-4" style="color: {$colorStore.text};">
          🎉 Giveaway Entry
        </h1>
        <p class="text-lg" style="color: {$colorStore.muted};">
          Join the excitement and win amazing prizes!
        </p>
      </div>

      {#if loading}
        <div class="text-center py-16" in:fade={{ duration: 300 }}>
          <div class="mb-6">
            <svg
              class="animate-spin h-16 w-16 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style="color: {$colorStore.primary}"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p class="text-xl" style="color: {$colorStore.text};">Loading giveaway details...</p>
        </div>
      {:else if error}
        <div class="rounded-2xl p-8 text-center backdrop-blur-sm border"
             style="background: linear-gradient(135deg, #DC262620, #B9131930); border-color: #DC2626;"
             in:fly={{ y: 20, duration: 300 }}>
          <div class="mb-4">
            <svg class="h-16 w-16 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-4 text-red-400">Oops! Something went wrong</h2>
          <p class="text-lg" style="color: {$colorStore.text};">{error}</p>
          <button
            class="mt-6 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            on:click={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      {:else if giveaway}
        <div class="space-y-8">
          <!-- Giveaway Details Card -->
          <div class="rounded-2xl p-8 backdrop-blur-sm shadow-xl border"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20); border-color: {$colorStore.primary}30;"
               in:fly={{ y: 20, duration: 300 }}>

            <!-- Prize -->
            <div class="text-center mb-8">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}40);">
                🎁
              </div>
              <h2 class="text-3xl font-bold mb-4" style="color: {$colorStore.text};">
                {giveaway.item}
              </h2>

              <!-- Status Badge -->
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                   style="background: {isGiveawayActive ? '#10B98120' : '#EF444420'}; border: 1px solid {isGiveawayActive ? '#10B981' : '#EF4444'};">
                <div
                  class="w-2 h-2 rounded-full {isGiveawayActive ? 'bg-green-400' : 'bg-red-400'} animate-pulse"></div>
                <span class="font-medium" style="color: {isGiveawayActive ? '#10B981' : '#EF4444'};">
                  {isGiveawayActive ? 'Active' : 'Ended'}
                </span>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="text-center p-4 rounded-xl backdrop-blur-sm" style="background: {$colorStore.primary}08;">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                     style="background: {$colorStore.primary}20;">
                  <span class="text-2xl">👥</span>
                </div>
                <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Winners</h3>
                <p class="text-2xl font-bold" style="color: {$colorStore.primary};">{giveaway.winners}</p>
              </div>

              <div class="text-center p-4 rounded-xl backdrop-blur-sm" style="background: {$colorStore.primary}08;">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                     style="background: {$colorStore.primary}20;">
                  <span class="text-2xl">⏰</span>
                </div>
                <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Time Remaining</h3>
                <p class="text-xl font-bold" style="color: {isGiveawayActive ? $colorStore.primary : '#EF4444'};">
                  {timeRemaining}
                </p>
              </div>

              <div class="text-center p-4 rounded-xl backdrop-blur-sm" style="background: {$colorStore.primary}08;">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                     style="background: {$colorStore.primary}20;">
                  <span class="text-2xl">📅</span>
                </div>
                <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Ends On</h3>
                <p class="text-sm font-medium" style="color: {$colorStore.muted};">
                  {formatDate(giveaway.when)}
                </p>
              </div>
            </div>
          </div>

          {#if isGiveawayActive}
            <!-- Entry Section -->
            <div class="rounded-2xl p-8 backdrop-blur-sm shadow-xl border"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;"
                 in:fly={{ y: 20, duration: 300, delay: 100 }}>

              <div class="text-center mb-8">
                <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
                  Ready to Enter?
                </h3>
                <p class="text-lg" style="color: {$colorStore.muted};">
                  Complete the verification below to secure your entry
                </p>
              </div>

              <!-- Captcha -->
              <div class="flex justify-center mb-8">
                <div class="p-4 rounded-xl backdrop-blur-sm"
                     style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
                  <Turnstile
                    siteKey="0x4AAAAAAAAvvAPaJgbIJWh-"
                    on:callback={onTurnstileSuccess}
                  />
                </div>
              </div>

              <!-- Entry Button -->
              <div class="text-center">
                <button
                  on:click={enterGiveaway}
                  disabled={!turnstileToken || !isGiveawayActive || isSubmitting}
                  class="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[200px]"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}90); color: white; border: 1px solid {$colorStore.primary}50; box-shadow: 0 4px 20px {$colorStore.primary}30;"
                >
                  {#if isSubmitting}
                    <div class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                           viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entering...
                    </div>
                  {:else}
                    🎯 Enter Giveaway
                  {/if}
                </button>
              </div>

              <!-- Helper Text -->
              {#if !turnstileToken}
                <p class="text-center mt-4 text-sm" style="color: {$colorStore.muted};">
                  Please complete the captcha verification above
                </p>
              {/if}
            </div>
          {:else}
            <!-- Giveaway Ended -->
            <div class="rounded-2xl p-8 text-center backdrop-blur-sm border"
                 style="background: linear-gradient(135deg, #6B728020, #4B556330); border-color: #6B7280;"
                 in:fly={{ y: 20, duration: 300, delay: 100 }}>
              <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style="background: #6B728020;">
                <span class="text-3xl">⏰</span>
              </div>
              <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
                Giveaway Has Ended
              </h3>
              <p class="text-lg" style="color: {$colorStore.muted};">
                This giveaway ended on {formatDate(giveaway.when)}
              </p>
            </div>
          {/if}

          <!-- Message Display -->
          {#if message}
            <div class="rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300"
                 style="background: {message.includes('🎉') || message.includes('Successfully') 
                   ? 'linear-gradient(135deg, #10B98120, #059669t30)' 
                   : 'linear-gradient(135deg, #DC262620, #B9131930)'}; 
                 border-color: {message.includes('🎉') || message.includes('Successfully') ? '#10B981' : '#DC2626'};"
                 in:fly={{ y: 20, duration: 300 }}>
              <div class="flex items-center justify-center gap-3">
                <span class="text-2xl">
                  {message.includes('🎉') || message.includes('Successfully') ? '✅' : '❌'}
                </span>
                <p class="text-lg font-medium text-center"
                   style="color: {message.includes('🎉') || message.includes('Successfully') ? '#10B981' : '#DC2626'};">
                  {message}
                </p>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="rounded-2xl p-8 text-center backdrop-blur-sm border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;"
             in:fly={{ y: 20, duration: 300 }}>
          <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style="background: {$colorStore.primary}20;">
            <span class="text-3xl">🎁</span>
          </div>
          <h2 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
            No Giveaway Found
          </h2>
          <p class="text-lg" style="color: {$colorStore.muted};">
            The giveaway you're looking for doesn't exist or has been removed.
          </p>
        </div>
      {/if}
    </div>
  </main>
{/if}

<style>
    /* Custom styling for giveaway page */
    :global(.animate-pulse) {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
        .backdrop-blur-sm {
            border-width: 2px;
        }
    }
</style>
