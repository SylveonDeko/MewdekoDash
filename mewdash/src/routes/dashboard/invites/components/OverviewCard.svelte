<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { inviteTrackingApi, type InviteAnalytics, type StatsRangeValue } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SimpleLineChart from "$lib/components/analytics/SimpleLineChart.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import RankList from "$lib/components/stats/RankList.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatDate, formatNumber, formatPercent, formatSigned } from "$lib/components/stats/format";
  import RangePicker from "./RangePicker.svelte";
  import { errorText } from "./inviteModel";

  interface Props {
    guildId: bigint;
    onmember: (userId: string) => void;
    onerror: (message: string) => void;
  }

  let { guildId, onmember, onerror }: Props = $props();

  let range = $state(3);
  let analytics: InviteAnalytics | null = $state(null);
  let loaded = $state(false);

  const points = $derived.by(() => (analytics as InviteAnalytics | null)?.series ?? []);
  const labels = $derived(points.map(point => formatDate(point.day)));
  const series = $derived([
    { name: m.common.joins(), data: points.map(point => point.joins), color: "#4ade80" },
    { name: m.common.leaves(), data: points.map(point => point.leaves), color: "#f87171" }
  ]);

  async function load() {
    try {
      analytics = await inviteTrackingApi.getAnalytics(guildId, range as StatsRangeValue);
    } catch (err) {
      logger.error("Failed to load invite analytics:", err);
      onerror(errorText(err, m.common.failedToLoadAnalytics()));
    } finally {
      loaded = true;
    }
  }

  function pick(value: number) {
    range = value;
    void load();
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.invites.overviewTitle()} alwaysOpen>
  <RangePicker value={range} onchange={pick} />

  {#if analytics}
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatTile label={m.common.joins()} value={formatNumber(analytics.joins)} />
      <StatTile label={m.common.leaves()} value={formatNumber(analytics.leaves)} />
      <StatTile label={m.common.netGrowth()} value={formatSigned(analytics.netGrowth)} tone={analytics.netGrowth >= 0 ? "ok" : "crit"} />
      <StatTile label={m.common.retention()} value={formatPercent(analytics.retention ?? null)} sub={m.invites.statStayed({ count: formatNumber(analytics.stayed) })} />
      <StatTile label={m.invites.statFakeJoins()} value={formatNumber(analytics.fakeJoins)} tone={analytics.fakeJoins > 0 ? "warn" : null} />
      <StatTile
        label={m.invites.statViaInvites()}
        value={formatNumber(analytics.sources.invite)}
        sub={m.invites.statSources({ vanity: analytics.sources.vanity, bots: analytics.sources.bot, unknown: analytics.sources.unknown })}
      />
    </div>

    <SimpleLineChart {labels} {series} height={200} beginAtZero empty={m.invites.overviewChartEmpty()} />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="min-w-0 space-y-2">
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.topInviters()}</h4>
        {#if analytics.topInviters.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.overviewTopInvitersEmpty()}</p>
        {:else}
          <RankList
            rows={analytics.topInviters.map((x, i) => ({
              rank: i + 1,
              id: x.userId.toString(),
              name: x.username,
              value: formatNumber(x.total),
              detail: m.invites.topInviterDetail({ regular: x.regular, left: x.left, fake: x.fake })
            }))}
            onselect={(row) => onmember(row.id)}
          />
        {/if}
      </div>
      <div class="min-w-0 space-y-2">
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.invites.overviewTopCodes()}</h4>
        {#if analytics.topCodes.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.overviewTopCodesEmpty()}</p>
        {:else}
          {#each analytics.topCodes as code (code.code)}
            <div class="flex items-center justify-between gap-3 rounded-xl border p-3 min-h-[56px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <div class="min-w-0">
                <p class="font-mono text-sm truncate" style="color: {$colorStore.text}">{code.code}</p>
                {#if code.label}
                  <p class="text-xs truncate" style="color: {$colorStore.muted}">{code.label}</p>
                {/if}
              </div>
              <span class="font-semibold tabular-nums" style="color: {$colorStore.text}">{formatNumber(code.joins)}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {:else if loaded}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.overviewEmpty()}</p>
  {/if}
</PluginCard>
