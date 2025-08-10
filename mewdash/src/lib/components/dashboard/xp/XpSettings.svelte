<script lang="ts">
  import { AlertCircle, Settings } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  export let xpSettings: any;
  export let loading: boolean = false;
  export let error: string | null = null;
  export let changedSettings: Set<string>;

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  const xpCurveOptions = [
    { id: "0", name: "Default" },
    { id: "1", name: "Linear" },
    { id: "2", name: "Quadratic" },
    { id: "3", name: "Exponential" },
    { id: "5", name: "Legacy" }
  ];
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <Settings aria-hidden="true" class="w-6 h-6" />
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Settings</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- XP Per Message -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">XP Per Message</h3>
      </div>
      <input
        id="xp-per-message"
        bind:value={xpSettings.xpPerMessage}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.primary}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.primary}50;"
        type="number"
        min="0"
        max="50"
        aria-label="XP per message"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Amount of XP users earn per message (max 50).
      </p>
    </div>

    <!-- Message XP Cooldown -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">Message XP Cooldown</h3>
      </div>
      <input
        id="message-xp-cooldown"
        bind:value={xpSettings.messageXpCooldown}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.secondary}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.secondary}50;"
        type="number"
        min="0"
        aria-label="Message XP cooldown in seconds"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Cooldown in seconds between messages that can earn XP.
      </p>
    </div>

    <!-- Voice XP Per Minute -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">Voice XP Per Minute</h3>
      </div>
      <input
        id="voice-xp-per-minute"
        bind:value={xpSettings.voiceXpPerMinute}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.accent}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.accent}50;"
        type="number"
        min="0"
        max="10"
        aria-label="Voice XP per minute"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Amount of XP users earn per minute in voice channels (max 10).
      </p>
    </div>

    <!-- Voice XP Timeout -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">Voice XP Timeout</h3>
      </div>
      <input
        id="voice-xp-timeout"
        bind:value={xpSettings.voiceXpTimeout}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.primary}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.primary}50;"
        type="number"
        min="0"
        aria-label="Voice XP timeout in minutes"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Time in minutes before a voice session expires if user is inactive.
      </p>
    </div>

    <!-- XP Multiplier -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">Global XP Multiplier</h3>
      </div>
      <input
        id="xp-multiplier"
        bind:value={xpSettings.xpMultiplier}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.secondary}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.secondary}50;"
        type="number"
        min="0.1"
        step="0.1"
        aria-label="Global XP multiplier"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Global multiplier applied to all XP gains.
      </p>
    </div>

    <!-- XP Curve Type -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">XP Curve Type</h3>
      </div>
      <DiscordSelector
        type="custom"
        options={xpCurveOptions}
        selected={xpSettings.xpCurveType?.toString()}
        placeholder="Select curve type"
        searchable={false}
        on:change={(e) => {
          xpSettings.xpCurveType = parseInt(e.detail.selected);
          markAsChanged("xpSettings");
        }}
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        Determines how much XP is required for each level.
      </p>
    </div>

    <!-- Custom XP Image URL -->
    <div
      class="col-span-1 md:col-span-2 rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex items-center gap-2 mb-3">
        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
        <h3 class="font-semibold" style="color: {$colorStore.text}">Custom XP Card Background</h3>
      </div>
      <input
        id="custom-xp-image-url"
        bind:value={xpSettings.customXpImageUrl}
        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
        on:input={() => markAsChanged("xpSettings")}
        style="border-color: {$colorStore.primary}30;
               color: {$colorStore.text};
               focus-visible:outline: none;
               focus-visible:ring: 2px;
               focus-visible:ring-color: {$colorStore.primary}50;"
        type="url"
        placeholder="https://example.com/image.png"
        aria-label="Custom XP card background URL"
      />
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        URL to a custom background image for XP cards. Recommended size: 797x279 pixels.
      </p>
    </div>

    <!-- Server Exclusion -->
    <div
      class="col-span-1 md:col-span-2 rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-2">
          <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Server XP Exclusion</h3>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={xpSettings.serverExclusionState}
            class="sr-only peer"
            on:change={() => markAsChanged("xpSettings")}
            aria-label="Enable or disable XP gain for the entire server"
            id="server-exclusion"
          >
          <div
            class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
            style="background-color: {$colorStore.accent}30;
                   peer-checked:background-color: {$colorStore.accent};"
            aria-hidden="true"
          ></div>
        </label>
      </div>
      <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
        When enabled, XP gain is disabled server-wide.
      </p>
    </div>
  </div>
{/if}