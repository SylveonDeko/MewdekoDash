<!-- lib/components/analytics/tabs/GuildDetail.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { GuildEventRow, GuildTimeline, Page } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { clock, stamp, utcParse } from "../format";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import GuildCardView from "../GuildCardView.svelte";
  import MatrixHeatmap, { type MatrixCell } from "../MatrixHeatmap.svelte";

  interface Props {
    guildId: string;
  }

  let { guildId }: Props = $props();

  let timeline = $state<GuildTimeline | null>(null);
  let timelineLoading = $state(true);
  let events = $state<Page<GuildEventRow>>({ items: [], page: 1, pageSize: 25, total: 0 });
  let eventsLoading = $state(true);
  let eventPage = $state(1);
  let eventType = $state("");
  let seq = 0;
  let eventSeq = 0;

  let hours = $derived.by(() => {
    const set = new Set((timeline?.cells ?? []).map((c) => c.hour));
    return [...set].sort((a, b) => utcParse(a) - utcParse(b));
  });
  let cells = $derived<MatrixCell[]>((timeline?.cells ?? []).map((c) => ({ row: c.type, col: c.hour, value: c.count })));
  let eventTypes = $derived([...new Set((timeline?.types ?? []))]);

  const selectStyle = $derived(
    `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border-color: ${$colorStore.primary}20;`,
  );

  const columns: Column<GuildEventRow>[] = [
    { key: "at", label: "When (UTC)", muted: true, format: (r) => stamp(r.at), sortValue: (r) => utcParse(r.at) },
    { key: "eventType", label: "Type", mono: true },
    { key: "bot", label: "Bot", mono: true, muted: true },
    { key: "shard", label: "Shard", num: true, format: (r) => (r.shard === null ? "—" : String(r.shard)) },
  ];

  function hourLabel(h: string): string {
    const ms = utcParse(h);
    if (Number.isNaN(ms)) return h;
    const d = new Date(ms);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${clock(h).slice(0, 2)}h`;
  }

  async function loadTimeline() {
    const my = ++seq;
    const f = $analyticsFilters;
    timelineLoading = true;
    try {
      const result = await analyticsApi.guildTimeline(guildId, { ...timeParams(f), bot: f.bot || undefined });
      if (my !== seq) return;
      timeline = result ?? null;
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Guild timeline failed", err);
      timeline = null;
    } finally {
      if (my === seq) timelineLoading = false;
    }
  }

  async function loadEvents() {
    const my = ++eventSeq;
    eventsLoading = true;
    try {
      const result = await analyticsApi.guildEvents(guildId, { ...timeParams($analyticsFilters), eventType: eventType || undefined, page: eventPage, pageSize: 25 });
      if (my !== eventSeq) return;
      events = result ?? { items: [], page: eventPage, pageSize: 25, total: 0 };
    } catch (err) {
      if (my !== eventSeq) return;
      logger.warn("Guild events failed", err);
      events = { items: [], page: eventPage, pageSize: 25, total: 0 };
    } finally {
      if (my === eventSeq) eventsLoading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, guildId];
    void loadTimeline();
  });

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, guildId, eventPage, eventType];
    void loadEvents();
  });

  $effect(() => {
    void [guildId, eventType, $analyticsFilters];
    eventPage = 1;
  });
</script>

<div class="space-y-4">
  <Card title="Guild card">
    <GuildCardView {guildId} />
  </Card>

  <Card title="Activity by type and hour" note="UTC">
    <MatrixHeatmap rows={timeline?.types ?? []} cols={hours} {cells} colLabel={hourLabel} loading={timelineLoading} unit="events" empty="No activity in range" />
  </Card>

  <Card title="Security events">
    {#snippet actions()}
      <select class="min-h-[44px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={eventType} aria-label="Event type">
        <option value="">any type</option>
        {#each eventTypes as t}<option value={t}>{t}</option>{/each}
      </select>
    {/snippet}
    <AnalyticsTable
      {columns}
      rows={events.items}
      loading={eventsLoading}
      empty="No logged events"
      sortKey="at"
      page={events.page}
      pageSize={25}
      total={events.total}
      onPage={(p) => (eventPage = p)}
    />
  </Card>
</div>
