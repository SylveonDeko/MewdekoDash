<!-- lib/components/StatsGraph.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GraphStatsResponse } from "$lib/types/models.ts";

  export let data: GraphStatsResponse;
  export let type: "join" | "leave" = "join";

  let canvas: HTMLCanvasElement;
  let width = 0;
  let height = 0;
  let resizeObserver: ResizeObserver;

  function draw() {
    if (data === undefined)
      return;
    if (data.summary === undefined)
      return;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 50
    };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const maxCount = Math.max(...data.dailyStats.map(d => d.count), 5);
    const yScale = chartHeight / maxCount;
    const xScale = chartWidth / (data.dailyStats.length - 1);

    // Draw grid
    ctx.strokeStyle = `${$colorStore.primary}20`;
    ctx.lineWidth = 1;

    // Y-axis grid and labels
    const yStep = maxCount <= 10 ? 1 : Math.ceil(maxCount / 10);
    for (let i = 0; i <= maxCount; i += yStep) {
      const y = height - padding.bottom - (i * yScale);

      // Grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = $colorStore.muted;
      ctx.font = "12px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(i.toString(), padding.left - 10, y + 4);
    }

    // Draw gradient area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, `${$colorStore.primary}20`);
    gradient.addColorStop(1, `${$colorStore.primary}05`);

    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);

    // Draw lines and area
    data.dailyStats.forEach((point, i) => {
      const x = padding.left + (i * xScale);
      const y = height - padding.bottom - (point.count * yScale);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prev = data.dailyStats[i - 1];
        const prevX = padding.left + ((i - 1) * xScale);
        const prevY = height - padding.bottom - (prev.count * yScale);

        // Control points for smooth curve
        const cp1x = prevX + (x - prevX) * 0.5;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) * 0.5;
        const cp2y = y;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }

      // X-axis labels
      ctx.save();
      ctx.fillStyle = $colorStore.muted;
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      const date = new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      ctx.translate(x, height - padding.bottom + 20);
      ctx.rotate(Math.PI / 4);
      ctx.fillText(date, 0, 0);
      ctx.restore();
    });

    // Close and fill the area
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the line again on top
    ctx.beginPath();
    data.dailyStats.forEach((point, i) => {
      const x = padding.left + (i * xScale);
      const y = height - padding.bottom - (point.count * yScale);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prev = data.dailyStats[i - 1];
        const prevX = padding.left + ((i - 1) * xScale);
        const prevY = height - padding.bottom - (prev.count * yScale);

        const cp1x = prevX + (x - prevX) * 0.5;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) * 0.5;
        const cp2y = y;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    });

    ctx.strokeStyle = $colorStore.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    data.dailyStats.forEach((point, i) => {
      const x = padding.left + (i * xScale);
      const y = height - padding.bottom - (point.count * yScale);

      ctx.beginPath();
      ctx.fillStyle = $colorStore.primary;
      ctx.strokeStyle = $colorStore.gradientStart;
      ctx.lineWidth = 2;
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  function handleResize(entries: ResizeObserverEntry[]) {
    const entry = entries[0];
    if (!entry) return;

    const rect = entry.contentRect;
    width = rect.width;
    height = rect.height;

    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      draw();
    }
  }

  onMount(() => {
    resizeObserver = new ResizeObserver(handleResize);
    if (canvas?.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  $: if (canvas && data && width && height) {
    draw();
  }
</script>

{#if data && data !== undefined}
  <div class="space-y-6">
    <!-- Stats Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">Total {type === 'join' ? 'Joins' : 'Leaves'}</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">{data.summary.total}</div>
      </div>

      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">Average per Day</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">{data.summary.average.toFixed(2)}</div>
      </div>

      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10">
        <div class="text-sm" style="color: {$colorStore.muted}">Peak Day</div>
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">
          {new Date(data.summary.peakDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          <span class="text-sm" style="color: {$colorStore.muted}">({data.summary.peakCount})</span>
        </div>
      </div>
    </div>

    <!-- Graph -->
    <div class="w-full h-[300px] relative">
      <canvas
        bind:this={canvas}
        class="w-full h-full"
      />
    </div>
  </div>
{/if}