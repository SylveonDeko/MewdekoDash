<script lang="ts">
  import { onDestroy } from "svelte";
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type {
    FeatureRequestCategory,
    FeatureRequestEntry,
    FeatureRequestStats,
    FeatureRequestStatus
  } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RequestList from "./RequestList.svelte";
  import { categoryOptions, errorText, statusOptions, type Notify } from "./requestModel";

  interface Props {
    owner: boolean;
    notify: Notify;
    onsuggest: () => void;
  }

  let { owner, notify, onsuggest }: Props = $props();

  const PAGE_SIZE = 25;

  let entries: FeatureRequestEntry[] = $state([]);
  let stats = $state<FeatureRequestStats | null>(null);
  let total = $state(0);
  let page = $state(1);
  let loading = $state(true);
  let search = $state("");
  let status: FeatureRequestStatus | null = $state("open");
  let category: FeatureRequestCategory | null = $state(null);
  let sort: "votes" | "newest" = $state("votes");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let token = 0;

  const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

  const tiles = $derived([
    { label: m.common.total(), value: stats?.total ?? 0 },
    { label: m.common.open(), value: stats?.byStatus?.open ?? 0 },
    { label: m.featureRequests.statusPlanned(), value: stats?.byStatus?.planned ?? 0 },
    { label: m.common.done(), value: stats?.byStatus?.done ?? 0 },
    { label: m.featureRequests.statusDeclined(), value: stats?.byStatus?.declined ?? 0 },
    { label: m.featureRequests.statBugs(), value: stats?.byCategory?.bug ?? 0 }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function load() {
    const mine = ++token;
    loading = true;
    try {
      const result = await featureRequestsApi.getPage({
        status: status ?? undefined,
        category: category ?? undefined,
        search: search.trim() || undefined,
        sort,
        page,
        pageSize: PAGE_SIZE
      });
      if (mine !== token) return;
      entries = result.items ?? [];
      total = result.total ?? 0;
    } catch (err) {
      if (mine !== token) return;
      logger.error("Failed to fetch feature requests:", err);
      notify(errorText(err, m.featureRequests.errorLoad()), "error");
    } finally {
      if (mine === token) loading = false;
    }
  }

  async function loadStats() {
    if (!owner) return;
    try {
      stats = await featureRequestsApi.getStats();
    } catch (err) {
      logger.error("Failed to fetch feature request stats:", err);
    }
  }

  function refilter() {
    page = 1;
    void load();
  }

  function typeSearch() {
    clearTimeout(timer);
    timer = setTimeout(refilter, 350);
  }

  function goTo(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    void load();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changed() {
    void loadStats();
    void load();
  }

  onDestroy(() => clearTimeout(timer));

  void load();
  void loadStats();
</script>

{#if owner && stats}
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
    {#each tiles as tile (tile.label)}
      <div class="rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="text-xs" style="color: {$colorStore.muted}">{tile.label}</div>
        <div class="text-xl font-semibold" style="color: {$colorStore.text}">{tile.value}</div>
      </div>
    {/each}
  </div>
{/if}

<PluginCard title={m.featureRequests.tabBrowse()} alwaysOpen>
  <div class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <input
        type="search"
        bind:value={search}
        placeholder={m.featureRequests.searchPlaceholder()}
        aria-label={m.common.search()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] sm:col-span-2 lg:col-span-1"
        style={inputStyle}
        oninput={typeSearch}
      >
      <DiscordSelector
        type="custom"
        options={statusOptions()}
        selected={status}
        placeholder={m.common.anyStatus()}
        customIcon="fa-flag"
        ariaLabel={m.common.status()}
        searchable={false}
        onchange={(detail) => {
          status = typeof detail.selected === "string" && detail.selected ? (detail.selected as FeatureRequestStatus) : null;
          refilter();
        }}
      />
      <DiscordSelector
        type="custom"
        options={categoryOptions()}
        selected={category}
        placeholder={m.featureRequests.categoryAny()}
        customIcon="fa-tag"
        ariaLabel={m.common.category()}
        searchable={false}
        onchange={(detail) => {
          category = typeof detail.selected === "string" && detail.selected ? (detail.selected as FeatureRequestCategory) : null;
          refilter();
        }}
      />
      <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.common.sortBy()}>
        {#each [{ id: "votes", label: m.featureRequests.sortTop() }, { id: "newest", label: m.common.new() }] as option (option.id)}
          {@const selected = sort === option.id}
          <button
            type="button"
            class="min-h-[50px] rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => {
              sort = option.id as "votes" | "newest";
              refilter();
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>

    {#if loading && entries.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.featureRequests.loadingRequests()}</p>
    {:else if entries.length === 0}
      <div class="space-y-3 py-4">
        <p class="text-sm" style="color: {$colorStore.muted}">{m.featureRequests.browseEmpty()}</p>
        <button
          type="button"
          class="px-5 rounded-lg min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          onclick={onsuggest}
        >
          {m.common.suggestAFeature()}
        </button>
      </div>
    {:else}
      <RequestList bind:entries {owner} {notify} onchanged={changed} />

      {#if totalPages > 1}
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            class="px-4 rounded-lg min-h-[44px] disabled:opacity-40"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            disabled={page <= 1}
            onclick={() => goTo(page - 1)}
          >
            {m.common.previous()}
          </button>
          <span class="text-sm text-center" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page, total: totalPages })}</span>
          <button
            type="button"
            class="px-4 rounded-lg min-h-[44px] disabled:opacity-40"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            disabled={page >= totalPages}
            onclick={() => goTo(page + 1)}
          >
            {m.common.next()}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</PluginCard>
