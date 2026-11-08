<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    items: Array<{ key: string; label: string; removeLabel: string }>;
    onremove: (key: string) => void;
    disabled?: boolean;
  }

  let { items, onremove, disabled = false }: Props = $props();
</script>

{#if items.length > 0}
  <div class="flex flex-wrap gap-2">
    {#each items as item (item.key)}
      <span
        class="inline-flex items-center max-w-full pl-3 rounded-lg text-sm min-h-[44px]"
        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
      >
        <span class="truncate">{item.label}</span>
        <button
          type="button"
          class="min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
          style="color: {$colorStore.muted}"
          aria-label={item.removeLabel}
          {disabled}
          onclick={() => onremove(item.key)}
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>
    {/each}
  </div>
{/if}
