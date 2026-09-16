<!-- lib/components/stats/WindowPicker.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  export interface WindowOption {
    value: number;
    label: string;
  }

  interface Props {
    /** The selected value. */
    value: number;
    options: WindowOption[];
    ariaLabel?: string;
    onchange?: (value: number) => void;
  }

  let { value = $bindable(), options, ariaLabel = "Time window", onchange }: Props = $props();

  function pick(next: number) {
    value = next;
    onchange?.(next);
  }
</script>

<div class="inline-flex rounded-lg p-1 gap-1" style="background: {$colorStore.primary}10;" role="group" aria-label={ariaLabel}>
  {#each options as option}
    <button
      type="button"
      class="px-3 min-h-[36px] rounded-md text-sm font-medium transition-colors"
      style="background: {value === option.value ? $colorStore.primary : 'transparent'};
             color: {value === option.value ? '#fff' : $colorStore.text};"
      aria-pressed={value === option.value}
      onclick={() => pick(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
