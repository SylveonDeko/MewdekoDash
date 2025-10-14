<!--
@component
Bulk setup for notification-type features (greets, logging, suggestions, etc.)
Groups similar features together for efficient configuration with category support
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface NotificationFeature {
    id: string;
    name: string;
    icon: string;
    description: string;
    enabled: boolean;
    channelId: string | null;
    category?: string;
  }

  interface Props {
    features: NotificationFeature[];
    channels: any[];
    title?: string;
    description?: string;
    showCategories?: boolean;
    onchange?: (detail: { features: NotificationFeature[] }) => void;
  }

  let {
    features = $bindable([]),
    channels = [],
    title = "Notification Channels",
    description = "Configure where each notification type should be sent",
    showCategories = true,
    onchange
  }: Props = $props();

  function toggleFeature(featureId: string) {
    features = features.map(f =>
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    onchange?.({ features });
  }

  function setChannel(featureId: string, channelId: string | null) {
    features = features.map(f =>
      f.id === featureId ? { ...f, channelId, enabled: true } : f
    );
    onchange?.({ features });
  }

  function applyToAll() {
    // Get the first enabled channel
    const firstChannel = features.find(f => f.channelId)?.channelId;
    if (!firstChannel) return;

    features = features.map(f => ({
      ...f,
      channelId: firstChannel,
      enabled: true
    }));
    onchange?.({ features });
  }

  function enableAll() {
    features = features.map(f => ({ ...f, enabled: true }));
    onchange?.({ features });
  }

  function disableAll() {
    features = features.map(f => ({ ...f, enabled: false }));
    onchange?.({ features });
  }

  let enabledCount = $derived(features.filter(f => f.enabled).length);

  // Group features by category
  let categorizedFeatures = $derived.by(() => {
    if (!showCategories) return { "All": features };

    const grouped: Record<string, NotificationFeature[]> = {};
    features.forEach(f => {
      const cat = f.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(f);
    });
    return grouped;
  });

  // Auto-expand essential categories by default
  let expandedCategories = $state<Record<string, boolean>>({
    "Members": true,
    "Messages": true
  });

  let categoryChannelSelectors = $state<Record<string, string | null>>({});

  function toggleCategory(category: string) {
    expandedCategories[category] = !expandedCategories[category];
  }

  function applyToCategory(category: string) {
    const channelId = categoryChannelSelectors[category];
    if (!channelId) return;

    features = features.map(f =>
      f.category === category
        ? { ...f, channelId, enabled: true }
        : f
    );
    onchange?.({ features });
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
        {title}
      </h3>
      <span class="text-sm px-3 py-1 rounded-full"
            style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
        {enabledCount}/{features.length} enabled
      </span>
    </div>
    {#if description}
      <p class="text-sm" style="color: {$colorStore.muted};">
        {description}
      </p>
    {/if}
  </div>

  <!-- Bulk Actions -->
  <div class="flex flex-wrap gap-2">
    <button
      class="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
      disabled={!features.some(f => f.channelId)}
      onclick={applyToAll}
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
    >
      <i class="fa-solid fa-copy" style="font-size: 12px;"></i>
      Apply First Channel to All
    </button>
    <button
      class="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
      onclick={enableAll}
      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
    >
      <i class="fa-solid fa-check-double" style="font-size: 12px;"></i>
      Enable All
    </button>
    <button
      class="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
      onclick={disableAll}
      style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
    >
      <i class="fa-solid fa-ban" style="font-size: 12px;"></i>
      Disable All
    </button>
  </div>

  <!-- Feature List (with categories if enabled) -->
  <div class="space-y-4">
    {#each Object.entries(categorizedFeatures) as [category, categoryFeatures]}
      {#if showCategories && Object.keys(categorizedFeatures).length > 1}
        <!-- Category Header (collapsible) -->
        <div>
          <button
            class="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:opacity-80"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
            onclick={() => toggleCategory(category)}
          >
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm" style="color: {$colorStore.text};">
                {category}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                {categoryFeatures.filter(f => f.enabled).length}/{categoryFeatures.length}
              </span>
            </div>
            <i class="fa-solid {expandedCategories[category] ? 'fa-chevron-up' : 'fa-chevron-down'}"
               style="color: {$colorStore.muted}; font-size: 14px;"></i>
          </button>

          <!-- Quick Apply to Category -->
          {#if expandedCategories[category]}
            <div class="p-3 border-x border-b rounded-b-lg mb-2"
                 style="background: {$colorStore.secondary}05; border-color: {$colorStore.primary}15;">
              <div class="flex gap-2 items-center">
                <span class="text-xs font-medium whitespace-nowrap" style="color: {$colorStore.text};">
                  Apply to all {category}:
                </span>
                <div class="flex-1">
                  <DiscordSelector
                    type="channel"
                    options={channels}
                    selected={categoryChannelSelectors[category]}
                    placeholder="Choose channel..."
                    onchange={(detail) => categoryChannelSelectors[category] = detail.selected}
                  />
                </div>
                <button
                  class="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.secondary}; color: white;"
                  onclick={() => applyToCategory(category)}
                  disabled={!categoryChannelSelectors[category]}
                >
                  Apply
                </button>
              </div>
            </div>
          {/if}

          {#if expandedCategories[category]}
            <div class="mt-2 space-y-2 pl-2">
              {#each categoryFeatures as feature (feature.id)}
                <div
                  class="p-3 rounded-lg border transition-all"
                  style="background: {feature.enabled ? $colorStore.primary + '05' : 'transparent'};
                         border-color: {feature.enabled ? $colorStore.primary + '30' : $colorStore.primary + '15'};"
                >
                  <div class="flex items-start gap-3">
                    <!-- Toggle -->
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        class="sr-only peer"
                        checked={feature.enabled}
                        onchange={() => toggleFeature(feature.id)}
                      />
                      <div
                        class="w-11 h-6 rounded-full peer transition-all peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style="background: {feature.enabled ? $colorStore.primary : $colorStore.muted + '40'};"
                      ></div>
                    </label>

                    <!-- Icon and Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <i class="{feature.icon}"
                           style="color: {feature.enabled ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
                        <h4 class="font-semibold text-sm"
                            style="color: {feature.enabled ? $colorStore.text : $colorStore.muted};">
                          {feature.name}
                        </h4>
                      </div>
                      <p class="text-xs mb-3" style="color: {$colorStore.muted};">
                        {feature.description}
                      </p>

                      <!-- Channel Selector (shown when enabled) -->
                      {#if feature.enabled}
                        <div class="max-w-md">
                          <DiscordSelector
                            type="channel"
                            options={channels}
                            selected={feature.channelId}
                            placeholder="Choose a channel..."
                            onchange={(detail) => setChannel(feature.id, detail.selected)}
                          />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- No categories - flat list -->
        {#each categoryFeatures as feature (feature.id)}
          <div
            class="p-4 rounded-lg border transition-all"
            style="background: {feature.enabled ? $colorStore.primary + '05' : 'transparent'};
                   border-color: {feature.enabled ? $colorStore.primary + '30' : $colorStore.primary + '15'};"
          >
            <div class="flex items-start gap-3">
              <!-- Toggle -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={feature.enabled}
                  onchange={() => toggleFeature(feature.id)}
                />
                <div
                  class="w-11 h-6 rounded-full peer transition-all peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style="background: {feature.enabled ? $colorStore.primary : $colorStore.muted + '40'};"
                ></div>
              </label>

              <!-- Icon and Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <i class="{feature.icon}"
                     style="color: {feature.enabled ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
                  <h4 class="font-semibold text-sm"
                      style="color: {feature.enabled ? $colorStore.text : $colorStore.muted};">
                    {feature.name}
                  </h4>
                </div>
                <p class="text-xs mb-3" style="color: {$colorStore.muted};">
                  {feature.description}
                </p>

                <!-- Channel Selector (shown when enabled) -->
                {#if feature.enabled}
                  <div class="max-w-md">
                    <DiscordSelector
                      type="channel"
                      options={channels}
                      selected={feature.channelId}
                      placeholder="Choose a channel..."
                      onchange={(detail) => setChannel(feature.id, detail.selected)}
                    />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    {/each}
  </div>
</div>
