<!-- lib/components/analytics/Card.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { getContext, setContext, type Snippet } from "svelte";

  interface Props {
    title?: string;
    note?: string;
    class?: string;
    actions?: Snippet;
    children: Snippet;
  }

  let { title, note, class: className = "", actions, children }: Props = $props();

  const parent = getContext<"card" | "sheet" | undefined>("surface");
  setContext("surface", "card");

  const layout = $derived(
    parent === "card"
      ? { class: "pl-3 sm:pl-4 border-l-2", style: `border-color: ${$colorStore.primary}60;` }
      : parent === "sheet"
        ? { class: "pt-4 border-t first:pt-0 first:border-t-0", style: `border-color: ${$colorStore.primary}20;` }
        : { class: "rounded-xl border p-4", style: `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}20;` }
  );
</script>

<div class="{layout.class} {className}" style={layout.style}>
  {#if title || note || actions}
    <div class="flex flex-wrap items-center gap-x-2 gap-y-2 mb-2">
      {#if title}
        <h4 class="{parent === 'card' ? 'text-base font-semibold' : 'text-sm font-medium'}" style="color: {$colorStore.text}">{title}</h4>
      {/if}
      {#if note}
        <span class="text-xs sm:ml-auto" style="color: {$colorStore.muted}">{note}</span>
      {/if}
      {#if actions}
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto {note ? '' : 'sm:ml-auto'}">
          {@render actions()}
        </div>
      {/if}
    </div>
  {/if}
  {@render children()}
</div>
