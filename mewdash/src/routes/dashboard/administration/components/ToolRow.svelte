<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    subtitle?: string;
    badges?: string[];
    onopen?: () => void;
    actions?: Snippet;
  }

  let { title, subtitle = "", badges = [], onopen, actions }: Props = $props();
</script>

{#snippet text()}
  <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{title}</span>
  {#if subtitle}
    <span class="block text-sm truncate" style="color: {$colorStore.muted}">{subtitle}</span>
  {/if}
  {#if badges.length}
    <span class="flex flex-wrap items-center gap-1.5 mt-1">
      {#each badges as badge (badge)}
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
      {/each}
    </span>
  {/if}
{/snippet}

<div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  {#if onopen}
    <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={onopen}>
      {@render text()}
    </button>
  {:else}
    <div class="grow min-w-0 px-1 py-1">
      {@render text()}
    </div>
  {/if}
  {#if actions}
    <div class="shrink-0 flex items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</div>
