<!-- lib/components/StatsGraph.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GraphStatsResponse } from "$lib/api/joinleave/models/GraphStats";
  import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from "chart.js";

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  interface Props {
    data: GraphStatsResponse;
    type?: "join" | "leave";
    totalLabel?: string;
    averageLabel?: string;
    peakLabel?: string;
    valueLabel?: string;
    formatLabelsAsDates?: boolean;
  }

  let {
    data,
    type = "join",
    totalLabel,
    averageLabel = "Average per Day",
    peakLabel = "Peak Day",
    valueLabel,
    formatLabelsAsDates = true
  }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let chart: Chart | null = null;

  function formatAverage(average: string | number): string {
    const numValue = typeof average === "string" ? parseFloat(average) : average;
    return numValue.toFixed(2);
  }

  function defaultValueLabel(): string {
    return type === "join" ? "Joins" : "Leaves";
  }

  function formatLabel(label: string): string {
    if (!formatLabelsAsDates) return label;

    const date = new Date(label);
    if (Number.isNaN(date.getTime())) return label;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function createChart() {
    if (!canvas || !data?.dailyStats?.length) return;
    chart?.destroy();

    const labels = data.dailyStats.map(d => formatLabel(d.date));
    const values = data.dailyStats.map(d => d.count);
    const primary = $colorStore.primary;
    const muted = $colorStore.muted;

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: primary,
          backgroundColor: primary + "20",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: primary,
          pointBorderColor: primary,
          pointHoverRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a1a2e",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: primary + "40",
            borderWidth: 1,
            callbacks: {
              title: (items) => items[0]?.label || "",
              label: (item) => `${valueLabel || defaultValueLabel()}: ${item.raw}`,
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: muted,
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10,
              font: { size: 11 }
            },
            grid: { color: primary + "10" }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: muted,
              precision: 0,
              font: { size: 11 }
            },
            grid: { color: primary + "10" }
          }
        }
      }
    });
  }

  onMount(() => {
    createChart();
  });

  onDestroy(() => {
    chart?.destroy();
  });

  $effect(() => {
    if (canvas && data && $colorStore.primary) {
      createChart();
    }
  });
</script>

{#if data && data !== undefined}
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">{totalLabel || `Total ${defaultValueLabel()}`}</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">{data.summary.total}</div>
      </div>

      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">{averageLabel}</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">
          {formatAverage(data.summary.average)}
        </div>
      </div>

      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">{peakLabel}</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">
          {formatLabel(data.summary.peakDate)}
          <span class="text-sm" style="color: {$colorStore.muted}">({data.summary.peakCount})</span>
        </div>
      </div>
    </div>

    <div class="w-full h-[300px] relative">
      <canvas bind:this={canvas}></canvas>
    </div>
  </div>
{/if}
