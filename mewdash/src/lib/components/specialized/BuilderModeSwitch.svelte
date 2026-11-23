<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { BuilderMode } from "$lib/embedbuilder/mode.svelte";

  interface Props {
    mode: BuilderMode;
    onchange: (mode: BuilderMode) => void;
  }

  let { mode, onchange }: Props = $props();

  const options = $derived([
    { id: "simple" as const, name: m.embedbuilder.modeSimple() },
    { id: "advanced" as const, name: m.common.advanced() }
  ]);
</script>

<div class="grid grid-cols-2 gap-2 w-full sm:w-auto" role="group" aria-label={m.embedbuilder.modeAria()} data-tour="mode">
  {#each options as option (option.id)}
    <button
      type="button"
      class="min-h-[44px] px-4 rounded-lg border text-sm font-medium"
      style="background: {mode === option.id ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {mode === option.id ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
      aria-pressed={mode === option.id}
      onclick={() => onchange(option.id)}
    >
      {option.name}
    </button>
  {/each}
</div>
