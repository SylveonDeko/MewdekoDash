<!-- lib/components/analytics/tabs/GuildsTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { GuildAnomalyRow, TopGuildRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, syncFiltersToUrl, timeParams } from "$lib/stores/analyticsFilters";
  import { labelValues } from "../registry";
  import { compact, n, stamp, utcParse } from "../format";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import GuildDetail from "./GuildDetail.svelte";

  let eventType = $state("");
  let minCount = $state(50);
  let eventTypes = $state<string[]>([]);
  let top = $state<TopGuildRow[]>([]);
  let topLoading = $state(true);
  let anomalies = $state<GuildAnomalyRow[]>([]);
  let anomaliesLoading = $state(true);
  let guildInput = $state("");
  let seq = 0;

  let selected = $derived($analyticsFilters.guild);

  const selectStyle = $derived(
    `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border-color: ${$colorStore.primary}20;`,
  );

  const topColumns: Column<TopGuildRow>[] = [
    { key: "guildId", label: "Guild", mono: true },
    { key: "name", label: "Name", format: (r) => r.name ?? "—" },
    { key: "memberCount", label: "Members", num: true, format: (r) => n(r.memberCount) },
    { key: "events", label: "Events", num: true, format: (r) => compact(r.events) },
    { key: "topTypes", label: "Top types", muted: true, format: (r) => r.topTypes.map((t) => `${t.type} ${compact(t.count)}`).join(" · ") || "—", sortValue: () => null },
  ];

  const anomalyColumns: Column<GuildAnomalyRow>[] = [
    { key: "guildId", label: "Guild", mono: true },
    { key: "name", label: "Name", format: (r) => r.name ?? "—" },
    { key: "eventType", label: "Type", mono: true },
    { key: "hour", label: "Hour (UTC)", muted: true, format: (r) => stamp(r.hour), sortValue: (r) => utcParse(r.hour) },
    { key: "count", label: "Count", num: true },
    { key: "mean", label: "Usual", num: true, format: (r) => compact(r.mean) },
    { key: "z", label: "z", num: true, format: (r) => r.z.toFixed(1), tone: (r) => (r.z >= 6 ? "crit" : r.z >= 3 ? "warn" : null) },
  ];

  function select(guildId: string) {
    analyticsFilters.update((f) => ({ ...f, guild: guildId }));
    syncFiltersToUrl();
  }

  function applyInput() {
    const id = guildInput.trim();
    if (id && !/^\d{15,20}$/.test(id)) return;
    select(id);
  }

  async function loadOptions() {
    try {
      eventTypes = await labelValues("ev.count", "type");
    } catch (err) {
      logger.debug("Event type values unavailable", err);
    }
  }

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    const base = { ...timeParams(f), bot: f.bot || undefined };
    topLoading = anomaliesLoading = true;
    const [t, a] = await Promise.allSettled([
      analyticsApi.topGuilds({ ...base, eventType: eventType || undefined, limit: 25 }),
      analyticsApi.guildAnomalies({ ...base, minCount: Math.max(1, minCount), limit: 50 }),
    ]);
    if (my !== seq) return;
    top = t.status === "fulfilled" ? t.value ?? [] : [];
    anomalies = a.status === "fulfilled" ? a.value ?? [] : [];
    for (const r of [t, a]) if (r.status === "rejected") logger.warn("Guilds tab query failed", r.reason);
    topLoading = anomaliesLoading = false;
  }

  $effect(() => {
    void loadOptions();
  });

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, eventType, minCount];
    void load();
  });

  $effect(() => {
    guildInput = $analyticsFilters.guild;
  });
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <select class="min-h-[44px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={eventType} aria-label="Event type">
      <option value="">any type</option>
      {#each eventTypes as t}<option value={t}>{t}</option>{/each}
    </select>
    <label class="flex items-center gap-1.5 text-xs" style="color: {$colorStore.muted}">
      min / h
      <input type="number" min="1" step="1" class="min-h-[44px] w-20 rounded-lg border px-2 text-xs" style={selectStyle} bind:value={minCount} aria-label="Minimum events per hour" />
    </label>
    <div class="flex items-center gap-1 ml-auto">
      <input
        type="text"
        inputmode="numeric"
        placeholder="guild id"
        class="min-h-[44px] w-44 rounded-lg border px-2 text-xs font-mono"
        style={selectStyle}
        bind:value={guildInput}
        onkeydown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyInput(); } }}
        aria-label="Guild id"
      />
      <button type="button" class="min-h-[44px] px-3 rounded-lg text-xs font-medium" style="background: {$colorStore.primary}30; color: {$colorStore.text}" onclick={applyInput}>Open</button>
      {#if selected}
        <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg text-xs" style="background: {$colorStore.primary}10; color: {$colorStore.muted}" onclick={() => select("")} aria-label="Clear guild"><i class="fa-solid fa-xmark"></i></button>
      {/if}
    </div>
  </div>

  {#if selected}
    <GuildDetail guildId={selected} />
  {/if}

  <Card title="Top guilds by events" note="row → select">
    <AnalyticsTable columns={topColumns} rows={top} loading={topLoading} sortKey="events" pageSize={15} onRowClick={(r) => select(r.guildId)} selected={(r) => r.guildId === selected} />
  </Card>

  <Card title="Unusual activity" note="vs same hour, previous 14 days · row → select">
    <AnalyticsTable columns={anomalyColumns} rows={anomalies} loading={anomaliesLoading} empty="Nothing unusual" sortKey="z" pageSize={15} onRowClick={(r) => select(r.guildId)} selected={(r) => r.guildId === selected} />
  </Card>
</div>
