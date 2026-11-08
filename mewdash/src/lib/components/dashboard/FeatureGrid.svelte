<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { groupFeatures, navigationGroups } from "$lib/config/navigationItems";
  import { featureSlug, featureStatus } from "$lib/stores/featureStatusStore";
  import { matchesSearchTerms } from "$lib/stores/searchStore";

  let activeGroup = $state("all");
  let searchTerm = $state("");

  let noGuild = $derived(!$currentGuild);

  let tabs = $derived([
    { id: "all", label: m.features.groupAll() },
    ...navigationGroups.map(group => ({ id: group.id, label: group.label() }))
  ]);

  let visibleFeatures = $derived.by(() => {
    const groups = activeGroup === "all"
      ? navigationGroups
      : navigationGroups.filter(group => group.id === activeGroup);

    return groups
      .flatMap(group => groupFeatures(group))
      .filter(feature =>
        !searchTerm.trim() ||
        matchesSearchTerms(
          {
            title: feature.label(),
            description: feature.description?.() ?? "",
            category: feature.category,
            keywords: feature.keywords
          },
          searchTerm
        )
      );
  });

  function statusOf(href: string): { label: string; on: boolean } | null {
    const state = $featureStatus?.[featureSlug(href)];
    if (!state) return null;
    if (state.enabled) return { label: m.features.statusOn(), on: true };
    return { label: state.configured ? m.features.statusOff() : m.features.statusNotSetUp(), on: false };
  }
</script>

<section class="space-y-4">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible" role="tablist">
      {#each tabs as tab (tab.id)}
        {@const selected = activeGroup === tab.id}
        <button
          type="button"
          role="tab"
          aria-selected={selected}
          class="shrink-0 min-h-[44px] px-4 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors"
          style="background: {selected ? $colorStore.selectedSurface : $colorStore.primary + '08'};
                 border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};
                 color: {selected ? $colorStore.text : $colorStore.muted};"
          onclick={() => (activeGroup = tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <div class="relative lg:ml-auto lg:w-72">
      <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs"
         style="color: {$colorStore.muted};" aria-hidden="true"></i>
      <input
        type="text"
        placeholder={m.layout.sidebarSearchFeaturesPlaceholder()}
        bind:value={searchTerm}
        class="w-full pl-8 pr-3 rounded-lg text-sm border min-h-[50px]"
        style="background: {$colorStore.primary}08;
               border-color: {$colorStore.primary}20;
               color: {$colorStore.text};"
      >
    </div>
  </div>

  {#if visibleFeatures.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted};">{m.layout.sidebarNoFeaturesMatch({ term: searchTerm })}</p>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" role="list">
      {#each visibleFeatures as feature (feature.href)}
        {@const status = statusOf(feature.href)}
        <div
          class="rounded-xl border p-4 flex flex-col gap-3"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
          role="listitem"
        >
          <div class="flex items-center gap-3">
            <i class="{feature.icon} text-xl shrink-0"
               style="--fa-primary-color: {$colorStore.primary};
                      --fa-secondary-color: {$colorStore.secondary};
                      --fa-secondary-opacity: 0.5;
                      width: 24px; text-align: center;"
               aria-hidden="true"></i>
            <h3 class="font-medium truncate flex-1" style="color: {$colorStore.text};">{feature.label()}</h3>
            {#if status}
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
                style="background: {status.on ? $colorStore.primary : $colorStore.muted}20; color: {status.on ? $colorStore.text : $colorStore.muted};"
              >
                {status.label}
              </span>
            {/if}
          </div>

          <p class="text-sm flex-1" style="color: {$colorStore.muted};">{feature.description?.()}</p>

          <a
            href={noGuild ? undefined : feature.href}
            aria-disabled={noGuild}
            class="min-h-[44px] rounded-lg px-4 flex items-center justify-center text-sm font-medium border transition-colors"
            class:opacity-40={noGuild}
            class:pointer-events-none={noGuild}
            style="background: {$colorStore.primary}10;
                   border-color: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            {m.features.openFeature()}
          </a>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
