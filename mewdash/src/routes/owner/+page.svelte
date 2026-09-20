<!-- routes/owner/+page.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { ownerFeatures } from "$lib/config/navigationItems";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";

  /**
   * Landing page for the owner tools. Each card is one entry of the owner feature list, so a new
   * tool added there shows up here and in the sidebar without further wiring.
   */
  const features = [...ownerFeatures].sort((a, b) => a.label.localeCompare(b.label));
</script>

<svelte:head>
  <title>Owner Panel - Mewdeko</title>
</svelte:head>

<div class="min-h-screen p-4 md:p-6 lg:p-8"
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientMid}10 50%, {$colorStore.gradientEnd}05 100%);">
  <div class="max-w-5xl mx-auto space-y-6">
    <header
      class="rounded-2xl border px-5 py-6 md:px-7"
      in:fly={{ y: 16, duration: 300 }}
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
             style="background: {$colorStore.primary}20;">
          <i class="fa-utility-duo fa-regular fa-crown text-xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; --fa-secondary-opacity: 0.5;"
             aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <h1 class="text-xl md:text-2xl font-bold" style="color: {$colorStore.text};">Owner Panel</h1>
          <p class="text-sm" style="color: {$colorStore.muted};">
            Fleet and host tools for {$currentInstance?.botName ?? "the selected bot"}. Nothing here is scoped to a server.
          </p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {#each features as feature, index (feature.href)}
        <a
          href={feature.href}
          class="flex items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] min-h-[44px]"
          in:fly={{ y: 16, duration: 300, delay: 50 + index * 40 }}
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                 border-color: {$colorStore.primary}20;"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background: {$colorStore.primary}15;">
            <i class="{feature.icon} text-base"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; --fa-secondary-opacity: 0.5;"
               aria-hidden="true"></i>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-base font-semibold" style="color: {$colorStore.text};">{feature.label}</div>
            <p class="text-sm mt-0.5" style="color: {$colorStore.muted};">{feature.description}</p>
          </div>
          <i class="fa-solid fa-chevron-right text-xs mt-1 shrink-0" style="color: {$colorStore.muted};" aria-hidden="true"></i>
        </a>
      {/each}
    </div>
  </div>
</div>
