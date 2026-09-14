<!-- lib/components/analytics/SimpleLineChart.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { CategoryScale, Chart, Filler, Legend, LineController, LineElement, LinearScale, PointElement, Tooltip, BarController, BarElement } from "chart.js";
  import { colorStore } from "$lib/stores/colorStore";
  import { compact } from "./format";
  import { GRID, PALETTE, SURFACE, TEXT, TEXT_STRONG } from "./palette";

  Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  export interface SimpleSeries {
    name: string;
    data: (number | null)[];
    color?: string;
  }

  interface Props {
    labels: string[];
    series: SimpleSeries[];
    type?: "line" | "bar";
    height?: number;
    unit?: string;
    format?: (v: number) => string;
    loading?: boolean;
    empty?: string;
    beginAtZero?: boolean;
  }

  let {
    labels,
    series,
    type = "line",
    height = 160,
    unit = "",
    format = compact,
    loading = false,
    empty = "No data",
    beginAtZero = false,
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let chart: Chart<"line" | "bar", (number | null)[], string> | null = null;

  let hasData = $derived(labels.length > 0 && series.some((s) => s.data.some((v) => v !== null)));

  function datasets() {
    const single = series.length === 1;
    return series.map((s, i) => {
      const color = s.color ?? (single ? $colorStore.primary : PALETTE[i % PALETTE.length]);
      return type === "bar"
        ? { type: "bar" as const, label: s.name, data: s.data, backgroundColor: color, borderRadius: 3, maxBarThickness: 22 }
        : { type: "line" as const, label: s.name, data: s.data, borderColor: color, backgroundColor: `${color}20`, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.25, fill: single, spanGaps: true };
    });
  }

  $effect(() => {
    void [labels, series, type];
    if (!canvas || !hasData) {
      chart?.destroy();
      chart = null;
      return;
    }
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets();
      chart.update();
      return;
    }
    chart = new Chart(canvas, {
      type,
      data: { labels, datasets: datasets() },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: series.length > 1, position: "top", align: "end", labels: { color: TEXT, boxWidth: 10, boxHeight: 10, font: { size: 11 } } },
          tooltip: {
            backgroundColor: SURFACE,
            titleColor: TEXT_STRONG,
            bodyColor: TEXT_STRONG,
            borderColor: GRID,
            borderWidth: 1,
            callbacks: {
              label: (item) => {
                const v = item.parsed.y as number | null;
                return `${item.dataset.label ?? ""}: ${v === null ? "—" : format(v)}${unit ? ` ${unit}` : ""}`;
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: TEXT, font: { size: 10 }, autoSkip: true, maxTicksLimit: 12, maxRotation: 0 }, grid: { color: GRID } },
          y: { beginAtZero, ticks: { color: TEXT, font: { size: 10 }, callback: (v) => format(Number(v)) }, grid: { color: GRID } },
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
  {#if !hasData}
    <div class="absolute inset-0 flex items-center justify-center text-xs" style="color: {$colorStore.muted}">
      {#if loading}
        <div class="h-3 w-24 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
      {:else}
        <i class="fa-solid fa-chart-line mr-2"></i>{empty}
      {/if}
    </div>
  {/if}
</div>
