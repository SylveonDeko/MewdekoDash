<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    subtitle: string;
    removeLabel: string;
    badges?: string[];
    lead?: Snippet;
    onopen?: () => void;
    onremove: () => void;
  }

  let { title, subtitle, removeLabel, badges = [], lead, onopen, onremove }: Props = $props();
</script>

{#snippet text()}
  <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{title}</span>
  <span class="block text-sm truncate" style="color: {$colorStore.muted}">{subtitle}</span>
  {#if badges.length}
    <span class="flex flex-wrap items-center gap-1.5 mt-1">
      {#each badges as badge (badge)}
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
      {/each}
    </span>
  {/if}
{/snippet}

<div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  {#if lead}
    <div class="shrink-0 pl-1">{@render lead()}</div>
  {/if}
  {#if onopen}
    <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={onopen}>
      {@render text()}
    </button>
  {:else}
    <div class="grow min-w-0 px-1 py-1">
      {@render text()}
    </div>
  {/if}
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
