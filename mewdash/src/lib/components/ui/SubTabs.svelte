<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Tab {
    id: string;
    label: string;
    icon?: string;
  }

  interface Props {
    tabs: Tab[];
    active: string;
    ariaLabel?: string;
    onselect?: (id: string) => void;
  }

  let { tabs, active = $bindable(), ariaLabel, onselect }: Props = $props();

  function select(id: string) {
    active = id;
    onselect?.(id);
  }
</script>

<div
  class="sub-tabs flex gap-1 overflow-x-auto overflow-y-hidden max-w-full"
  style="box-shadow: inset 0 -1px 0 {$colorStore.primary}20;"
  role="group"
  aria-label={ariaLabel}
>
  {#each tabs as tab (tab.id)}
    {@const selected = active === tab.id}
    <button
      type="button"
      aria-pressed={selected}
      class="flex items-center gap-2 px-3 min-h-[44px] border-b-2 text-sm font-medium whitespace-nowrap shrink-0"
      style="border-color: {selected ? $colorStore.primary : 'transparent'}; color: {selected ? $colorStore.text : $colorStore.muted};"
      onclick={() => select(tab.id)}
    >
      {#if tab.icon}
        <i class="fa-solid {tab.icon} shrink-0" aria-hidden="true"></i>
      {/if}
      {tab.label}
    </button>
  {/each}
</div>

<style>
  .sub-tabs {
    scrollbar-width: none;
  }

  .sub-tabs::-webkit-scrollbar {
    display: none;
  }
</style>
