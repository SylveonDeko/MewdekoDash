<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, onMount } from "svelte";
  import {
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip
  } from "chart.js";
  import { currencyApi } from "$lib/api/index.ts";
  import type { EconomyAnalytics } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { formatNumber, formatPercent, formatSigned, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  let analytics = $state<EconomyAnalytics | null>(null);
  let loading = $state(true);
  let windowDays = $state(30);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let chart: Chart<"line", number[], string> | null = null;

  const windows = $derived([
    { days: 7, label: m.currency.window7d() },
    { days: 30, label: m.currency.window30d() },
    { days: 90, label: m.currency.window90d() },
    { days: 365, label: m.currency.window1y() }
  ]);

  const faucets = $derived((analytics?.flow ?? []).filter((f) => f.net > 0));
  const sinks = $derived((analytics?.flow ?? []).filter((f) => f.net <= 0));
  const largestFlow = $derived(Math.max(1, ...(analytics?.flow ?? []).map((f) => Math.abs(f.net))));

  const tiles = $derived(
    analytics
      ? [
          { label: m.currency.statMoneySupply(), value: formatNumber(analytics.snapshot.moneySupply), sub: m.currency.statHolders({ count: formatNumber(analytics.snapshot.holders) }) },
          { label: m.currency.statNetChange(), value: formatSigned(analytics.snapshot.netChange), sub: m.currency.statOverDays({ count: analytics.windowDays }) },
          { label: m.currency.statGini(), value: analytics.snapshot.gini.toFixed(3), sub: m.currency.statTopTen({ share: formatPercent(analytics.snapshot.topTenPercentShare) }) },
          { label: m.currency.statMedian(), value: formatNumber(analytics.snapshot.median), sub: m.currency.statMean({ value: formatNumber(analytics.snapshot.mean) }) }
        ]
      : []
  );

  async function load() {
    loading = true;
    try {
      analytics = await currencyApi.getAnalytics(guildId, windowDays);
    } catch (err) {
      logger.error("Failed to load analytics", err);
      notify(m.common.failedToLoadAnalytics(), "error");
    } finally {
      loading = false;
    }
  }

  function draw() {
    if (!canvas || !analytics) return;
    chart?.destroy();
    const points = analytics.supplyHistory;
    let running = 0;
    const cumulative = points.map((p) => (running += p.net));
    const sparse = points.length < 3;

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: points.map((p) => new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
        datasets: [
          {
            label: m.currency.chartCumulative(),
            data: cumulative,
            borderColor: $colorStore.primary,
            backgroundColor: `${$colorStore.primary}20`,
            fill: true,
            tension: 0.3,
            pointRadius: sparse ? 5 : 0,
            pointHoverRadius: sparse ? 7 : 4,
            pointBackgroundColor: $colorStore.primary,
            borderWidth: 2
          },
          {
            label: m.currency.chartDailyNet(),
            data: points.map((p) => p.net),
            borderColor: $colorStore.accent,
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
            pointRadius: sparse ? 5 : 0,
            pointHoverRadius: sparse ? 7 : 4,
            pointBackgroundColor: $colorStore.accent,
            borderWidth: 1,
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: $colorStore.text } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatSigned(Number(ctx.parsed.y))}` } }
        },
        scales: {
          x: { ticks: { color: $colorStore.muted }, grid: { color: `${$colorStore.muted}20` } },
          y: { ticks: { color: $colorStore.muted }, grid: { color: `${$colorStore.muted}20` } }
        }
      }
    });
  }

  $effect(() => {
    if (canvas && analytics) draw();
  });

  onMount(() => {
    void load();
  });
  onDestroy(() => chart?.destroy());
</script>

<div class="space-y-4 min-w-0">
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={m.common.window()}>
    {#each windows as option (option.days)}
      {@const selected = windowDays === option.days}
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        onclick={() => {
          windowDays = option.days;
          void load();
        }}
      >
        {option.label}
      </button>
    {/each}
  </div>

  {#if analytics && analytics.snapshot.holders > 0}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {#each tiles as tile (tile.label)}
        <StatTile label={tile.label} value={tile.value} sub={tile.sub} />
      {/each}
    </div>

    <PluginCard title={m.currency.supplyTitle()} alwaysOpen>
      {#if analytics.supplyHistory.length > 0}
        <div class="h-64 md:h-80">
          <canvas bind:this={canvas}></canvas>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.supplyEmpty()}</p>
      {/if}
    </PluginCard>

    <PluginCard title={m.currency.whereTitle()} alwaysOpen>
      <div class="flex h-6 rounded-full overflow-hidden" style="background: {$colorStore.primary}10;">
        {#if analytics.snapshot.moneySupply > 0}
          <div style="width: {(analytics.snapshot.inWallets / analytics.snapshot.moneySupply) * 100}%; background: {$colorStore.primary}; color: {$colorStore.onPrimary};"></div>
          <div style="width: {(analytics.snapshot.inBanks / analytics.snapshot.moneySupply) * 100}%; background: {$colorStore.secondary}; color: {$colorStore.onSecondary};"></div>
        {/if}
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"></span>
          <span style="color: {$colorStore.text}">{m.currency.whereWallets({ amount: formatNumber(analytics.snapshot.inWallets) })}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: {$colorStore.secondary}; color: {$colorStore.onSecondary};"></span>
          <span style="color: {$colorStore.text}">{m.currency.whereBanked({ amount: formatNumber(analytics.snapshot.inBanks) })}</span>
        </div>
      </div>
    </PluginCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {#each [{ title: m.currency.flowFaucets(), data: faucets, color: $colorStore.primary }, { title: m.currency.flowSinks(), data: sinks, color: $colorStore.accent }] as panel (panel.title)}
        <PluginCard title={panel.title} alwaysOpen>
          {#if panel.data.length === 0}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.flowEmpty()}</p>
          {:else}
            <div class="space-y-3">
              {#each panel.data as bucket (bucket.category)}
                <div>
                  <div class="flex justify-between gap-3 text-sm mb-1">
                    <span class="min-w-0 truncate" style="color: {$colorStore.text}">{bucket.category}</span>
                    <span class="shrink-0 tabular-nums" style="color: {$colorStore.text}">{formatSigned(bucket.net)}</span>
                  </div>
                  <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}10;">
                    <div class="h-full rounded-full" style="width: {(Math.abs(bucket.net) / largestFlow) * 100}%; background: {panel.color};"></div>
                  </div>
                  <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {bucket.entries === 1 ? m.currency.flowEntriesOne({ count: formatNumber(bucket.entries) }) : m.currency.flowEntriesOther({ count: formatNumber(bucket.entries) })}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </PluginCard>
      {/each}
    </div>

    {#if analytics.transferTax > 0}
      <p class="text-sm px-1" style="color: {$colorStore.muted}">{m.currency.transferTaxNote({ amount: formatNumber(analytics.transferTax) })}</p>
    {/if}

    <PluginCard title={m.currency.gamesTitle()} alwaysOpen>
      {#if analytics.games.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.gamesEmpty()}</p>
      {:else}
        <div class="space-y-2">
          {#each analytics.games as game (game.game)}
            <div class="rounded-lg p-3 space-y-2" style="background: {$colorStore.primary}08;">
              <div class="flex items-center justify-between gap-3">
                <span class="font-medium text-sm min-w-0 truncate" style="color: {$colorStore.text}">{game.game}</span>
                <span class="text-sm font-semibold shrink-0" style="color: {game.actualRtp > 1 ? '#ef4444' : game.actualRtp > 0.97 ? '#f59e0b' : '#10b981'}">
                  {m.currency.gamesColRtp()} {formatPercent(game.actualRtp)}
                </span>
              </div>
              <dl class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {#each [
                  { label: m.currency.gamesColWagered(), value: formatNumber(game.wagered) },
                  { label: m.currency.gamesColReturned(), value: formatNumber(game.returned) },
                  { label: m.currency.gamesColHouse(), value: formatSigned(game.houseTake) },
                  { label: m.currency.gamesColPlays(), value: formatNumber(game.plays) },
                  { label: m.common.players(), value: formatNumber(game.players) }
                ] as item (item.label)}
                  <div>
                    <dt style="color: {$colorStore.muted}">{item.label}</dt>
                    <dd class="tabular-nums" style="color: {$colorStore.text}">{item.value}</dd>
                  </div>
                {/each}
              </dl>
            </div>
          {/each}
        </div>
      {/if}
    </PluginCard>
  {:else if !loading}
    <p class="text-sm px-1" style="color: {$colorStore.muted}">{m.currency.analyticsEmpty()}</p>
  {/if}
</div>
