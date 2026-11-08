<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    subtitle?: string;
    removeLabel: string;
    onremove: () => void;
  }

  let { title, subtitle, removeLabel, onremove }: Props = $props();
</script>

<div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <div class="grow min-w-0 px-1 py-1">
    <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{title}</span>
    {#if subtitle}
      <span class="block text-sm truncate" style="color: {$colorStore.muted}">{subtitle}</span>
    {/if}
  </div>
  <button
    type="button"
    class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    aria-label={removeLabel}
    onclick={onremove}
  >
    <i class="fa-solid fa-trash" aria-hidden="true"></i>
  </button>
</div>
