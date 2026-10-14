<!--
@component
Smart channel selector with bulk operations and pattern detection
Supports single, multiple, category-based, and pattern-based selection
-->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    channels: any[];
    categories?: any[];
    selected?: string[] | string | null;
    mode?: "single" | "multiple" | "smart";
    label?: string;
    placeholder?: string;
    detectedPattern?: string[];
    onchange?: (detail: { selected: string[] | string | null; mode: string }) => void;
  }

  let {
    channels = [],
    categories = [],
    selected = $bindable(null),
    mode = $bindable("single"),
    label = m.common.selectAChannelPlaceholder(),
    placeholder = m.wizard.bulkChooseAChannelPlaceholder(),
    detectedPattern = [],
    onchange
  }: Props = $props();

  let showAdvanced = $state(false);
  let selectedCategory = $state<string | null>(null);
  let patternFilter = $state("");

  // Smart pattern detection
  let detectedChannels = $derived(
    detectedPattern.length > 0
      ? channels.filter(ch => detectedPattern.includes(ch.id))
      : []
  );

  let detectedMessage = $derived.by(() => {
    const count = detectedChannels.length;
    const names = detectedChannels.slice(0, 3).map(ch => `#${ch.name}`).join(", ");
    const list = count > 3 ? m.wizard.channelSelectorAndMore({ channels: names, count: count - 3 }) : names;
    return count === 1
      ? m.wizard.channelSelectorDetectedOne({ count, channels: list })
      : m.wizard.channelSelectorDetectedOther({ count, channels: list });
  });

  function handleModeChange(newMode: "single" | "multiple") {
    mode = newMode;
    if (newMode === "single" && Array.isArray(selected)) {
      selected = selected[0] || null;
    } else if (newMode === "multiple" && !Array.isArray(selected)) {
      selected = selected ? [selected] : [];
    }
    onchange?.({ selected, mode });
  }

  function applyCategory() {
    if (!selectedCategory) return;
    const categoryChannels = channels.filter(ch => ch.parentId === selectedCategory);
    selected = categoryChannels.map(ch => ch.id);
    onchange?.({ selected, mode });
  }

  function applyPattern() {
    if (!patternFilter) return;
    const pattern = patternFilter.toLowerCase();
    const matchedChannels = channels.filter(ch =>
      ch.name.toLowerCase().includes(pattern)
    );
    selected = matchedChannels.map(ch => ch.id);
    onchange?.({ selected, mode });
  }

  function applyDetected() {
    selected = detectedPattern;
    onchange?.({ selected, mode });
  }

  function selectAll() {
    selected = channels.map(ch => ch.id);
    onchange?.({ selected, mode });
  }
</script>

<div class="space-y-4">
  <!-- Label and Mode Toggle -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium" style="color: {$colorStore.text};">
      {label}
    </span>
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 rounded-sm text-xs font-medium transition-all"
        class:active={mode === 'single'}
        onclick={() => handleModeChange('single')}
        style="background: {mode === 'single' ? $colorStore.primary + '20' : 'transparent'};
               color: {mode === 'single' ? $colorStore.primary : $colorStore.muted};
               border: 1px solid {mode === 'single' ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
      >
        {m.wizard.channelSelectorSingle()}
      </button>
      <button
        class="px-3 py-1 rounded-sm text-xs font-medium transition-all"
        class:active={mode === 'multiple'}
        onclick={() => handleModeChange('multiple')}
        style="background: {mode === 'multiple' ? $colorStore.primary + '20' : 'transparent'};
               color: {mode === 'multiple' ? $colorStore.primary : $colorStore.muted};
               border: 1px solid {mode === 'multiple' ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
      >
        {m.common.multiple()}
      </button>
    </div>
  </div>

  <!-- Smart Detection Banner -->
  {#if detectedChannels.length > 0}
    <div class="p-3 rounded-lg border"
         style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
      <div class="flex items-start gap-2">
        <i class="fa-solid fa-lightbulb" style="color: {$colorStore.accent}; font-size: 16px; margin-top: 2px;"></i>
        <div class="flex-1">
          <p class="text-sm font-medium mb-1" style="color: {$colorStore.text};">
            {m.wizard.channelSelectorDetectionTitle()}
          </p>
          <p class="text-xs mb-2" style="color: {$colorStore.muted};">
            {detectedMessage}
          </p>
          <button
            class="text-xs font-medium px-2 py-1 rounded-sm transition-all hover:scale-[1.02]"
            style="background: {$colorStore.accent}; color: white;"
            onclick={applyDetected}
          >
            {m.wizard.channelSelectorUseDetected()}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Channel Selector -->
  <DiscordSelector
    bind:selected={selected}
    multiple={mode === 'multiple'}
    options={channels}
    {placeholder}
    type="channel"
  />

  <!-- Advanced Options Toggle -->
  {#if mode === 'multiple'}
    <button
      class="text-xs font-medium flex items-center gap-2 transition-all"
      style="color: {$colorStore.primary};"
      onclick={() => showAdvanced = !showAdvanced}
    >
      <i class="fa-solid {showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 10px;"></i>
      {showAdvanced ? m.wizard.channelSelectorHideAdvanced() : m.wizard.channelSelectorShowAdvanced()}
    </button>
  {/if}

  <!-- Advanced Options -->
  {#if showAdvanced && mode === 'multiple'}
    <div class="space-y-3 p-4 rounded-lg border"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
      <!-- Category Selection -->
      {#if categories.length > 0}
        <div>
          <label for="cbs-category" class="text-xs font-medium mb-2 block" style="color: {$colorStore.text};">
            {m.wizard.channelSelectorSelectCategory()}
          </label>
          <div class="flex gap-2">
            <DiscordSelector
              id="cbs-category"
              type="custom"
              options={categories}
              bind:selected={selectedCategory}
              placeholder={m.wizard.channelSelectorCategoryPlaceholder()}
            />
            <button
              class="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}; color: white;"
              onclick={applyCategory}
              disabled={!selectedCategory}
            >
              {m.common.apply()}
            </button>
          </div>
        </div>
      {/if}

      <!-- Pattern Matching -->
      <div>
        <label for="cbs-pattern" class="text-xs font-medium mb-2 block" style="color: {$colorStore.text};">
          {m.wizard.channelSelectorSelectPattern()}
        </label>
        <div class="flex gap-2">
          <input
            id="cbs-pattern"
            type="text"
            class="flex-1 px-3 py-2 rounded-lg border text-sm"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder={m.wizard.channelSelectorPatternPlaceholder()}
            bind:value={patternFilter}
          />
          <button
            class="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}; color: white;"
            onclick={applyPattern}
            disabled={!patternFilter}
          >
            {m.common.apply()}
          </button>
        </div>
      </div>

      <!-- Select All -->
      <button
        class="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        onclick={selectAll}
      >
        {m.wizard.channelSelectorSelectAll({ count: channels.length })}
      </button>
    </div>
  {/if}
</div>

<style>
    .active {
        font-weight: 600;
    }
</style>
