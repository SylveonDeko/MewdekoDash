<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { rangeOptions } from "$lib/components/stats/format";

  interface Props {
    value: number;
    onchange: (value: number) => void;
  }

  let { value, onchange }: Props = $props();
</script>

<div class="grid grid-cols-4 gap-2" role="group" aria-label={m.common.timeWindow()}>
  {#each rangeOptions as option (option.value)}
    <button
      type="button"
      class="min-h-[44px] rounded-lg border text-sm font-medium"
      style="background: {value === option.value ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {value === option.value ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
      aria-pressed={value === option.value}
      onclick={() => onchange(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
