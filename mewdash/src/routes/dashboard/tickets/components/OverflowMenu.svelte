<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { MenuItem } from "../ticketModel";

  interface Props {
    items: MenuItem[];
    ariaLabel: string;
  }

  let { items, ariaLabel }: Props = $props();

  let open = $state(false);
  let root = $state<HTMLElement>();

  const visible = $derived(items.filter(item => !item.hidden));

  function pick(item: MenuItem) {
    open = false;
    item.onclick();
  }

  function outside(event: Event) {
    if (open && root && !root.contains(event.target as Node)) open = false;
  }

  function key(event: KeyboardEvent) {
    if (open && event.key === "Escape") {
      event.stopPropagation();
      open = false;
    }
  }
</script>

<svelte:window onclick={outside} onkeydown={key} />

<div class="relative shrink-0" bind:this={root}>
  <button
    type="button"
    class="rounded-lg min-h-[44px] min-w-[44px]"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label={ariaLabel}
    onclick={() => (open = !open)}
  >
    <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
  </button>
  {#if open}
    <div
      class="absolute right-0 top-full mt-1 z-20 rounded-xl border p-1 min-w-[11rem] shadow-lg"
      style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;"
      role="menu"
    >
      {#each visible as item (item.label)}
        <button
          type="button"
          role="menuitem"
          class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3"
          style="color: {$colorStore.text}"
          onclick={() => pick(item)}
        >
          <i class="fa-solid {item.icon} w-4" aria-hidden="true"></i>{item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
