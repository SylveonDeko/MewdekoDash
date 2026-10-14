<!-- lib/components/analytics/tabs/AiTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
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

  const modelColumns: Column<AiModelRow>[] = $derived([
    { key: "model", label: m.common.model(), mono: true },
    { key: "provider", label: m.common.provider(), muted: true, format: (r) => r.provider ?? "—" },
    { key: "requests", label: m.analytics.tabAiColRequests(), num: true, format: (r) => n(r.requests) },
    { key: "failures", label: m.common.failed(), num: true, format: (r) => pct(r.requests ? (r.failures / r.requests) * 100 : 0), sortValue: (r) => (r.requests ? r.failures / r.requests : 0), tone: (r) => (r.requests && r.failures / r.requests >= 0.1 ? "crit" : r.failures ? "warn" : null) },
    { key: "tokensIn", label: m.analytics.tabAiColTokensIn(), num: true, format: (r) => compact(r.tokensIn) },
    { key: "tokensOut", label: m.analytics.tabAiColTokensOut(), num: true, format: (r) => compact(r.tokensOut) },
    { key: "p95Ms", label: "p95", num: true, format: (r) => ms(r.p95Ms) },
    { key: "costUsd", label: m.analytics.tabAiColCost(), num: true, format: (r) => usd(r.costUsd) },
  ]);

  const guildColumns: Column<AiGuildRow>[] = $derived([
    { key: "guildId", label: m.analytics.tableColGuild(), mono: true },
    { key: "name", label: m.common.name(), format: (r) => r.name ?? "—" },
    { key: "count", label: m.analytics.tabAiColUses(), num: true },
    { key: "errors", label: m.common.errors(), num: true },
    { key: "errorPct", label: m.analytics.tabAiColErrPct(), num: true, muted: true, format: (r) => pct(r.count ? (r.errors / r.count) * 100 : 0), sortValue: (r) => (r.count ? r.errors / r.count : 0) },
  ]);

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
    <StatTile label={m.analytics.tabAiColRequests()} value={n(summary?.requests)} loading={summaryLoading} />
    <StatTile label={m.analytics.tabAiColTokensIn()} value={compact(summary?.tokensIn)} loading={summaryLoading} />
    <StatTile label={m.analytics.tabAiColTokensOut()} value={compact(summary?.tokensOut)} loading={summaryLoading} />
    <StatTile label={m.analytics.tabAiEstCost()} value={usd(summary?.costUsd)} sub={m.analytics.tabAiCostSub()} loading={summaryLoading} />
  </div>

  <Card title={m.analytics.tabAiCardByModel()}>
    <AnalyticsTable columns={modelColumns} rows={summary?.models ?? []} loading={summaryLoading} empty={m.analytics.tabAiEmptyRequests()} sortKey="requests" />
  </Card>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabAiCardRequestsModel()}>
      <AnalyticsChart metric="ai.requests" agg="sum" groupBy="model" max={8} filters={["bot"]} type="bar" stack unit={m.analytics.unitRequests()} />
    </Card>
    <Card title={m.analytics.tabAiCardTokensModel()} note={m.analytics.tabAiTokensNote()}>
      <AnalyticsChart metric="ai.tokens" agg="sum" groupBy="model" max={8} filters={["bot"]} type="area" unit={m.analytics.unitTokens()} totalToggle />
    </Card>
    <Card title={m.analytics.tabAiCardDurationModel()}>
      <AnalyticsChart metric="ai.duration" agg="p95" groupBy="model" max={8} filters={["bot"]} unit="ms" noCompare />
    </Card>
  </div>

  <Card title={m.analytics.tabAiCardTopGuilds()} note={m.analytics.tabAiGuildsNote()}>
    <AnalyticsTable columns={guildColumns} rows={guilds} loading={guildsLoading} empty={m.analytics.tabAiEmptyGuilds()} sortKey="count" pageSize={15} />
  </Card>
</div>
