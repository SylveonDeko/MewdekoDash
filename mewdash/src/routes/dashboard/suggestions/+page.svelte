<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { SuggestionState } from "$lib/types/models";
  import type { SuggestionsModel } from "$lib/types/models";
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore";
  import ColorThief from "colorthief";
  import SuggestionsList from "$lib/dashboard/SuggestionsList.svelte";
  import SuggestionsSettings from "$lib/dashboard/SuggestionsSettings.svelte";
  import StatusChangeModal from "$lib/dashboard/StatusChangeModal.svelte";

  // Tab State
  let activeTab: "suggestions" | "settings" = "suggestions";
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let suggestions: SuggestionsModel[] = [];

  // Modal State
  let showStatusModal = false;
  let selectedSuggestion: SuggestionsModel | null = null;
  let selectedStatus: SuggestionState | null = null;

  // Theme and color management
  let colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#ffffff',
    muted: '#9ca3af',
    gradientStart: '#3b82f6',
    gradientMid: '#8b5cf6',
    gradientEnd: '#ec4899'
  };

  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function handleStatusChange(suggestion: SuggestionsModel, status: SuggestionState) {
    selectedSuggestion = suggestion;
    selectedStatus = status;
    showStatusModal = true;
  }

  async function confirmStatusChange(reason: string) {
    if (!selectedSuggestion || selectedStatus === null || !$currentGuild?.id) return;

    try {
      await api.updateSuggestionStatus($currentGuild.id, selectedSuggestion.suggestionId, {
        state: selectedStatus,
        reason: reason || null,
        userId: BigInt(selectedSuggestion.userId)
      });

      selectedSuggestion.currentState = selectedStatus;
      showNotificationMessage("Suggestion status updated successfully", "success");
      closeStatusModal();
      await fetchSuggestions();
    } catch (error) {
      showNotificationMessage(
        "Failed to update suggestion status: " + (error.message || "Unknown error"),
        "error"
      );
    }
  }

  function closeStatusModal() {
    showStatusModal = false;
    selectedSuggestion = null;
    selectedStatus = null;
  }

  async function extractColors() {
    if (!$currentInstance?.botAvatar) return;
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = $currentInstance.botAvatar;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      const palette = colorThief.getPalette(img);

      const primaryHex = rgbToHex(...dominantColor);
      const secondaryHex = rgbToHex(...palette[1]);
      const accentHex = rgbToHex(...palette[2]);

      colors = {
        primary: primaryHex,
        secondary: secondaryHex,
        accent: accentHex,
        text: adjustLightness(dominantColor, 95),
        muted: adjustLightness(dominantColor, 60),
        gradientStart: primaryHex,
        gradientMid: secondaryHex,
        gradientEnd: accentHex
      };
    } catch (err) {
      console.error('Failed to extract colors:', err);
    }
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function adjustLightness(rgb: number[], lightness: number): string {
    const [r, g, b] = rgb;
    const hsl = rgbToHsl(r, g, b);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
  }

  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  async function fetchSuggestions() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const response = await api.getSuggestions($currentGuild.id);

      // Handle potential 404 or other errors
      if (response?.error || !response) {
        suggestions = [];
        return;
      }

      const suggestionsWithUsers = await Promise.all(
        response.map(async (suggestion) => {
          try {
            const userResponse = await api.getUser(suggestion.guildId, suggestion.userId);
            return { ...suggestion, user: userResponse };
          } catch (error) {
            return {
              ...suggestion,
              user: {
                username: "Unknown User",
                avatarUrl: "/default-avatar.png"
              }
            };
          }
        })
      );

      suggestions = suggestionsWithUsers;
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      if (err.response?.status === 404) {
        suggestions = [];
        return;
      }
      error = err.message || "Failed to fetch suggestions";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([
      fetchSuggestions(),
      extractColors()
    ]);
  });
</script>

<svelte:head>
  <title>Suggestions Management - Dashboard</title>
</svelte:head>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {colors.gradientStart}15 0%,
    {colors.gradientMid}10 50%,
    {colors.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Status Change Modal -->
    {#if showStatusModal && selectedSuggestion && selectedStatus !== null}
      <StatusChangeModal
        {selectedSuggestion}
        status={selectedStatus}
        {colors}
        onConfirm={confirmStatusChange}
        onClose={closeStatusModal}
      />
    {/if}

    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
    >
      <h1 class="text-3xl font-bold" style="color: {colors.text}">Suggestions Management</h1>
      <p class="mt-2" style="color: {colors.muted}">Configure and manage server suggestions</p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-4 mb-6">
      <button
        class="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        style="background: {activeTab === 'suggestions' ? colors.primary : `${colors.primary}20`};
               color: {colors.text};"
        on:click={() => activeTab = 'suggestions'}
      >
        Suggestions
      </button>
      <button
        class="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        style="background: {activeTab === 'settings' ? colors.primary : `${colors.primary}20`};
               color: {colors.text};"
        on:click={() => activeTab = 'settings'}
      >
        Settings
      </button>
    </div>

    <!-- Main Content -->
    {#if loading}
      <div class="flex justify-center items-center min-h-[400px]">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 rounded-full animate-spin"
            style="border-color: {colors.primary}20;
                   border-top-color: {colors.primary};">
          </div>
          <span class="mt-4 block text-center" style="color: {colors.muted}">
            Loading...
          </span>
        </div>
      </div>
    {:else if error}
      <div
        class="backdrop-blur-sm rounded-xl border p-6"
        style="background: {colors.accent}10;
               border-color: {colors.accent}40;"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <div style="color: {colors.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else if activeTab === 'suggestions'}
      <SuggestionsList
        {suggestions}
        {colors}
        {showNotificationMessage}
        onStatusChange={handleStatusChange}
      />
    {:else if activeTab === 'settings'}
      <SuggestionsSettings
        {colors}
        {showNotificationMessage}
      />
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(body) {
        @apply bg-gray-900;
    }

    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary)10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary)30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary)50;
    }

    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Improve button focus states */
    button:focus {
        @apply outline-none ring-2 ring-opacity-50;
    }

    /* Ensure proper contrast on focus rings */
    button:focus {
        @apply ring-offset-gray-900;
    }

    /* Improve touch targets on mobile */
    @media (max-width: 768px) {
        button {
            @apply min-h-[44px];
        }
    }
</style>