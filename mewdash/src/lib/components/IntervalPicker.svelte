<!-- lib/IntervalPicker.svelte -->
<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { Calendar, Clock, Clock3, Timer } from "lucide-svelte";
  import { fade } from "svelte/transition";

  const dispatch = createEventDispatcher();

  let days: number = 0;
  let hours: number = 0;
  let minutes: number = 0;
  let seconds: number = 0;

  $: totalDurationMs =
    ((days * 24 + hours) * 60 * 60 + minutes * 60 + seconds) * 1000;

  let endTime: Date = new Date(Date.now() + totalDurationMs);
  let intervalId: NodeJS.Timeout;

  function startInterval() {
    intervalId = setInterval(() => {
      endTime = new Date(Date.now() + totalDurationMs);
      dispatch("change", endTime);
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
    dispatch("change", endTime);
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
    dispatch("change", endTime);
  }

  $: durationText = [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
  ].filter(Boolean).join(' ') || '0s';
</script>

<div
  class="backdrop-blur-sm rounded-xl border p-6 relative overflow-hidden"
  style="background: linear-gradient(135deg, var(--color-primary)08, var(--color-secondary)08);
         border-color: var(--color-primary)20;"
  transition:fade
>
  <!-- Background decoration -->
  <div
    class="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-10"
    style="background: var(--color-primary);"
  ></div>

  <div class="relative space-y-6">
    <!-- Duration units -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each [
        { label: 'Days', value: days, unit: 'days', icon: Calendar, max: undefined },
        { label: 'Hours', value: hours, unit: 'hours', icon: Clock, max: 23 },
        { label: 'Minutes', value: minutes, unit: 'minutes', icon: Clock3, max: 59 },
        { label: 'Seconds', value: seconds, unit: 'seconds', icon: Timer, max: 59 }
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
              <svelte:component this={icon} class="w-3.5 h-3.5" />
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
              on:input={(e) => validateInput(e, unit)}
              class="w-full px-3 py-2.5 rounded-lg border-2 bg-transparent text-center text-lg font-medium
                     focus:outline-none transition-all duration-200"
              style="border-color: var(--color-primary)20;
                     color: var(--color-text);
                     focus:border-color: var(--color-primary);"
            />
          </div>
        </div>
      {/each}
    </div>

    <!-- Duration summary -->
    <div class="flex items-center gap-3 p-3 rounded-lg"
         style="background: var(--color-primary)10;">
      <div class="flex items-center gap-2" style="color: var(--color-muted)">
        <Calendar class="w-4 h-4" style="color: var(--color-primary)" />
        <span class="text-sm">Duration:</span>
      </div>
      <div class="flex-1">
        <span class="text-sm font-medium" style="color: var(--color-text)">
          {durationText}
        </span>
      </div>
      <div class="h-4 w-px" style="background: var(--color-primary)20;"></div>
      <div class="flex items-center gap-2" style="color: var(--color-muted)">
        <Clock class="w-4 h-4" style="color: var(--color-secondary)" />
        <span class="text-sm">Ends:</span>
      </div>
      <div>
        <span class="text-sm font-medium" style="color: var(--color-text)">
          {endTime.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
</div>

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
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
</style>