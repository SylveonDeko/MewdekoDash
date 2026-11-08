<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import OverflowMenu from "./OverflowMenu.svelte";
  import type { MenuItem } from "../ticketModel";

  interface Props {
    title: string;
    subtitle?: string;
    badges?: string[];
    dimmed?: boolean;
    mono?: boolean;
    onopen?: () => void;
    menu?: MenuItem[];
    menuLabel?: string;
    leading?: Snippet;
    trailing?: Snippet;
  }

  let { title, subtitle = "", badges = [], dimmed = false, mono = false, onopen, menu = [], menuLabel = "", leading, trailing }: Props = $props();
</script>

<div
  class="flex items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3"
  class:opacity-60={dimmed}
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  {@render leading?.()}

  {#snippet body()}
    <span class="block text-sm font-semibold truncate {mono ? 'font-mono' : ''}" style="color: {$colorStore.text}">{title}</span>
    {#if subtitle}
      <span class="block text-sm truncate" style="color: {$colorStore.muted}">{subtitle}</span>
    {/if}
    {#if badges.length > 0}
      <span class="flex flex-wrap items-center gap-1.5 mt-1">
        {#each badges as badge (badge)}
          <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
        {/each}
      </span>
    {/if}
  {/snippet}

  {#if onopen}
    <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={onopen}>
      {@render body()}
    </button>
  {:else}
    <div class="grow min-w-0 min-h-[44px] flex flex-col justify-center">
      {@render body()}
    </div>
  {/if}

  {@render trailing?.()}
  {#if menu.length > 0}
    <OverflowMenu items={menu} ariaLabel={menuLabel} />
  {/if}
</div>
