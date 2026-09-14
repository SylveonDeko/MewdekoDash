<!-- lib/components/analytics/FilterBar.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import {
    analyticsFilters,
    analyticsRefreshTick,
    RANGE_SECONDS,
    rangeSeconds,
    syncFiltersToUrl,
    type AnalyticsFilters,
  } from "$lib/stores/analyticsFilters";
  import { labelValues } from "./registry";
  import { clock } from "./format";

  const REFRESH_MS = 30_000;
  const ranges = Object.keys(RANGE_SECONDS);

  let bots = $state<{ id: string; name: string }[]>([]);
  let shards = $state<string[]>([]);
  let guildInput = $state("");
  let guildInvalid = $state(false);
  let customOpen = $state(false);
  let customFrom = $state("");
  let customTo = $state("");
  let customError = $state("");
  let copied = $state(false);
  let updatedAt = $state("");

  let f = $derived($analyticsFilters);
  let isCustom = $derived(!!(f.from && f.to));

  $effect(() => {
    guildInput = $analyticsFilters.guild;
  });

  function apply(patch: Partial<AnalyticsFilters>) {
    analyticsFilters.update((current) => ({ ...current, ...patch }));
    syncFiltersToUrl();
  }

  function chipStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}30; color: ${$colorStore.text}; border-color: ${$colorStore.primary}60;`
      : `background: ${$colorStore.primary}08; color: ${$colorStore.muted}; border-color: ${$colorStore.primary}20;`;
  }

  function toInput(iso: string): string {
    const d = new Date(iso);
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  function openCustom() {
    customFrom = toInput(f.from || new Date(Date.now() - rangeSeconds(f) * 1000).toISOString());
    customTo = toInput(f.to || new Date().toISOString());
    customError = "";
    customOpen = true;
  }

  function applyCustom() {
    const fromMs = Date.parse(`${customFrom}:00Z`);
    const toMs = Date.parse(`${customTo}:00Z`);
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) customError = "Both dates required";
    else if (toMs <= fromMs) customError = "End before start";
    else if (toMs - fromMs > 31 * 86400000) customError = "Max 31 days";
    else {
      customError = "";
      customOpen = false;
      apply({ from: new Date(fromMs).toISOString(), to: new Date(toMs).toISOString() });
    }
  }

  function applyGuild() {
    const id = guildInput.trim();
    if (id && !/^\d{15,20}$/.test(id)) {
      guildInvalid = true;
      setTimeout(() => (guildInvalid = false), 1200);
      return;
    }
    apply({ guild: id });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch (err) {
      logger.warn("Clipboard write failed", err);
    }
  }

  function tick() {
    analyticsRefreshTick.update((t) => t + 1);
    updatedAt = clock(new Date().toISOString());
  }

  async function loadOptions() {
    try {
      const health = await analyticsApi.health();
      bots = (health.instances ?? []).map((i) => ({ id: i.botId, name: i.botName || i.botId }));
    } catch (err) {
      logger.debug("Analytics instance list unavailable", err);
    }
    try {
      shards = await labelValues("shard.latency", "shard");
    } catch (err) {
      logger.debug("Analytics shard list unavailable", err);
    }
  }

  onMount(() => {
    guildInput = $analyticsFilters.guild;
    updatedAt = clock(new Date().toISOString());
    void loadOptions();
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      tick();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  });
</script>

<div
  class="rounded-xl border p-3 mb-4 flex flex-wrap items-center gap-2"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex flex-wrap items-center gap-1" role="group" aria-label="Range">
    {#each ranges as r}
      <button
        type="button"
        class="min-h-[36px] px-2.5 rounded-lg border text-xs font-medium"
        style={chipStyle(!isCustom && f.range === r)}
        onclick={() => apply({ range: r, from: "", to: "" })}
      >{r}</button>
    {/each}
    <button
      type="button"
      class="min-h-[36px] px-2.5 rounded-lg border text-xs font-medium"
      style={chipStyle(isCustom)}
      onclick={openCustom}
      title={isCustom ? `${f.from} → ${f.to}` : "Custom range"}
    ><i class="fa-solid fa-calendar-days"></i></button>
  </div>

  <label class="flex items-center gap-1.5 text-xs min-h-[36px] px-1" style="color: {$colorStore.muted}">
    <input type="checkbox" checked={f.compare} onchange={(e) => apply({ compare: e.currentTarget.checked })} style="accent-color: {$colorStore.primary}" />
    compare
  </label>

  <select
    class="min-h-[36px] rounded-lg border px-2 text-xs"
    style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;"
    value={f.bot}
    onchange={(e) => apply({ bot: e.currentTarget.value })}
    aria-label="Bot"
  >
    <option value="">all bots</option>
    {#each bots as b}
      <option value={b.id}>{b.name}</option>
    {/each}
    {#if f.bot && !bots.some((b) => b.id === f.bot)}
      <option value={f.bot}>{f.bot}</option>
    {/if}
  </select>

  <select
    class="min-h-[36px] rounded-lg border px-2 text-xs"
    style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;"
    value={f.shard}
    onchange={(e) => apply({ shard: e.currentTarget.value })}
    aria-label="Shard"
  >
    <option value="">all shards</option>
    {#each shards as s}
      <option value={s}>shard {s}</option>
    {/each}
    {#if f.shard && !shards.includes(f.shard)}
      <option value={f.shard}>shard {f.shard}</option>
    {/if}
  </select>

  <div class="flex items-center gap-1">
    <input
      type="text"
      inputmode="numeric"
      placeholder="guild id"
      class="min-h-[36px] w-40 rounded-lg border px-2 text-xs font-mono"
      style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {guildInvalid ? '#f87171' : $colorStore.primary + '20'};"
      bind:value={guildInput}
      onkeydown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyGuild(); } }}
      aria-label="Guild id"
    />
    {#if f.guild}
      <button
        type="button"
        class="min-h-[36px] min-w-[36px] rounded-lg text-xs"
        style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
        onclick={() => { guildInput = ""; apply({ guild: "" }); }}
        aria-label="Clear guild"
      ><i class="fa-solid fa-xmark"></i></button>
    {/if}
  </div>

  <div class="ml-auto flex items-center gap-2 text-xs" style="color: {$colorStore.muted}">
    <span class="hidden sm:inline">{updatedAt} UTC</span>
    <button
      type="button"
      class="min-h-[36px] min-w-[36px] rounded-lg"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}"
      onclick={tick}
      title="Refresh"
      aria-label="Refresh"
    ><i class="fa-solid fa-rotate"></i></button>
    <button
      type="button"
      class="min-h-[36px] min-w-[36px] rounded-lg"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}"
      onclick={copyLink}
      title="Copy link"
      aria-label="Copy link"
    ><i class="fa-solid {copied ? 'fa-check' : 'fa-link'}"></i></button>
  </div>

  {#if customOpen}
    <div class="w-full flex flex-wrap items-end gap-2 pt-2 border-t" style="border-color: {$colorStore.primary}20;">
      <label class="text-xs flex flex-col gap-1" style="color: {$colorStore.muted}">
        from (UTC)
        <input type="datetime-local" bind:value={customFrom} class="min-h-[36px] rounded-lg border px-2 text-xs" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;" />
      </label>
      <label class="text-xs flex flex-col gap-1" style="color: {$colorStore.muted}">
        to (UTC)
        <input type="datetime-local" bind:value={customTo} class="min-h-[36px] rounded-lg border px-2 text-xs" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;" />
      </label>
      <button type="button" class="min-h-[36px] px-3 rounded-lg text-xs font-medium" style="background: {$colorStore.primary}30; color: {$colorStore.text}" onclick={applyCustom}>Apply</button>
      <button type="button" class="min-h-[36px] px-3 rounded-lg text-xs" style="background: {$colorStore.primary}10; color: {$colorStore.muted}" onclick={() => (customOpen = false)}>Cancel</button>
      {#if customError}<span class="text-xs" style="color: #f87171">{customError}</span>{/if}
    </div>
  {/if}
</div>
