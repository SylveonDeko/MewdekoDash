<!-- lib/components/analytics/ErrorsPanel.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { ErrorGroupRow, ErrorOccurrenceRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { ago, n, stamp, truncate } from "./format";
  import AnalyticsTable, { type Column } from "./AnalyticsTable.svelte";

  interface Props {
    limit?: number;
  }

  let { limit = 25 }: Props = $props();

  let rows = $state<ErrorGroupRow[]>([]);
  let loading = $state(true);
  let selected = $state<ErrorGroupRow | null>(null);
  let samples = $state<ErrorOccurrenceRow[]>([]);
  let samplesLoading = $state(false);
  let seq = 0;

  const columns: Column<ErrorGroupRow>[] = $derived([
    { key: "type", label: m.common.type(), mono: true },
    { key: "module", label: m.common.module(), muted: true, format: (r) => r.module ?? "—" },
    { key: "lastMessage", label: m.common.message(), format: (r) => truncate(r.lastMessage, 80), title: (r) => r.lastMessage ?? "" },
    { key: "count", label: m.common.count(), num: true },
    { key: "firstSeen", label: m.analytics.errorsColFirst(), num: true, muted: true, format: (r) => ago(r.firstSeen), sortValue: (r) => Date.parse(r.firstSeen) },
    { key: "lastSeen", label: m.analytics.tableColLast(), num: true, muted: true, format: (r) => ago(r.lastSeen), sortValue: (r) => Date.parse(r.lastSeen) },
    { key: "location", label: m.analytics.errorsColLocation(), mono: true, muted: true, format: (r) => r.location ?? "—" },
  ]);

  const sampleColumns: Column<ErrorOccurrenceRow>[] = $derived([
    { key: "hour", label: m.analytics.tableColHourUtc(), muted: true, format: (r) => stamp(r.hour) },
    { key: "bot", label: m.placeholders.categoryBot(), mono: true },
    { key: "shard", label: m.analytics.filterShard(), num: true, format: (r) => (r.shard === null ? "—" : String(r.shard)) },
    { key: "count", label: m.common.count(), num: true },
    { key: "lastGuildId", label: m.analytics.tableColGuild(), mono: true, format: (r) => r.lastGuildId ?? "—" },
    { key: "lastSeen", label: m.analytics.tableColLast(), num: true, muted: true, format: (r) => ago(r.lastSeen) },
    { key: "message", label: m.common.message(), format: (r) => truncate(r.message, 90), title: (r) => r.message ?? "" },
  ]);

  async function load() {
    const my = ++seq;
    loading = true;
    try {
      const f = $analyticsFilters;
      const result = await analyticsApi.errors({ limit, bot: f.bot || undefined, ...timeParams(f) });
      if (my !== seq) return;
      rows = result ?? [];
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Analytics error groups failed", err);
      rows = [];
    } finally {
      if (my === seq) loading = false;
    }
  }

  async function pick(row: ErrorGroupRow) {
    if (selected?.hash === row.hash && selected.type === row.type) {
      selected = null;
      samples = [];
      return;
    }
    selected = row;
    samplesLoading = true;
    try {
      const f = $analyticsFilters;
      samples = await analyticsApi.errorSamples({ type: row.type, module: row.module ?? undefined, hash: row.hash, bot: f.bot || undefined, limit: 24, ...timeParams(f) });
    } catch (err) {
      logger.warn("Analytics error samples failed", err);
      samples = [];
    } finally {
      samplesLoading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, limit];
    void load();
  });
</script>

<AnalyticsTable
  {columns}
  {rows}
  {loading}
  empty={m.analytics.errorsEmpty()}
  sortKey="count"
  onRowClick={pick}
  selected={(r) => selected?.hash === r.hash && selected.type === r.type}
/>

{#if selected}
  <div class="mt-3 rounded-lg border p-3" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05">
    <p class="text-xs mb-2 font-mono" style="color: {$colorStore.muted}">{m.analytics.errorsInRange({ type: selected.type, module: selected.module ?? "—", count: n(selected.count) })}</p>
    <AnalyticsTable columns={sampleColumns} rows={samples} loading={samplesLoading} empty={m.analytics.errorsSamplesEmpty()} sortKey="lastSeen" />
  </div>
{/if}
