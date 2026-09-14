<!-- lib/components/analytics/ScatterChart.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { Chart, LinearScale, LogarithmicScale, PointElement, ScatterController, Tooltip } from "chart.js";
  import { colorStore } from "$lib/stores/colorStore";
  import { compact } from "./format";
  import { GRID, SURFACE, TEXT, TEXT_STRONG } from "./palette";

  Chart.register(ScatterController, PointElement, LinearScale, LogarithmicScale, Tooltip);

  export interface ScatterPoint {
    x: number;
    y: number;
    label: string;
  }

  interface Props {
    points: ScatterPoint[];
    xLabel?: string;
    yLabel?: string;
    logX?: boolean;
    height?: number;
    loading?: boolean;
    empty?: string;
  }

  let { points, xLabel = "", yLabel = "", logX = true, height = 220, loading = false, empty = "No data" }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let chart: Chart<"scatter", ScatterPoint[], string> | null = null;

  let usable = $derived(points.filter((p) => !logX || p.x > 0));

  $effect(() => {
    void [usable, $colorStore.primary];
    if (!canvas || usable.length === 0) {
      chart?.destroy();
      chart = null;
      return;
    }
    if (chart) {
      chart.data.datasets[0].data = usable;
      chart.data.datasets[0].backgroundColor = `${$colorStore.primary}b0`;
      chart.update();
      return;
    }
    chart = new Chart<"scatter", ScatterPoint[], string>(canvas, {
      type: "scatter",
      data: { datasets: [{ data: usable, backgroundColor: `${$colorStore.primary}b0`, pointRadius: 4, pointHoverRadius: 6 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: SURFACE,
            titleColor: TEXT_STRONG,
            bodyColor: TEXT_STRONG,
            borderColor: GRID,
            borderWidth: 1,
            callbacks: {
              label: (item) => {
                const p = item.raw as ScatterPoint;
                return `${p.label} · ${compact(p.x)} ${xLabel} · ${p.y} ${yLabel}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: logX ? "logarithmic" : "linear",
            title: { display: !!xLabel, text: xLabel, color: TEXT, font: { size: 10 } },
            ticks: { color: TEXT, font: { size: 10 }, callback: (v) => compact(Number(v)) },
            grid: { color: GRID },
          },
          y: {
            beginAtZero: true,
            title: { display: !!yLabel, text: yLabel, color: TEXT, font: { size: 10 } },
            ticks: { color: TEXT, font: { size: 10 }, precision: 0 },
            grid: { color: GRID },
          },
        },
      },
    });
  });

  onDestroy(() => {
    chart?.destroy();
    chart = null;
  });
</script>

<div class="relative w-full" style="height: {height}px">
  <canvas bind:this={canvas} class:opacity-30={loading}></canvas>
  {#if usable.length === 0}
    <div class="absolute inset-0 flex items-center justify-center text-xs" style="color: {$colorStore.muted}">
      {#if loading}
        <div class="h-3 w-24 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
      {:else}
        <i class="fa-solid fa-chart-scatter mr-2"></i>{empty}
      {/if}
    </div>
  {/if}
</div>
