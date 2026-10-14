<!-- lib/components/analytics/tabs/CommandTables.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type {
    CommandErrorSampleRow,
    CommandQuery,
    FailingCommandRow,
    InvocationPage,
    TopCommandRow,
  } from "$lib/api/analytics/models";
  import { analyticsRefreshTick } from "$lib/stores/analyticsFilters";
  import { clock, ms, pct, stamp, truncate } from "../format";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";

  interface Props {
    query: CommandQuery;
  }

  let { query }: Props = $props();

  let top = $state<TopCommandRow[]>([]);
  let topLoading = $state(true);
  let failing = $state<FailingCommandRow[]>([]);
  let failingLoading = $state(true);
  let invocations = $state<InvocationPage>({ items: [], page: 1, pageSize: 25, total: 0 });
  let invocationsLoading = $state(true);
  let page = $state(1);
  let selected = $state<FailingCommandRow | null>(null);
  let samples = $state<CommandErrorSampleRow[]>([]);
  let samplesLoading = $state(false);
  let seq = 0;

  const topColumns: Column<TopCommandRow>[] = $derived([
    { key: "command", label: m.common.command(), mono: true },
    { key: "count", label: m.common.count(), num: true },
    { key: "guilds", label: m.analytics.pageTabGuilds(), num: true },
    { key: "p95Ms", label: "p95", num: true, format: (r) => ms(r.p95Ms ?? r.avgMs), sortValue: (r) => r.p95Ms ?? r.avgMs },
    { key: "failureRate", label: m.analytics.tableColErr(), num: true, format: (r) => pct(r.failureRate * 100), tone: (r) => (r.failureRate >= 0.25 ? "crit" : r.failureRate >= 0.05 ? "warn" : null) },
    { key: "module", label: m.common.module(), muted: true, format: (r) => r.module ?? "—" },
  ]);

  const invocationColumns: Column<InvocationPage["items"][number]>[] = $derived([
    { key: "at", label: m.common.when(), muted: true, format: (r) => clock(r.at), sortValue: (r) => Date.parse(r.at) },
    { key: "bot", label: m.placeholders.categoryBot(), mono: true },
    { key: "guildId", label: m.analytics.tableColGuild(), mono: true, format: (r) => r.guildId ?? "—" },
    { key: "shard", label: m.analytics.filterShard(), num: true, format: (r) => (r.shard === null ? "—" : String(r.shard)) },
    { key: "command", label: m.common.command(), mono: true },
    { key: "kind", label: m.analytics.tableColKind(), tone: () => "muted" },
    { key: "durationMs", label: m.analytics.tableColMs(), num: true },
    { key: "ackMs", label: m.analytics.tableColAck(), num: true, format: (r) => (r.ackMs === null ? "—" : ms(r.ackMs)) },
    { key: "ok", label: m.analytics.tableColResult(), format: (r) => (r.ok ? m.analytics.tabAlertsStateOk() : r.errorClass ?? m.common.error()), tone: (r) => (r.ok ? "ok" : "crit"), title: (r) => r.errorMessage ?? "" },
  ]);

  const failingColumns: Column<FailingCommandRow>[] = $derived([
    { key: "command", label: m.common.command(), mono: true },
    { key: "module", label: m.common.module(), muted: true, format: (r) => r.module ?? "—" },
    { key: "errorClass", label: m.analytics.tableColErrorClass(), tone: () => "crit" },
    { key: "count", label: m.analytics.tableColFailures(), num: true },
    { key: "lastSeen", label: m.analytics.tableColLastSeen(), muted: true, format: (r) => stamp(r.lastSeen), sortValue: (r) => Date.parse(r.lastSeen) },
    { key: "lastMessage", label: m.analytics.tableColLastMessage(), muted: true, format: (r) => truncate(r.lastMessage, 70) || "—", title: (r) => r.lastMessage ?? "" },
  ]);

  const sampleColumns: Column<CommandErrorSampleRow>[] = $derived([
    { key: "at", label: m.common.when(), muted: true, format: (r) => stamp(r.at), sortValue: (r) => Date.parse(r.at) },
    { key: "guildId", label: m.analytics.tableColGuild(), mono: true, format: (r) => r.guildId ?? "—" },
    { key: "kind", label: m.analytics.tableColKind(), tone: () => "muted" },
    { key: "module", label: m.common.module(), muted: true, format: (r) => r.module ?? "—" },
    { key: "durationMs", label: m.analytics.tableColMs(), num: true },
    { key: "message", label: m.common.message(), format: (r) => truncate(r.message, 90) || "—", title: (r) => r.message ?? "" },
  ]);

  async function loadAll() {
    const my = ++seq;
    topLoading = failingLoading = invocationsLoading = true;
    const [t, f, i] = await Promise.allSettled([
      analyticsApi.topCommands({ ...query, limit: 15 }),
      analyticsApi.failingCommands({ ...query, limit: 20 }),
      analyticsApi.invocations({ ...query, page, pageSize: 25 }),
    ]);
    if (my !== seq) return;
    top = t.status === "fulfilled" ? t.value ?? [] : [];
    failing = f.status === "fulfilled" ? f.value ?? [] : [];
    invocations = i.status === "fulfilled" && i.value ? i.value : { items: [], page, pageSize: 25, total: 0 };
    for (const r of [t, f, i]) if (r.status === "rejected") logger.warn("Command table failed", r.reason);
    topLoading = failingLoading = invocationsLoading = false;
  }

  async function pick(row: FailingCommandRow) {
    if (selected?.command === row.command && selected.errorClass === row.errorClass) {
      selected = null;
      samples = [];
      return;
    }
    selected = row;
    samplesLoading = true;
    try {
      const { range, from, to } = query;
      samples = await analyticsApi.commandErrorSamples({ range, from, to, command: row.command, error: row.errorClass, limit: 20 });
    } catch (err) {
      logger.warn("Command error samples failed", err);
      samples = [];
    } finally {
      samplesLoading = false;
    }
  }

  $effect(() => {
    void [query, page, $analyticsRefreshTick];
    void loadAll();
  });

  $effect(() => {
    void query;
    page = 1;
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
  <Card title={m.analytics.tabCommandsCardTop()} class="xl:col-span-2">
    <AnalyticsTable columns={topColumns} rows={top} loading={topLoading} sortKey="count" />
  </Card>
  <Card title={m.analytics.tabCommandsCardLog()} note={m.analytics.tabCommandsLogNote()} class="xl:col-span-3">
    <AnalyticsTable
      columns={invocationColumns}
      rows={invocations.items}
      loading={invocationsLoading}
      sortKey="at"
      page={invocations.page}
      pageSize={25}
      total={invocations.total}
      onPage={(p) => (page = p)}
    />
  </Card>
</div>

<Card title={m.analytics.tabCommandsCardFailing()} note={m.analytics.tabCommandsFailingNote()}>
  <AnalyticsTable
    columns={failingColumns}
    rows={failing}
    loading={failingLoading}
    sortKey="count"
    onRowClick={pick}
    selected={(r) => selected?.command === r.command && selected.errorClass === r.errorClass}
  />
</Card>

{#if selected}
  <Card title={m.analytics.tabCommandsCardSamples()} note={m.analytics.tabCommandsSamplesNote()}>
    <p class="text-xs mb-2 font-mono" style="color: {$colorStore.muted}">{selected.command} · {selected.errorClass}</p>
    <AnalyticsTable columns={sampleColumns} rows={samples} loading={samplesLoading} empty={m.analytics.tabCommandsNoSamples()} sortKey="at" />
  </Card>
{/if}
