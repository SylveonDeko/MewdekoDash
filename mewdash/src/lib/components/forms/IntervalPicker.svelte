<!-- lib/IntervalPicker.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, onMount } from "svelte";
    import {fade} from "svelte/transition";

  interface Props {
    onchange?: (endTime: Date) => void;
  }

  let { onchange }: Props = $props();

  let days: number = $state(0);
  let hours: number = $state(0);
  let minutes: number = $state(0);
  let seconds: number = $state(0);

  let totalDurationMs =
    $derived(((days * 24 + hours) * 60 * 60 + minutes * 60 + seconds) * 1000);

    let endTime: Date = $derived(new Date(Date.now() + totalDurationMs));
  let intervalId: NodeJS.Timeout;

  function startInterval() {
    intervalId = setInterval(() => {
      endTime = new Date(Date.now() + totalDurationMs);
      onchange?.(endTime);
    }, 1000);
  }

  function stopInterval() {
    if (intervalId) clearInterval(intervalId);
  }

  onMount(() => {
    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    endTime = new Date(Date.now() + totalDurationMs);
    onchange?.(endTime);
    startInterval();
  });

  onDestroy(() => {
    stopInterval();
  });

  function validateInput(
    event: Event,
    unit: "days" | "hours" | "minutes" | "seconds",
  ) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);

    if (isNaN(value) || value < 0) value = 0;
    if (unit === "hours" && value > 23) value = 23;
    else if ((unit === "minutes" || unit === "seconds") && value > 59) value = 59;

    input.value = value.toString();

    switch (unit) {
      case "days": days = value; break;
      case "hours": hours = value; break;
      case "minutes": minutes = value; break;
      case "seconds": seconds = value; break;
    }

    endTime = new Date(Date.now() + totalDurationMs);
    onchange?.(endTime);
  }

  let durationText = $derived([
    days > 0 ? m.common.daysShort({ count: days }) : null,
    hours > 0 ? m.common.hoursShort({ count: hours }) : null,
    minutes > 0 ? m.common.minutesShort({ count: minutes }) : null,
    seconds > 0 ? m.widgets.intervalSecondsShort({ count: seconds }) : null,
  ].filter(Boolean).join(' ') || m.widgets.intervalSecondsShort({ count: 0 }));

  // Generate unique ID for fieldset
  const fieldsetId = `interval-picker-${Math.random().toString(36).substr(2, 9)}`;
  const liveRegionId = `${fieldsetId}-live`;
</script>

<div
  class=" rounded-xl border p-6 relative overflow-hidden"
  style="background: linear-gradient(135deg, var(--color-primary)08, var(--color-secondary)08);
         border-color: var(--color-primary)20;"
  transition:fade
  aria-labelledby="{fieldsetId}-legend"
  role="group"
>
  <!-- Background decoration -->
  <div
    class="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-10"
    style="background: var(--color-primary);"
  ></div>

  <div class="relative space-y-6">
    <!-- Live region for duration updates -->
    <div aria-atomic="true" aria-live="polite" class="sr-only" id="{liveRegionId}">
      {m.widgets.intervalLiveRegion({ duration: durationText, end: endTime.toLocaleString() })}
    </div>

    <!-- Duration units -->
    <fieldset class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <legend class="sr-only" id="{fieldsetId}-legend">{m.widgets.intervalLegend()}</legend>
      {#each [
        { label: m.common.days(), value: days, unit: 'days', icon: 'fa-calendar', max: undefined },
        { label: m.common.hours(), value: hours, unit: 'hours', icon: 'fa-clock', max: 23 },
        { label: m.common.minutes(), value: minutes, unit: 'minutes', icon: 'fa-clock', max: 59 },
        { label: m.widgets.intervalSeconds(), value: seconds, unit: 'seconds', icon: 'fa-hourglass', max: 59 }
      ] as { label, value, unit, icon, max }}
        <div class="group relative">
          <div class="absolute inset-0 rounded-lg transition-transform group-focus-within:scale-95"
               style="background: var(--color-primary)10;"></div>
          <div class="relative space-y-1.5">
            <label
              for="interval-{unit}"
              class="flex items-center gap-1.5 text-xs font-medium ml-1"
              style="color: var(--color-muted)"
            >
              <i class="{icon}" style="font-size: 14px;"></i>
              {label}
            </label>
            <input
              id="interval-{unit}"
              type="number"
              min="0"
              max={max}
              inputmode="numeric"
              pattern="[0-9]*"
              value={value}
              oninput={(e) => validateInput(e, unit as "days" | "hours" | "minutes" | "seconds")}
              class="w-full px-3 py-2.5 rounded-lg border-2 bg-transparent text-center text-lg font-medium
                     focus:outline-hidden transition-all duration-200"
              style="border-color: var(--color-primary)20;
                     color: var(--color-text);
                     focus:border-color: var(--color-primary);"
              aria-describedby="{fieldsetId}-description"
              aria-label={m.common.labelValue({ label, value })}
            >
          </div>
        </div>
      {/each}
    </fieldset>

    <!-- Instructions for screen readers -->
    <div class="sr-only" id="{fieldsetId}-description">
      {m.widgets.intervalInstructions()}
    </div>

    <!-- Duration summary -->
    <div
      aria-label={m.widgets.intervalSummaryLabel()}
      class="flex items-center gap-3 p-3 rounded-lg"
      role="status"
      style="background: var(--color-primary)10;"
    >
      <div class="flex items-center gap-2" style="color: var(--color-muted)">
        <i aria-hidden="true" class="fa-solid fa-calendar" style="color: var(--color-primary); font-size: 16px;"></i>
        <span class="text-sm">{m.widgets.intervalDuration()}</span>
      </div>
      <div class="flex-1">
        <span aria-label={m.widgets.intervalTotalLabel({ duration: durationText })} class="text-sm font-medium" style="color: var(--color-text)">
          {durationText}
        </span>
      </div>
      <div aria-hidden="true" class="h-4 w-px" style="background: var(--color-primary)20;"></div>
      <div class="flex items-center gap-2" style="color: var(--color-muted)">
        <i aria-hidden="true" class="fa-solid fa-clock" style="color: var(--color-secondary); font-size: 16px;"></i>
        <span class="text-sm">{m.widgets.intervalEnds()}</span>
      </div>
      <div>
        <span aria-label={m.widgets.intervalEndLabel({ end: endTime.toLocaleString() })} class="text-sm font-medium"
              style="color: var(--color-text)">
          {endTime.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
    @reference '../../../app.css';

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  [style*="background"],
  [style*="color"],
  [style*="border-color"] {
    @apply transition-colors duration-300;
  }

  /* Input focus effect */
  input:focus {
    box-shadow: 0 0 0 2px var(--color-primary)20;
  }

  /* Screen reader only content */
  .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
  }
</style>