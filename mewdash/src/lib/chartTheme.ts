import { Chart, Legend, Tooltip } from "chart.js";
import { browser } from "$app/environment";
import { colorStore } from "$lib/stores/colorStore";
import { themeStore, type ThemeName } from "$lib/stores/themeStore";
import { GRID, SURFACE, TEXT, TEXT_STRONG } from "$lib/components/analytics/palette";

/**
 * Chart.js paints tooltips, ticks, grid lines and legends onto the canvas, so
 * the CSS theme cannot reach them. This module owns those colours instead: it
 * sets Chart.js global defaults from the guild palette and the active theme,
 * and re-applies them to every mounted chart whenever either changes. Charts
 * must not hard-code tooltip or legend colours or they will shadow these.
 */

type RGB = [number, number, number];

/** Near-black night base shared with the aero stylesheet. */
const NIGHT: RGB = [3, 16, 31];

function parseHex(value: string): RGB | null {
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const num = parseInt(match[1], 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Linear RGB mix of `a` toward `b` by `t` in 0..1. */
function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ChartSurface {
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipTitle: string;
  tooltipBody: string;
  tick: string;
  grid: string;
  legend: string;
}

/** Resolves the surface colours for the current theme and palette. */
function surfaceFor(theme: ThemeName, primary: string, muted: string, text: string): ChartSurface {
  if (theme !== "aero") {
    return {
      tooltipBackground: SURFACE,
      tooltipBorder: GRID,
      tooltipTitle: TEXT_STRONG,
      tooltipBody: TEXT_STRONG,
      tick: muted || TEXT,
      grid: GRID,
      legend: text || TEXT_STRONG,
    };
  }

  const p = parseHex(primary) ?? [59, 130, 246];
  const light = mix(p, [255, 255, 255], 0.55);
  const deep = mix(p, NIGHT, 0.72);

  return {
    tooltipBackground: rgba(deep, 0.96),
    tooltipBorder: rgba(light, 0.42),
    tooltipTitle: "#f3f9ff",
    tooltipBody: "#e2eefb",
    tick: muted || "#c9deef",
    grid: rgba(light, 0.1),
    legend: text || "#f3f9ff",
  };
}

function applyChartTheme(surface: ChartSurface, theme: ThemeName) {
  const tooltip = Chart.defaults.plugins.tooltip;
  tooltip.backgroundColor = surface.tooltipBackground;
  tooltip.borderColor = surface.tooltipBorder;
  tooltip.borderWidth = 1;
  tooltip.titleColor = surface.tooltipTitle;
  tooltip.bodyColor = surface.tooltipBody;
  tooltip.cornerRadius = theme === "aero" ? 10 : 6;
  tooltip.padding = theme === "aero" ? 10 : 8;
  tooltip.boxPadding = 4;

  Chart.defaults.color = surface.tick;
  Chart.defaults.borderColor = surface.grid;
  Chart.defaults.plugins.legend.labels.color = surface.legend;

  for (const chart of Object.values(Chart.instances)) {
    chart.update("none");
  }
}

let started = false;

/**
 * Starts syncing Chart.js defaults with the palette and theme. Safe to call
 * more than once; only the first call subscribes.
 */
export function initChartTheme() {
  if (!browser || started) return;
  started = true;

  /* The tooltip and legend default objects only exist once their plugins are
     registered, and the chart components register them lazily on mount. */
  Chart.register(Tooltip, Legend);

  let theme: ThemeName = themeStore.current;
  let palette = colorStore.current;

  const push = () => applyChartTheme(surfaceFor(theme, palette.primary, palette.muted, palette.text), theme);

  themeStore.subscribe((next) => {
    theme = next;
    push();
  });
  colorStore.subscribe((next) => {
    palette = next;
    push();
  });
}
