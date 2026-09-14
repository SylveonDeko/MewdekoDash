<!-- lib/components/analytics/tabs/AiTab.svelte -->
<script lang="ts">
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AiGuildRow, AiModelRow, AiSummary } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams, timeParams } from "$lib/stores/analyticsFilters";
  import { compact, ms, n, pct, usd } from "../format";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import StatTile from "../StatTile.svelte";

  let summary = $state<AiSummary | null>(null);
  let summaryLoading = $state(true);
  let guilds = $state<AiGuildRow[]>([]);
  let guildsLoading = $state(true);
  let seq = 0;

  const modelColumns: Column<AiModelRow>[] = [
    { key: "model", label: "Model", mono: true },
    { key: "provider", label: "Provider", muted: true, format: (r) => r.provider ?? "—" },
    { key: "requests", label: "Requests", num: true, format: (r) => n(r.requests) },
    { key: "failures", label: "Failed", num: true, format: (r) => pct(r.requests ? (r.failures / r.requests) * 100 : 0), sortValue: (r) => (r.requests ? r.failures / r.requests : 0), tone: (r) => (r.requests && r.failures / r.requests >= 0.1 ? "crit" : r.failures ? "warn" : null) },
    { key: "tokensIn", label: "Tokens in", num: true, format: (r) => compact(r.tokensIn) },
    { key: "tokensOut", label: "Tokens out", num: true, format: (r) => compact(r.tokensOut) },
    { key: "p95Ms", label: "p95", num: true, format: (r) => ms(r.p95Ms) },
    { key: "costUsd", label: "Cost", num: true, format: (r) => usd(r.costUsd) },
  ];

  const guildColumns: Column<AiGuildRow>[] = [
    { key: "guildId", label: "Guild", mono: true },
    { key: "name", label: "Name", format: (r) => r.name ?? "—" },
    { key: "count", label: "Uses", num: true },
    { key: "errors", label: "Errors", num: true },
    { key: "errorPct", label: "Err %", num: true, muted: true, format: (r) => pct(r.count ? (r.errors / r.count) * 100 : 0), sortValue: (r) => (r.count ? r.errors / r.count : 0) },
  ];

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    summaryLoading = guildsLoading = true;
    const [s, g] = await Promise.allSettled([
      analyticsApi.aiSummary(queryParams(f, ["bot"])),
      analyticsApi.aiGuilds({ ...timeParams(f), bot: f.bot || undefined, limit: 25 }),
    ]);
    if (my !== seq) return;
    summary = s.status === "fulfilled" ? s.value ?? null : null;
    guilds = g.status === "fulfilled" ? g.value ?? [] : [];
    for (const r of [s, g]) if (r.status === "rejected") logger.warn("AI tab query failed", r.reason);
    summaryLoading = guildsLoading = false;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <StatTile label="Requests" value={n(summary?.requests)} loading={summaryLoading} />
    <StatTile label="Tokens in" value={compact(summary?.tokensIn)} loading={summaryLoading} />
    <StatTile label="Tokens out" value={compact(summary?.tokensOut)} loading={summaryLoading} />
    <StatTile label="Est. cost" value={usd(summary?.costUsd)} sub="list prices · priced models only" loading={summaryLoading} />
  </div>

  <Card title="By model">
    <AnalyticsTable columns={modelColumns} rows={summary?.models ?? []} loading={summaryLoading} empty="No AI requests" sortKey="requests" />
  </Card>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title="Requests by model">
      <AnalyticsChart metric="ai.requests" agg="sum" groupBy="model" max={8} filters={["bot"]} type="bar" stack unit="requests" />
    </Card>
    <Card title="Tokens by model" note="in + out">
      <AnalyticsChart metric="ai.tokens" agg="sum" groupBy="model" max={8} filters={["bot"]} type="area" unit="tokens" totalToggle />
    </Card>
    <Card title="Duration p95 by model">
      <AnalyticsChart metric="ai.duration" agg="p95" groupBy="model" max={8} filters={["bot"]} unit="ms" noCompare />
    </Card>
  </div>

  <Card title="Top guilds" note="ai_chat feature use">
    <AnalyticsTable columns={guildColumns} rows={guilds} loading={guildsLoading} empty="No guild use" sortKey="count" pageSize={15} />
  </Card>
</div>
