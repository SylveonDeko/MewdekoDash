<script lang="ts">
  import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from "chart.js";
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer, type MinecraftSnapshot } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Notify } from "./minecraftModel";

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  interface Props {
    guildId: bigint;
    servers: MinecraftServer[];
    notify: Notify;
  }

  let { guildId, servers, notify }: Props = $props();

  const PERIODS = [
    { label: "24h", value: 24 },
    { label: "7d", value: 168 },
    { label: "30d", value: 720 }
  ];

  let serverName: string | null = $state(null);
  let hours = $state(24);
  let snapshots: MinecraftSnapshot[] = $state([]);
  let loading = $state(false);
  let playersCanvas: HTMLCanvasElement | undefined = $state();
  let latencyCanvas: HTMLCanvasElement | undefined = $state();

  const options = $derived(servers.map(server => ({ id: server.name, name: server.name, icon: "fa-server" })));

  const summary = $derived.by(() => {
    const online = snapshots.filter(snapshot => snapshot.isOnline);
    const average = (pick: (snapshot: MinecraftSnapshot) => number) =>
      online.length ? Math.round(online.reduce((total, snapshot) => total + pick(snapshot), 0) / online.length) : 0;
    return [
      { label: m.minecraft.historyAvgPlayers(), value: String(average(snapshot => snapshot.playersOnline)) },
      { label: m.minecraft.historyPeakPlayers(), value: String(Math.max(...snapshots.map(snapshot => snapshot.playersOnline), 0)) },
      { label: m.minecraft.historyAvgLatency(), value: `${average(snapshot => snapshot.latency)}ms` },
      { label: m.common.uptime(), value: `${snapshots.length ? Math.round((online.length / snapshots.length) * 100) : 0}%` }
    ];
  });

  async function load() {
    if (!serverName) return;
    loading = true;
    try {
      snapshots = (await minecraftApi.getHistory(guildId, serverName, hours)) ?? [];
    } catch (err) {
      logger.error("Failed to load history:", err);
      snapshots = [];
      notify(m.minecraft.notifyHistoryFailed(), "error");
    } finally {
      loading = false;
    }
  }

  function draw(canvas: HTMLCanvasElement, values: number[], labels: string[], color: string, format: (value: number) => string) {
    const muted = $colorStore.muted;
    const grid = `${$colorStore.primary}10`;
    return new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0.4,
            pointRadius: values.length > 50 ? 0 : 3,
            pointBackgroundColor: color
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => format(Number(item.raw)) } } },
        scales: {
          x: { ticks: { color: muted, maxRotation: 45, autoSkip: true, maxTicksLimit: 8, font: { size: 11 } }, grid: { color: grid } },
          y: { beginAtZero: true, ticks: { color: muted, precision: 0, font: { size: 11 } }, grid: { color: grid } }
        }
      }
    });
  }

  $effect(() => {
    if (!serverName && servers.length) serverName = servers[0].name;
  });

  $effect(() => {
    if (serverName) void load();
  });

  $effect(() => {
    if (snapshots.length < 2 || !playersCanvas || !latencyCanvas) return;
    const labels = snapshots.map(snapshot => {
      const date = new Date(snapshot.timestamp);
      return hours <= 48
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
    });
    const players = draw(playersCanvas, snapshots.map(snapshot => snapshot.playersOnline), labels, $colorStore.primary, value => m.minecraft.chartPlayersLabel({ count: value }));
    const latency = draw(latencyCanvas, snapshots.map(snapshot => snapshot.latency), labels, "#f59e0b", value => m.minecraft.chartLatencyLabel({ ms: value }));
    return () => {
      players.destroy();
      latency.destroy();
    };
  });
</script>

{#if servers.length === 0}
  <PluginCard title={m.common.history()} alwaysOpen>
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-chart-simple" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.minecraft.serversEmptyTitle()}</p>
    </div>
  </PluginCard>
{:else}
  <PluginCard title={m.common.history()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SettingField label={m.minecraft.fieldServer()} id="mc-history-server">
        <DiscordSelector
          id="mc-history-server"
          type="custom"
          customIcon="fa-server"
          options={options}
          selected={serverName}
          clearable={false}
          placeholder={m.minecraft.historySelectServer()}
          onchange={(detail) => {
            if (typeof detail.selected === "string") serverName = detail.selected;
          }}
        />
      </SettingField>
      <div class="grid grid-cols-3 gap-2 self-end" role="group" aria-label={m.common.history()}>
        {#each PERIODS as period (period.value)}
          {@const selected = hours === period.value}
          <button
            type="button"
            class="min-h-[50px] rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => (hours = period.value)}
          >
            {period.label}
          </button>
        {/each}
      </div>
    </div>
  </PluginCard>

  {#if loading && !snapshots.length}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if snapshots.length > 1}
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each summary as stat (stat.label)}
        <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
          <div class="text-xs" style="color: {$colorStore.muted}">{stat.label}</div>
          <div class="text-lg font-semibold" style="color: {$colorStore.text}">{stat.value}</div>
        </div>
      {/each}
    </div>

    <PluginCard title={m.minecraft.historyPlayersOnline({ server: serverName ?? "" })} alwaysOpen>
      <div class="w-full h-[250px] relative"><canvas bind:this={playersCanvas}></canvas></div>
    </PluginCard>
    <PluginCard title={m.minecraft.historyLatency({ server: serverName ?? "" })} alwaysOpen>
      <div class="w-full h-[250px] relative"><canvas bind:this={latencyCanvas}></canvas></div>
    </PluginCard>
  {:else if serverName}
    <p class="text-center py-6" style="color: {$colorStore.muted}">{m.minecraft.historyNotEnough()}</p>
  {/if}
{/if}
