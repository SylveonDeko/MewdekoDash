<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { RowAction } from "./pollModel";

  interface Props {
    /** What the row is, for the buttons' accessible names. */
    name: string;
    actions: RowAction[];
    moreLabel: string;
  }

  let { name, actions, moreLabel }: Props = $props();

  let open = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  function outside(event: PointerEvent) {
    if (open && menuEl && !menuEl.contains(event.target as Node)) open = false;
  }

  function pick(action: RowAction) {
    open = false;
    action.run();
  }

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<svelte:window onpointerdown={outside} onkeydown={(e) => { if (e.key === "Escape") open = false; }} />

<div class="sm:hidden shrink-0" bind:this={menuEl}>
  <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-expanded={open}
          aria-label="{moreLabel}: {name}" onclick={() => (open = !open)}>
    <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
  </button>
  {#if open}
    <div class="absolute right-2 top-full mt-1 z-20 rounded-xl border p-1 min-w-[10rem] shadow-lg"
         style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;">
      {#each actions as action (action.label)}
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3"
                style="color: {$colorStore.text}" onclick={() => pick(action)}>
          <i class="fa-solid {action.icon} w-4" aria-hidden="true"></i>{action.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<div class="hidden sm:flex items-center justify-end gap-2 shrink-0">
  {#each actions as action (action.label)}
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton}
            aria-label="{action.label}: {name}" title={action.label} onclick={action.run}>
      <i class="fa-solid {action.icon}" aria-hidden="true"></i>
    </button>
  {/each}
</div>
