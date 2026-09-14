<!-- lib/components/analytics/AnalyticsChart.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    type ChartDataset,
    type Plugin,
  } from "chart.js";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AlertBand, AnalyticsAgg, SeriesResult } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams, rangeSeconds } from "$lib/stores/analyticsFilters";
  import { bucketLabel, bytes, compact } from "./format";
  import { GRID, PALETTE, SURFACE, TEXT, TEXT_STRONG, seriesColor, severityColor } from "./palette";

  Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  type Kind = "line" | "bar";
  type Dataset = ChartDataset<Kind, (number | null)[]>;

  interface Props {
    metric: string;
    agg?: AnalyticsAgg;
    /** Several aggregations of the same metric drawn as overlays (p50/p95/p99). */
    aggs?: AnalyticsAgg[];
    groupBy?: string;
    max?: number;
    /** Global filter bar fields this chart honours. */
    filters?: string[];
    /** Extra label filters always applied. */
    fixed?: Record<string, string>;
    type?: "line" | "area" | "bar";
    stack?: boolean;
    unit?: string;
    yFormat?: "compact" | "bytes";
    fill?: boolean;
    zoom?: boolean;
    bands?: boolean;
    /** Threshold lines drawn in addition to the saved alert rules, for previews. */
    extraBands?: AlertBand[];
    totalToggle?: boolean;
    noCompare?: boolean;
    height?: number;
  }

  let {
    metric,
    agg = "sum",
    aggs,
    groupBy,
    max,
    filters = ["bot", "shard"],
    fixed = {},
    type = "line",
    stack = false,
    unit = "",
    yFormat = "compact",
    fill = false,
    zoom = false,
    bands = false,
    extraBands = [],
    totalToggle = false,
    noCompare = false,
    height = 220,
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let chart: Chart<Kind, (number | null)[], string> | null = null;
  let loading = $state(true);
  let empty = $state(false);
  let failed = $state(false);
  let total = $state(false);
  let showAll = $state(false);
  let otherNote = $state<{ count: number; names: string } | null>(null);
  let seriesCount = $state(0);
  let pointCount = $state(0);
  let zoomStart = $state(0);
  let zoomEnd = $state(0);
  let bandLines: AlertBand[] = [];
  let serverBands: AlertBand[] = [];
  let seq = 0;

  let fixedKey = $derived(JSON.stringify(fixed));
  let extraKey = $derived(JSON.stringify(extraBands));
  let aggList = $derived(total ? (["sum"] as AnalyticsAgg[]) : (aggs ?? [agg]));

  const bandsPlugin: Plugin<Kind> = {
    id: "analyticsBands",
    afterDatasetsDraw(c) {
      if (!bandLines.length) return;
      const y = c.scales.y;
      const { left, right } = c.chartArea;
      const ctx = c.ctx;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      for (const band of bandLines) {
        const values = [band.threshold, band.thresholdHigh].filter((v): v is number => v !== null && v !== undefined);
        for (const value of values) {
          if (value < y.min || value > y.max) continue;
          const py = y.getPixelForValue(value);
          const color = severityColor(band.severity);
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(left, py);
          ctx.lineTo(right, py);
          ctx.stroke();
          ctx.fillText(`${band.comparator} ${compact(value)}`, right - 4, py - 3);
        }
      }
      ctx.restore();
    },
  };

  function yTick(v: number): string {
    return yFormat === "bytes" ? bytes(v) : compact(v);
  }

  function tipValue(v: number | null): string {
    if (v === null || Number.isNaN(v)) return "—";
    const text = yFormat === "bytes" ? bytes(v) : Math.abs(v) >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2).replace(/\.?0+$/, "");
    const suffix = total || yFormat === "bytes" ? "" : unit ? ` ${unit.replace(/^\/\s*/, "/")}` : "";
    return `${text}${suffix}`;
  }

  function cumulative(result: SeriesResult): SeriesResult {
    return {
      ...result,
      series: result.series.map((s) => {
        let run = 0;
        return { ...s, points: s.points.map((p) => ({ ...p, value: (run += p.value ?? 0) })) };
      }),
    };
  }

  function dataset(label: string, color: string, data: (number | null)[], single: boolean, index: number): Dataset {
    if (type === "bar") {
      return { type: "bar", label, data, backgroundColor: color, borderRadius: stack ? 0 : 3, maxBarThickness: 26, stack: stack ? "s" : undefined } as Dataset;
    }
    const area = type === "area";
    return {
      type: "line",
      label,
      data,
      borderColor: color,
      backgroundColor: area ? `${color}55` : `${color}20`,
      borderWidth: area ? 1 : 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.25,
      fill: area ? (index === 0 ? "origin" : "-1") : fill && single ? "origin" : false,
      stack: area ? "total" : undefined,
      spanGaps: true,
    } as Dataset;
  }

  function build(results: SeriesResult[], prev: SeriesResult | null, f = $analyticsFilters) {
    const primary = results[0];
    const secs = rangeSeconds(f);
    const labels = primary.series[0].points.map((p) => bucketLabel(p.bucketUnix, primary.resolution, secs));
    const datasets: Dataset[] = [];
    const single = !groupBy && aggList.length === 1;

    aggList.forEach((a, ai) => {
      results[ai].series.forEach((s, si) => {
        let name = aggList.length > 1 ? a : s.name;
        if (s.name === "Other" && s.labels?.count) name = `Other (${s.labels.count} more)`;
        const color = aggList.length > 1 ? PALETTE[ai % PALETTE.length] : single ? $colorStore.primary : seriesColor(s.name, si);
        datasets.push(dataset(name, color, s.points.map((p) => p.value), single, datasets.length));
      });
    });

    if (prev?.series.length) {
      datasets.push({
        type: "line",
        label: "Previous period",
        data: prev.series[0].points.map((p) => p.value),
        borderColor: TEXT,
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.25,
      } as Dataset);
    }

    const other = primary.series.find((s) => s.name === "Other" && s.labels?.count);
    otherNote = other ? { count: Number(other.labels.count), names: other.labels.names ?? "" } : null;
    seriesCount = primary.series.length;
    if (labels.length !== pointCount) {
      pointCount = labels.length;
      zoomStart = 0;
      zoomEnd = Math.max(0, labels.length - 1);
    }
    render(labels, datasets, single);
  }

  function render(labels: string[], datasets: Dataset[], single: boolean) {
    if (!canvas) return;
    const stacked = type === "area" || (type === "bar" && stack);
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      const scales = chart.options.scales ?? {};
      if (scales.y) scales.y.stacked = stacked;
      if (scales.x) scales.x.stacked = stacked;
      if (chart.options.plugins?.legend) chart.options.plugins.legend.display = !single;
      applyZoom();
      chart.update();
      return;
    }

    const created = new Chart<Kind, (number | null)[], string>(canvas, {
      type: type === "bar" ? "bar" : "line",
      data: { labels, datasets },
      plugins: [bandsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: !single,
            position: "top",
            align: "end",
            labels: { color: TEXT, boxWidth: 10, boxHeight: 10, font: { size: 11 }, usePointStyle: false },
          },
          tooltip: {
            backgroundColor: SURFACE,
            titleColor: TEXT_STRONG,
            bodyColor: TEXT_STRONG,
            borderColor: GRID,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.dataset.label ?? ""}: ${tipValue(item.parsed.y as number | null)}`,
            },
          },
        },
        scales: {
          x: {
            stacked,
            ticks: { color: TEXT, font: { size: 10 }, autoSkip: true, maxTicksLimit: 12, maxRotation: 0 },
            grid: { color: GRID },
          },
          y: {
            stacked,
            beginAtZero: yFormat !== "bytes",
            ticks: { color: TEXT, font: { size: 10 }, callback: (v) => yTick(Number(v)) },
            grid: { color: GRID },
          },
        },
      },
    });
    chart = created;
    applyZoom();
    created.update("none");
  }

  function applyZoom() {
    if (!chart?.options.scales?.x) return;
    const x = chart.options.scales.x;
    if (zoom && pointCount > 1 && (zoomStart > 0 || zoomEnd < pointCount - 1)) {
      x.min = zoomStart;
      x.max = zoomEnd;
    } else {
      x.min = undefined;
      x.max = undefined;
    }
  }

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    loading = true;
    failed = false;
    try {
      const base = queryParams(f, filters, fixed);
      const requests = aggList.map((a) =>
        analyticsApi.series({ metric, agg: a, groupBy, max: max === undefined ? undefined : showAll ? 0 : max, ...base }),
      );
      const compare = f.compare && !noCompare;
      if (compare) requests.push(analyticsApi.series({ metric, agg: aggList[0], groupBy, max: max === undefined ? undefined : showAll ? 0 : max, ...queryParams(f, filters, fixed, true) }));
      let results = await Promise.all(requests);
      if (my !== seq) return;
      if (total) results = results.map(cumulative);
      const primary = results[0];
      if (!primary.series.length || !primary.series[0].points.length) {
        empty = true;
        chart?.destroy();
        chart = null;
        return;
      }
      empty = false;
      build(results.slice(0, aggList.length), compare ? results[aggList.length] : null, f);
      if (bands) {
        analyticsApi.alertBands(metric).then((b) => {
          if (my !== seq) return;
          serverBands = b ?? [];
          bandLines = [...extraBands, ...serverBands];
          chart?.draw();
        }).catch(() => {});
      }
    } catch (err) {
      if (my !== seq) return;
      logger.warn(`Analytics chart ${metric} failed`, err);
      failed = true;
    } finally {
      if (my === seq) loading = false;
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    if (!chart || !canvas) return;
    const legend = chart.legend as unknown as {
      legendHitBoxes?: { left: number; top: number; width: number; height: number }[];
      legendItems?: { datasetIndex?: number }[];
    };
    const boxes = legend?.legendHitBoxes ?? [];
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = boxes.findIndex((b) => x >= b.left && x <= b.left + b.width && y >= b.top && y <= b.top + b.height);
    if (idx < 0) return;
    const target = legend.legendItems?.[idx]?.datasetIndex;
    if (target === undefined) return;
    const count = chart.data.datasets.length;
    const onlyThis = Array.from({ length: count }, (_, i) => chart!.isDatasetVisible(i) === (i === target)).every(Boolean);
    for (let i = 0; i < count; i++) chart.setDatasetVisibility(i, onlyThis || i === target);
    chart.update();
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, metric, agg, aggs, groupBy, max, fixedKey, total, showAll, filters];
    if (canvas) void load();
  });

  $effect(() => {
    void [zoomStart, zoomEnd];
    if (chart && zoom) {
      applyZoom();
      chart.update("none");
    }
  });

  $effect(() => {
    void extraKey;
    bandLines = [...extraBands, ...serverBands];
    chart?.draw();
  });

  onMount(() => {
    canvas?.addEventListener("contextmenu", onContextMenu);
  });

  onDestroy(() => {
    seq++;
    canvas?.removeEventListener("contextmenu", onContextMenu);
    chart?.destroy();
    chart = null;
  });
</script>

<div class="relative">
  {#if totalToggle}
    <button
      type="button"
      class="absolute -top-8 right-0 min-h-[32px] px-2 rounded text-xs font-mono z-10"
      style="background: {total ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text}"
      title="Running total"
      onclick={() => (total = !total)}
    >Σ</button>
  {/if}
  <div class="relative w-full" style="height: {height}px">
    <canvas bind:this={canvas} class:opacity-30={loading && !empty}></canvas>
    {#if empty || failed}
      <div class="absolute inset-0 flex items-center justify-center text-xs" style="color: {$colorStore.muted}">
        <i class="fa-solid fa-chart-line mr-2"></i>{failed ? "Could not load" : "No data"}
      </div>
    {/if}
  </div>
  {#if zoom && pointCount > 1}
    <div class="flex items-center gap-2 mt-1">
      <input type="range" min="0" max={pointCount - 1} bind:value={zoomStart} class="flex-1 accent-current" style="color: {$colorStore.primary}" aria-label="Zoom start" />
      <input type="range" min="0" max={pointCount - 1} bind:value={zoomEnd} class="flex-1" style="accent-color: {$colorStore.primary}" aria-label="Zoom end" />
    </div>
  {/if}
  {#if otherNote || showAll}
    <div class="flex flex-wrap items-center gap-2 mt-1 text-xs" style="color: {$colorStore.muted}">
      {#if otherNote}
        <span class="truncate max-w-full" title={otherNote.names}>Other = {otherNote.names}</span>
      {/if}
      <button
        type="button"
        class="min-h-[32px] px-2 rounded"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}"
        onclick={() => (showAll = !showAll)}
      >{showAll ? `Top ${max ?? 12} only` : `Show all ${seriesCount - 1 + (otherNote?.count ?? 0)} series`}</button>
    </div>
  {/if}
</div>
