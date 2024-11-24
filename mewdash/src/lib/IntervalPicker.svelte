<!-- lib/IntervalPicker.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount, onDestroy } from "svelte";

  const dispatch = createEventDispatcher();

  // Initialize time units
  let days: number = 0;
  let hours: number = 0;
  let minutes: number = 0;
  let seconds: number = 0;

  // Total duration in milliseconds
  $: totalDurationMs =
    ((days * 24 + hours) * 60 * 60 + minutes * 60 + seconds) * 1000;

  // End time, updated every second
  let endTime: Date = new Date(Date.now() + totalDurationMs);

  let intervalId: NodeJS.Timeout;

  // Update endTime every second
  function startInterval() {
    intervalId = setInterval(() => {
      endTime = new Date(Date.now() + totalDurationMs);
      dispatch("change", endTime);
    }, 1000);
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
    }
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

  // Validate inputs to prevent negative values and to conform to maximum values
  function validateInput(
    event: Event,
    unit: "days" | "hours" | "minutes" | "seconds",
  ) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);

    if (isNaN(value) || value < 0) {
      value = 0;
    }

    if (unit === "hours" && value > 23) {
      value = 23;
    } else if ((unit === "minutes" || unit === "seconds") && value > 59) {
      value = 59;
    }

    input.value = value.toString();

    switch (unit) {
      case "days":
        days = value;
        break;
      case "hours":
        hours = value;
        break;
      case "minutes":
        minutes = value;
        break;
      case "seconds":
        seconds = value;
        break;
    }

    // Update endTime immediately when inputs change
    endTime = new Date(Date.now() + totalDurationMs);
    dispatch("change", endTime);
  }
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div class="flex flex-col">
      <label for="days-input" class="mb-2 font-medium text-gray-300">Days</label
      >
      <input
        id="days-input"
        type="number"
        min="0"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:value={days}
        on:input={(e) => validateInput(e, "days")}
        class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Days"
      />
    </div>
    <div class="flex flex-col">
      <label for="hours-input" class="mb-2 font-medium text-gray-300"
        >Hours</label
      >
      <input
        id="hours-input"
        type="number"
        min="0"
        max="23"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:value={hours}
        on:input={(e) => validateInput(e, "hours")}
        class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Hours"
      />
    </div>
    <div class="flex flex-col">
      <label for="minutes-input" class="mb-2 font-medium text-gray-300"
        >Minutes</label
      >
      <input
        id="minutes-input"
        type="number"
        min="0"
        max="59"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:value={minutes}
        on:input={(e) => validateInput(e, "minutes")}
        class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Minutes"
      />
    </div>
    <div class="flex flex-col">
      <label for="seconds-input" class="mb-2 font-medium text-gray-300"
        >Seconds</label
      >
      <input
        id="seconds-input"
        type="number"
        min="0"
        max="59"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:value={seconds}
        on:input={(e) => validateInput(e, "seconds")}
        class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Seconds"
      />
    </div>
  </div>
  <div class="mt-6 text-gray-300">
    <p>
      Giveaway will end at:
      <span class="font-semibold">
        {endTime.toLocaleString()}
      </span>
    </p>
  </div>
</div>

<style>
  /* Hide the spin buttons on number inputs */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
