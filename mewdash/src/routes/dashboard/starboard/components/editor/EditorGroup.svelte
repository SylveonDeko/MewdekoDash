<script lang="ts">
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    /** How many settings inside differ from their default, shown while collapsed. */
    count?: number;
    open?: boolean;
    children: Snippet;
  }

  let { title, count = 0, open = $bindable(false), children }: Props = $props();
</script>

<div class="rounded-xl border" style="border-color: {$colorStore.primary}20;">
  <button
    type="button"
    class="w-full min-h-[50px] flex items-center gap-3 px-4 text-left rounded-xl"
    style="background: {$colorStore.primary}08;"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class="flex-1 text-sm font-medium" style="color: {$colorStore.text}">{title}</span>
    {#if count > 0}
      <span
        class="text-xs px-2 py-0.5 rounded-full font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text};"
      >
        {m.common.setCount({ count })}
      </span>
    {/if}
    <i
      class="fa-solid {open ? 'fa-chevron-up' : 'fa-chevron-down'}"
      style="color: {$colorStore.muted}; font-size: 12px;"
      aria-hidden="true"
    ></i>
  </button>

  {#if open}
    <div class="p-4 space-y-4 border-t" style="border-color: {$colorStore.primary}20;" transition:slide={{ duration: 150 }}>
      {@render children()}
    </div>
  {/if}
</div>
