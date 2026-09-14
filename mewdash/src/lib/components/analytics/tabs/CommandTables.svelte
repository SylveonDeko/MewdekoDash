<!-- lib/components/analytics/tabs/CommandTables.svelte -->
<script lang="ts">
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

  const topColumns: Column<TopCommandRow>[] = [
    { key: "command", label: "Command", mono: true },
    { key: "count", label: "Count", num: true },
    { key: "guilds", label: "Guilds", num: true },
    { key: "p95Ms", label: "p95", num: true, format: (r) => ms(r.p95Ms ?? r.avgMs), sortValue: (r) => r.p95Ms ?? r.avgMs },
    { key: "failureRate", label: "Err", num: true, format: (r) => pct(r.failureRate * 100), tone: (r) => (r.failureRate >= 0.25 ? "crit" : r.failureRate >= 0.05 ? "warn" : null) },
    { key: "module", label: "Module", muted: true, format: (r) => r.module ?? "—" },
  ];

  const invocationColumns: Column<InvocationPage["items"][number]>[] = [
    { key: "at", label: "When", muted: true, format: (r) => clock(r.at), sortValue: (r) => Date.parse(r.at) },
    { key: "bot", label: "Bot", mono: true },
    { key: "guildId", label: "Guild", mono: true, format: (r) => r.guildId ?? "—" },
    { key: "shard", label: "Shard", num: true, format: (r) => (r.shard === null ? "—" : String(r.shard)) },
    { key: "command", label: "Command", mono: true },
    { key: "kind", label: "Kind", tone: () => "muted" },
    { key: "durationMs", label: "ms", num: true },
    { key: "ackMs", label: "Ack", num: true, format: (r) => (r.ackMs === null ? "—" : ms(r.ackMs)) },
    { key: "ok", label: "Result", format: (r) => (r.ok ? "ok" : r.errorClass ?? "error"), tone: (r) => (r.ok ? "ok" : "crit"), title: (r) => r.errorMessage ?? "" },
  ];

  const failingColumns: Column<FailingCommandRow>[] = [
    { key: "command", label: "Command", mono: true },
    { key: "module", label: "Module", muted: true, format: (r) => r.module ?? "—" },
    { key: "errorClass", label: "Error class", tone: () => "crit" },
    { key: "count", label: "Failures", num: true },
    { key: "lastSeen", label: "Last seen", muted: true, format: (r) => stamp(r.lastSeen), sortValue: (r) => Date.parse(r.lastSeen) },
    { key: "lastMessage", label: "Last message", muted: true, format: (r) => truncate(r.lastMessage, 70) || "—", title: (r) => r.lastMessage ?? "" },
  ];

  const sampleColumns: Column<CommandErrorSampleRow>[] = [
    { key: "at", label: "When", muted: true, format: (r) => stamp(r.at), sortValue: (r) => Date.parse(r.at) },
    { key: "guildId", label: "Guild", mono: true, format: (r) => r.guildId ?? "—" },
    { key: "kind", label: "Kind", tone: () => "muted" },
    { key: "module", label: "Module", muted: true, format: (r) => r.module ?? "—" },
    { key: "durationMs", label: "ms", num: true },
    { key: "message", label: "Message", format: (r) => truncate(r.message, 90) || "—", title: (r) => r.message ?? "" },
  ];

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
  <Card title="Top commands" class="xl:col-span-2">
    <AnalyticsTable columns={topColumns} rows={top} loading={topLoading} sortKey="count" />
  </Card>
  <Card title="Invocation log" note="no user ids" class="xl:col-span-3">
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

<Card title="Top failing commands" note="row → samples">
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
  <Card title="Samples" note="exception messages only">
    <p class="text-xs mb-2 font-mono" style="color: {$colorStore.muted}">{selected.command} · {selected.errorClass}</p>
    <AnalyticsTable columns={sampleColumns} rows={samples} loading={samplesLoading} empty="No samples" sortKey="at" />
  </Card>
{/if}
