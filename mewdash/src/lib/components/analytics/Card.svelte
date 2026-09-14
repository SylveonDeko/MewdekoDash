<!-- lib/components/analytics/Card.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    note?: string;
    class?: string;
    actions?: Snippet;
    children: Snippet;
  }

  let { title, note, class: className = "", actions, children }: Props = $props();
</script>

<div
  class="rounded-xl border p-4 {className}"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  {#if title || note || actions}
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      {#if title}
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{title}</h4>
      {/if}
      <div class="flex items-center gap-2">
        {#if note}
          <span class="text-xs" style="color: {$colorStore.muted}">{note}</span>
        {/if}
        {@render actions?.()}
      </div>
    </div>
  {/if}
  {@render children()}
</div>
