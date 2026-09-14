<!-- lib/components/analytics/tabs/WebsiteTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { RouteErrorRow, RouteRow, WebsiteFunnel } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { ago, compact, ms, n, pct, utcParse } from "../format";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import StatTile from "../StatTile.svelte";

  let routes = $state<RouteRow[]>([]);
  let routesLoading = $state(true);
  let errors = $state<RouteErrorRow[]>([]);
  let errorsLoading = $state(true);
  let funnel = $state<WebsiteFunnel | null>(null);
  let funnelLoading = $state(true);
  let seq = 0;

  let visitors = $derived(routes.reduce((a, r) => a + r.visitors, 0));

  let steps = $derived.by(() => {
    if (!funnel) return [];
    const list = [
      { label: "Login", visitors: funnel.loginVisitors, views: funnel.loginViews },
      { label: "OAuth callback", visitors: funnel.callbackVisitors, views: funnel.callbackViews },
      { label: "Dashboard", visitors: funnel.dashboardVisitors, views: funnel.dashboardViews },
    ];
    const peak = Math.max(1, ...list.map((s) => s.visitors));
    return list.map((s, i) => ({
      ...s,
      width: Math.max(2, (s.visitors / peak) * 100),
      drop: i === 0 || !list[i - 1].visitors ? null : (1 - s.visitors / list[i - 1].visitors) * 100,
    }));
  });

  const routeColumns: Column<RouteRow>[] = [
    { key: "route", label: "Route", mono: true },
    { key: "views", label: "Views", num: true, format: (r) => compact(r.views) },
    { key: "visitors", label: "Visitors", num: true, format: (r) => compact(r.visitors) },
    { key: "p95Ms", label: "p95", num: true, format: (r) => ms(r.p95Ms) },
    { key: "errors", label: "5xx", num: true, tone: (r) => (r.errors ? "crit" : null) },
  ];

  const errorColumns: Column<RouteErrorRow>[] = [
    { key: "route", label: "Route", mono: true },
    { key: "status", label: "Status", tone: (r) => (r.status >= 500 ? "crit" : "warn") },
    { key: "count", label: "Count", num: true },
    { key: "lastSeen", label: "Last", num: true, muted: true, format: (r) => ago(r.lastSeen), sortValue: (r) => utcParse(r.lastSeen) },
  ];

  async function load() {
    const my = ++seq;
    const t = timeParams($analyticsFilters);
    routesLoading = errorsLoading = funnelLoading = true;
    const [r, e, f] = await Promise.allSettled([
      analyticsApi.websiteRoutes({ ...t, limit: 50 }),
      analyticsApi.websiteErrors({ ...t, limit: 50 }),
      analyticsApi.websiteFunnel(t),
    ]);
    if (my !== seq) return;
    routes = r.status === "fulfilled" ? r.value ?? [] : [];
    errors = e.status === "fulfilled" ? e.value ?? [] : [];
    funnel = f.status === "fulfilled" ? f.value ?? null : null;
    for (const x of [r, e, f]) if (x.status === "rejected") logger.warn("Website tab query failed", x.reason);
    routesLoading = errorsLoading = funnelLoading = false;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <AnalyticsTile label="Page views" metric="page.view" agg="sum" format="int" filters={[]} />
    <StatTile label="Visitors" value={compact(visitors)} sub="sum over routes" loading={routesLoading} />
    <AnalyticsTile label="Request p95" metric="page.duration" agg="p95" format="ms" filters={[]} unit="ms" />
    <AnalyticsTile label="5xx" metric="page.view" agg="sum" format="int" filters={[]} fixed={{ status: "5xx" }} sparkTone="crit" />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Views by route" note="top routes, rest folded">
      <AnalyticsChart metric="page.view" agg="sum" groupBy="route" max={8} filters={[]} type="area" unit="views" totalToggle />
    </Card>
    <Card title="Request duration" note="p50 · p95 · p99">
      <AnalyticsChart metric="page.duration" aggs={["p50", "p95", "p99"]} filters={[]} unit="ms" noCompare />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title="Routes" class="xl:col-span-2">
      <AnalyticsTable columns={routeColumns} rows={routes} loading={routesLoading} empty="No page views" sortKey="views" pageSize={15} />
    </Card>
    <Card title="Errors" note="4xx · 5xx">
      <AnalyticsTable columns={errorColumns} rows={errors} loading={errorsLoading} empty="No errors" sortKey="count" pageSize={15} />
    </Card>
  </div>

  <Card title="Login funnel" note="distinct visitors · views in brackets">
    {#if funnelLoading && !funnel}
      <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
    {:else if steps.length === 0}
      <p class="text-xs py-2" style="color: {$colorStore.muted}">No data</p>
    {:else}
      <div class="space-y-2">
        {#each steps as s (s.label)}
          <div class="flex items-center gap-3">
            <span class="w-28 shrink-0 text-xs" style="color: {$colorStore.text}">{s.label}</span>
            <span class="flex-1 h-6 rounded overflow-hidden" style="background: {$colorStore.primary}10">
              <span class="block h-full rounded" style="width: {s.width}%; background: {$colorStore.primary}"></span>
            </span>
            <span class="w-24 shrink-0 text-right text-xs tabular-nums" style="color: {$colorStore.text}">{n(s.visitors)} <span style="color: {$colorStore.muted}">({compact(s.views)})</span></span>
            <span class="w-16 shrink-0 text-right text-xs tabular-nums" style="color: {s.drop !== null && s.drop > 50 ? '#f87171' : $colorStore.muted}">{s.drop === null ? "" : `−${pct(s.drop, 0)}`}</span>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>
